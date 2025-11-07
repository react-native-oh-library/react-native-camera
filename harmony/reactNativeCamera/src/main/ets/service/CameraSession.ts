/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import camera from '@ohos.multimedia.camera';
import Logger from '../utils/Logger';
import { PhotoFile, Point, TakePhotoOptions } from '../core/CameraConfig';
import { media } from '@kit.MediaKit';
import { Context } from '@kit.AbilityKit';
import { BusinessError } from '@ohos.base';
import fs from '@ohos.file.fs';
import { CameraPosition, Orientation, PhysicalCameraDeviceType, VideoStabilizationMode } from '../core/CameraEnumBox';
import { CameraDeviceFormat, CameraDeviceInfo } from '../core/CameraDeviceInfo';
import { display } from '@kit.ArkUI';
import { RecordVideoOptions } from '../types/VideoFile';
import { CameraCaptureError } from '../types/CameraError';
import { RNOHContext } from '@rnoh/react-native-openharmony/ts';
import geoLocationManager from '@ohos.geoLocationManager';
import { photoAccessHelper } from '@kit.MediaLibraryKit';
import { TempCameraProps } from '../types/TempCameraProp';
import { image } from '@kit.ImageKit';
import { util } from '@kit.ArkTS';
import deviceinfo from '@ohos.deviceInfo';

declare function getContext(component?: Object | undefined): Context;

const TAG: string = 'RNCameraSession'

type ZoomRangeType = [number, number];


export default class CameraSession {
  context: Context = undefined;
  phAccessHelper: photoAccessHelper.PhotoAccessHelper = undefined;
  private cameraManager?: camera.CameraManager;
  private camerasArray?: Array<camera.CameraDevice>;
  private cameraInput?: camera.CameraInput;
  private mediaModel: camera.SceneMode = camera.SceneMode.NORMAL_PHOTO;
  private capability?: camera.CameraOutputCapability;
  private localDisplay?: display.Display;
  rect = {
    surfaceWidth: 1216, surfaceHeight: 2224
  };

  private photoSession?: camera.PhotoSession;

  private previewOutput: camera.PreviewOutput = undefined;
  private photoOutPut?: camera.PhotoOutput;
  private photoProfile?: camera.Profile;
  private preViewSurfaceId: string;

  private videoOutput?: camera.VideoOutput;
  private videoProfile: camera.VideoProfile;
  private videoSession?: camera.VideoSession;
  private avRecorder: media.AVRecorder;
  private photoPath: string = '';
  private basicPath: string = '';
  private outPathArray: string[] = ['photo', 'video'];
  private videoFile: fs.File;
  public uphasAudio: boolean = false;
  private videoSize: camera.Size = {
    width: 1920,
    height: 1080
  }
  public videoUri: string;
  private hasAudio: boolean = false
  private ctx!: RNOHContext;
  private cameraDeviceIndex: number = 0;
  private pictureSize: string;
  public ZoomRange: ZoomRangeType | null = null;
  public photoPreviewScale: number = 1;
  public previewProfile: camera.Profile = {} as camera.Profile;
  private photoCaptureSetting: camera.PhotoCaptureSetting = {
    rotation: camera.ImageRotation.ROTATION_0,
    mirror: false,
    quality: camera.QualityLevel.QUALITY_LEVEL_MEDIUM,
  };

  public codec = ''

  public preVideoQuality = '1080p'

  private videoStartParams: RecordVideoOptions = {}
  // preview原点相对于设备原点x偏移量
  private offsetX: number = 0;
  // preview原点相对于设备原点y偏移量
  private offsetY: number = 0;
  public fps: number = 30;
  private tag: number;

  constructor(_ctx?: RNOHContext) {
    _ctx && (this.ctx = _ctx);
    this.context = getContext(this);
    this.phAccessHelper = photoAccessHelper.getPhotoAccessHelper(this.context);
    this.basicPath = this.context.filesDir;
    for (let outPath of this.outPathArray) {
      this.initTempPath(outPath);
    }
    this.localDisplay = display.getDefaultDisplaySync();
    if (this.localDisplay) {
      let previewSize = {
        surfaceWidth: this.localDisplay.width, surfaceHeight: this.localDisplay.height
      }
      this.rect = previewSize;
    }

    try {
      this.cameraManager = camera.getCameraManager(this.context);
    } catch (e) {
      Logger.error(TAG, `getCameraManager catch e:${JSON.stringify(e)}`);
    }
  }

  /**
   * 初始化保存图片和视频的目录
   * @param path
   */
  initTempPath(path: string) {
    let pathDir = this.basicPath + '/' + path;
    let res;
    try {
      res = fs.accessSync(pathDir);
    } catch (error) {
      Logger.error(TAG, `constructor error path not exists:${JSON.stringify(error)}`);
    }
    if (!res) {
      Logger.error(TAG, `constructor photo path not exists:${pathDir}`);
      fs.mkdirSync(pathDir, true);
    }
  }

  async changeCameraPosition(config: {
    surfaceId: string, props: TempCameraProps,
    mediaModel: camera.SceneMode,
  }) {
    Logger.info(TAG, `changeCameraPosition`);
    const { surfaceId, props, mediaModel } = config;
    let cameraIndex = 0;
    props.type === "front" ? cameraIndex = 1 : cameraIndex = 0;
    if (this.cameraDeviceIndex === cameraIndex) {
      return;
    }
    this.cameraDeviceIndex = cameraIndex
    await this.cameraRelease();
    Logger.info(TAG, `changeCameraPosition: ${props.type}`);
    this.cameraManager = this.getCameraManagerFn();
    this.initCamera(surfaceId, props, mediaModel)
  }

  async changePictureSize(config: {
    surfaceId: string, props: TempCameraProps,
    mediaModel: camera.SceneMode,
  }) {
    Logger.info(TAG, `changePictureSize`);
    const { surfaceId, props, mediaModel } = config;
    if (this.pictureSize === props.pictureSize) {
      return;
    }
    this.pictureSize = props.pictureSize

    await this.pictureSizeChange(props);
  }

  async pictureSizeChange(props: TempCameraProps) {
    let width = this.previewProfile.size.width;
    let height = this.previewProfile.size.height;

    if (props.pictureSize && props.pictureSize.includes("x")) {
      let temp = props.pictureSize.split("x")
      width = parseInt(temp[0]);
      height = parseInt(temp[1]);
    }
    this.photoProfile = this.capability.photoProfiles.find(profile => {
      // 优先寻找相同尺寸的
      return profile.size.width === width &&
        profile.size.height === height
    })
    if (this.photoProfile === undefined) {
      // 如果没有相同尺寸的，寻找相近尺寸的
      const MIN_HEIGHT = 480
      const MIN_WIDTH = 640
      const ProfileSizeRatio = width / height;
      let selectedProfile = this.capability.photoProfiles[this.capability.photoProfiles.length - 1];
      let selectedProfileRatio = selectedProfile.size.width / selectedProfile.size.height;
      for (let i = this.capability.photoProfiles.length - 1; i >= 0; --i) {
        const currentProfile = this.capability.photoProfiles[i];
        if (currentProfile.size.height < MIN_HEIGHT || currentProfile.size.width < MIN_WIDTH) {
          // 限制最小尺寸
          continue
        }
        const currentRatio = currentProfile.size.width / currentProfile.size.height
        if (Math.abs(currentRatio - ProfileSizeRatio) <= Math.abs(selectedProfileRatio - ProfileSizeRatio)) {
          // 如果尺寸比例更接近，则替换
          selectedProfile = currentProfile
          selectedProfileRatio = currentRatio
        }
      }
      this.photoProfile = selectedProfile
    }
    await this.photoSession?.stop();
    let localPhotoOutput = this.cameraManager.createPhotoOutput(this.photoProfile);
    this.photoSession.beginConfig();
    if (this.photoOutPut) {
      this.photoSession?.removeOutput(this.photoOutPut)
      await this.photoOutPut.release();
    }
    this.photoOutPut = localPhotoOutput;
    this.photoSession.addOutput(this.photoOutPut);
    try {
      await this.photoSession.commitConfig();
    } catch (error) {
      Logger.error(TAG, `initPhotoSession commitConfig error: ${JSON.stringify(error)}`);
      this.onCameraError(`initPhotoSession commitConfig error: ${JSON.stringify(error)}`)
    }
    await this.photoSession?.start();
    this.setPhotoOutputCb(this.photoOutPut);
  }


  async resetVideoSession(config: {
    surfaceId: string, props: TempCameraProps,
    mediaModel: camera.SceneMode,
  }) {
    Logger.info(TAG, `resetVideoSession`);
    const { surfaceId, props, mediaModel } = config;
    if (this.preVideoQuality === props.defaultVideoQuality) {
      return;
    }
    this.setDefaultVideoQuality(props.defaultVideoQuality)
    this.preVideoQuality = props.defaultVideoQuality;

    if (!this.videoSession) {
      return;
    }
    await this.hdrChange(props);
  }

  getCameraManagerFn(): camera.CameraManager | undefined {
    let cameraManager: camera.CameraManager | undefined = undefined;
    try {
      cameraManager = camera.getCameraManager(this.context);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `getCameraManager failed: ${JSON.stringify(err)}`);
      this.onError(`getCameraManager failed: ${JSON.stringify(err)}`)
    }
    return cameraManager;
  }

  setTagId(tag: number): void {
    this.tag = tag
  }

  setDefaultVideoQuality(defaultQuality: string): void {
    let videoWidth;
    let videoHeight;
    ({ videoWidth, videoHeight } = this.getQuality(defaultQuality, videoWidth, videoHeight));
    this.videoSize.width = videoWidth;
    this.videoSize.height = videoHeight;
  }

  /**
   * 初始化相机
   * @param surfaceId
   */
  async initCamera(surfaceId: string, props: TempCameraProps, mediaModel: camera.SceneMode): Promise<void> {
    this.preViewSurfaceId = surfaceId;
    this.mediaModel = mediaModel
    if (!this.cameraManager) {
      Logger.error(TAG, 'initCamera check cameraManager is empty');
      return;
    }
    if (!this.camerasArray) {
      let camerasArrayTemp = this.getAvailableCameraDevices();
      if (!camerasArrayTemp) {
        Logger.error(TAG, 'initCamera get getAvailableCameraDevices is empty');
        this.onCameraError('initCamera get getAvailableCameraDevices is empty')
        return;
      }
    }
    let currentDevice = this.camerasArray[0]
    //rn中定义是1后置，0是前置
    if (props.type === "back") {
      currentDevice = this.camerasArray[0]
    } else {
      currentDevice = this.camerasArray[1]
    }
    if (this.mediaModel === camera.SceneMode.NORMAL_PHOTO) {
      Logger.debug("initPhotoSession")
      await this.initPhotoSession(currentDevice, surfaceId, props);
      await this.photoSession.start();
      this.setPhotoOutputCb(this.photoOutPut);
    } else {
      if (props.defaultVideoQuality) {
        this.setDefaultVideoQuality(props.defaultVideoQuality)
        this.preVideoQuality = props.defaultVideoQuality
      }
      Logger.debug("initVideoSession")
      await this.initVideoSession(currentDevice, surfaceId, props);
    }
    // if (!props.isActive) {
    this.activeChange(true);
    // }

    let focusMode;
    if (props.autoFocus === "on") {
      focusMode = camera.FocusMode.FOCUS_MODE_AUTO
      this.focusRn(focusMode, props.autoFocusPointOfInterest);
    } else if (props.focusDepth) {
      Logger.debug("focusDepth" + props.focusDepth)
      focusMode = camera.FocusMode.FOCUS_MODE_AUTO
      this.focusRn(focusMode, { "x": props.focusDepth, "y": props.focusDepth })
    }

    this.initProps(props);
  }

  /**
   * 初始化props参数
   */
  async initProps(props: TempCameraProps) {
    if (props.exposure !== undefined) {
      this.setExposure(props.exposure);
    }
    if (props.zoom !== undefined) {
      if (props.zoom > props.maxZoom) {
        this.setSmoothZoom(props.maxZoom);
      } else {
        this.setSmoothZoom(props.zoom);
      }
    }
    this.setWhiteBalance(props.whiteBalance);

    if (props.flashMode !== undefined) {
      this.setTorch(props.flashMode);
    }

    if (props.captureAudio != undefined) {
      this.setAudio(props.captureAudio);
    }
  }

  public setWhiteBalance(whiteBalance: string) {
    let sdkApiVersionInfo: number = deviceinfo.sdkApiVersion;
    if (sdkApiVersionInfo >= 20 && whiteBalance != "") {
      let cameraSession;
      if (this.photoSession) {
        cameraSession = this.photoSession;
      } else if (this.videoSession) {
        cameraSession = this.videoSession;
      } else {
        Logger.error(TAG, `The setTorchMode call failed. error cameraSession is undefined`);
        return;
      }
      switch (whiteBalance) {
        case "sunny":
          cameraSession.setWhiteBalanceMode(camera.WhiteBalanceMode.DAYLIGHT);
          break;
        case "cloudy":
          cameraSession.setWhiteBalanceMode(camera.WhiteBalanceMode.CLOUDY);
          break;
        case "shadow":
          cameraSession.setWhiteBalanceMode(camera.WhiteBalanceMode.AUTO);
          break;
        case "incandescent":
          cameraSession.setWhiteBalanceMode(camera.WhiteBalanceMode.INCANDESCENT);
          break;
        case "fluorescent":
          cameraSession.setWhiteBalanceMode(camera.WhiteBalanceMode.FLUORESCENT);
          break;
        case "auto":
          cameraSession.setWhiteBalanceMode(camera.WhiteBalanceMode.AUTO);
          break;
      }
    }
  }

  async initVideoSession(currentDevice: camera.CameraDevice, surfaceId: string, props: TempCameraProps) {
    this.cameraInput = this.cameraManager.createCameraInput(currentDevice);
    this.cameraInput.open();
    this.capability = this.cameraManager.getSupportedOutputCapability(currentDevice, camera.SceneMode.NORMAL_VIDEO);

    if (surfaceId) {
      this.previewProfile = {
        format: 1003,
        size: {
          width: 1920,
          height: 1080
        }
      }
      this.previewOutput = this.cameraManager.createPreviewOutput(this.previewProfile, surfaceId);
    }
    let videoSizeWidth = this.videoSize.width;
    let videoSizeHeight = this.videoSize.height;
    if (videoSizeWidth < 1280) {
      videoSizeWidth = 1280;
      videoSizeHeight = 720;
    }
    this.videoProfile = this.capability.videoProfiles.find((profile: camera.VideoProfile) => {
      return profile.size.width === videoSizeWidth && profile.size.height === videoSizeHeight &&
        profile.format === camera.CameraFormat.CAMERA_FORMAT_YUV_420_SP;
    });

    this.videoOutput = await this.recordPrepared(this.videoStartParams, props);

    this.videoSession = this.cameraManager?.createSession(camera.SceneMode.NORMAL_VIDEO);
    this.videoSession.beginConfig();
    this.videoSession.addInput(this.cameraInput);
    if (surfaceId && this.previewOutput) {
      this.videoSession.addOutput(this.previewOutput);
    }
    if (this.videoOutput) {
      this.videoSession?.addOutput(this.videoOutput);
    }
    try {
      Logger.debug("videoSession.commitConfig")
      await this.videoSession.commitConfig();
    } catch (error) {
      Logger.error(TAG, `initVideoSession commitConfig1 ${JSON.stringify(error)}`);
      this.onCameraError(`initVideoSession commitConfig1 ${JSON.stringify(error)}`)
    }
    // await this.setVideoStabilizationMode(false, props.videoStabilizationMode);

    await this.videoSession.start().then(() => {

    }).catch((error: BusinessError) => {
      Logger.error(TAG, "video start error:" + error.code)
      this.onCameraError(`camera start error: ${JSON.stringify(error.code)}`)
    });
  }

  async initPhotoSession(currentDevice: camera.CameraDevice, surfaceId: string, props: TempCameraProps) {
    this.cameraInput = this.cameraManager.createCameraInput(currentDevice);
    this.cameraInput.open();
    this.capability = this.cameraManager.getSupportedOutputCapability(currentDevice, camera.SceneMode.NORMAL_PHOTO);
    if (surfaceId) {
      // previewProfile是通过this.capability.previewProfiles获取的，这里和OS沟通可设置为通用的1920和1080
      this.previewProfile = {
        format: 1003,
        size: {
          width: 1920,
          height: 1080
        }
      }
      this.previewOutput = this.cameraManager.createPreviewOutput(this.previewProfile, surfaceId);
    }
    let width = this.previewProfile.size.width;
    let height = this.previewProfile.size.height;
    if (props.pictureSize && props.pictureSize.includes("x")) {
      let temp = props.pictureSize.split("x")
      width = parseInt(temp[0]);
      height = parseInt(temp[1]);
    }
    this.photoProfile = this.capability.photoProfiles.find(profile => {
      // 优先寻找相同尺寸的
      return profile.size.width === width &&
        profile.size.height === height
    })
    if (this.photoProfile === undefined) {
      // 如果没有相同尺寸的，寻找相近尺寸的
      const MIN_HEIGHT = 480
      const MIN_WIDTH = 640
      const ProfileSizeRatio = width / height;
      let selectedProfile = this.capability.photoProfiles[this.capability.photoProfiles.length - 1];
      let selectedProfileRatio = selectedProfile.size.width / selectedProfile.size.height;
      for (let i = this.capability.photoProfiles.length - 1; i >= 0; --i) {
        const currentProfile = this.capability.photoProfiles[i];
        if (currentProfile.size.height < MIN_HEIGHT || currentProfile.size.width < MIN_WIDTH) {
          // 限制最小尺寸
          continue
        }
        const currentRatio = currentProfile.size.width / currentProfile.size.height
        if (Math.abs(currentRatio - ProfileSizeRatio) <= Math.abs(selectedProfileRatio - ProfileSizeRatio)) {
          // 如果尺寸比例更接近，则替换
          selectedProfile = currentProfile
          selectedProfileRatio = currentRatio
        }
      }
      this.photoProfile = selectedProfile
    }

    this.photoSession = this.cameraManager?.createSession(camera.SceneMode.NORMAL_PHOTO);
    this.photoOutPut = this.cameraManager.createPhotoOutput(this.photoProfile);
    this.photoSession.beginConfig();
    this.photoSession.addInput(this.cameraInput);
    if (this.previewOutput) {
      this.photoSession.addOutput(this.previewOutput);
    }
    this.photoSession.addOutput(this.photoOutPut);
    try {
      await this.photoSession.commitConfig();
    } catch (error) {
      Logger.error(TAG, `initPhotoSession commitConfig error: ${JSON.stringify(error)}`);
      this.onCameraError(`initPhotoSession commitConfig error: ${JSON.stringify(error)}`)
    }
  }

  async hdrChange(props: TempCameraProps) {
    this.previewProfile = {
      format: 1003,
      size: {
        width: 1920,
        height: 1080
      }
    }
    let videoSizeWidth = this.videoSize.width;
    let videoSizeHeight = this.videoSize.height;
    if (videoSizeWidth < 1280) {
      videoSizeWidth = 1280;
      videoSizeHeight = 720;
    }
    this.videoProfile = this.capability.videoProfiles.find((profile: camera.VideoProfile) => {
      //todo 这里有个hdr的判断
      return profile.size.width === videoSizeWidth && profile.size.height === videoSizeHeight &&
        profile.format === camera.CameraFormat.CAMERA_FORMAT_YUV_420_SP;
    });
    await this.videoSession?.stop();
    try {
      this.videoSession?.beginConfig();
      if (this.previewOutput) {
        this.videoSession?.removeOutput(this.previewOutput);
        await this.previewOutput.release();
      }
      let localPreviewOutput = this.cameraManager.createPreviewOutput(this.previewProfile, this.preViewSurfaceId);
      this.previewOutput = localPreviewOutput;
      this.videoSession?.addOutput(localPreviewOutput);
      let localVideoOutput = await this.recordPrepared(this.videoStartParams, props)
      if (this.videoOutput) {
        this.videoSession?.removeOutput(this.videoOutput);
        await this.videoOutput.release();
      }
      this.videoOutput = localVideoOutput;
      this.videoSession?.addOutput(this.videoOutput);
      // await this.setVideoStabilizationMode(true, props.videoStabilizationMode);
      await this.videoSession?.commitConfig();
      await this.videoSession?.start();

    } catch (error) {
      Logger.error(TAG, `hdrChange change Output error,${JSON.stringify(error)}`);
    }
  }

  async previewChange(preview: boolean): Promise<void> {
    const targetSession = this.photoSession ? this.photoSession : this.videoSession;
    if (preview) {
      if (this.previewOutput) {
        targetSession?.beginConfig();
        targetSession?.addOutput(this.previewOutput);
        await targetSession?.commitConfig();
        await targetSession?.start();
      } else {
        this.previewProfile = this.capability.previewProfiles[this.capability.previewProfiles.length - 1];
        this.previewOutput = this.cameraManager.createPreviewOutput(this.previewProfile, this.preViewSurfaceId);
        targetSession?.beginConfig();
        targetSession?.addOutput(this.previewOutput);
        await targetSession?.commitConfig();
        await targetSession?.start();
      }
    } else {
      if (this.previewOutput) {
        targetSession?.beginConfig();
        targetSession?.removeOutput(this.previewOutput);
        await targetSession?.commitConfig();
        await targetSession?.start();
      }
    }
  }

  /**
   * @note 录制准备
   * @param options RecordVideoOptions
   * @param props VisionCameraViewSpec.RawProps
   * @returns videoOutput
   */
  async recordPrepared(options: RecordVideoOptions, prop: TempCameraProps) {
    if (this.avRecorder) {
      await this.avRecorder.release();
    }
    this.avRecorder = await media.createAVRecorder();
    try {
      await this.avRecorder.prepare(this.prepareAVRecorderConfig(options, prop)).then(() => {
        this.onAudioConnected();
      });
    } catch (error) {
      Logger.debug(TAG, `avRecorder.prepare.error ${JSON.stringify(error)}`);
    }
    this.avRecorder.on('stateChange', async (state: media.AVRecorderState, reason: media.StateChangeReason) => {
      Logger.info('case state has changed, new state is: ' + state + ', and reason is: ' + reason);
    });
    let videoSurfaceId = await this.avRecorder.getInputSurface();
    let videoOutput: camera.VideoOutput;
    try {
      videoOutput = this.cameraManager.createVideoOutput(this.videoProfile, videoSurfaceId);
    } catch (error) {
      Logger.debug(TAG, `recordPrepared createVideoOutput.error ${JSON.stringify(error)}`);
      this.onCameraError(`recordPrepared createVideoOutput.error ${JSON.stringify(error)}`)
    }
    return videoOutput;
  }

  /**
   * 配置 AVRecorderConfig
   */
  prepareAVRecorderConfig(options: RecordVideoOptions, prop: TempCameraProps): media.AVRecorderConfig {
    let videoBitRate: number = 512000
    if (options.videoBitRate) {
      videoBitRate = options.videoBitRate
    }
    if (prop.captureAudio) {
      this.hasAudio = true
    } else {
      this.hasAudio = false
    }
    if (options.mute) {
      this.hasAudio = false
    } else {
      this.hasAudio = true
    }

    if (options.fps) {
      this.fps = options.fps || 30;
      let { min:minFps, max:maxFps } = this.videoProfile.frameRateRange;
      if (this.fps > maxFps) {
        this.fps = maxFps;
        this.onError('The fps exceeds the maximum value.')
      } else if (this.fps < minFps) {
        this.fps = minFps;
        this.onError('The fps is lower than the minimum value.')
      }
    }

    let audioConfig = {
      audioChannels: 2,
      audioCodec: media.CodecMimeType.AUDIO_AAC,
      audioBitrate: 48000,
      audioSampleRate: 48000,
    }
    let videoWidth = this.videoSize.width;
    let videoHeight = this.videoSize.height;
    if (options.quality) {
      ({ videoWidth, videoHeight } = this.getQuality(options.quality, videoWidth, videoHeight));
    }
    let videoConfig: media.AVRecorderProfile = {
      fileFormat: media.ContainerFormatType.CFT_MPEG_4,
      videoBitrate: videoBitRate > 1 ? videoBitRate : 512000,
      videoCodec: options.codec === 'h265' ? media.CodecMimeType.VIDEO_HEVC : media.CodecMimeType.VIDEO_AVC,
      videoFrameWidth: videoWidth,
      videoFrameHeight: videoHeight,
      videoFrameRate: this.fps,
    };

    this.codec = options.codec === 'h265' ? media.CodecMimeType.VIDEO_HEVC : media.CodecMimeType.VIDEO_AVC;
    let videoConfigProfile: media.AVRecorderProfile = this.hasAudio ? {
      ...audioConfig, ...videoConfig
    } : videoConfig
    this.videoUri =
      `${this.basicPath}/${this.outPathArray[1]}/${Date.parse(new Date().toString())}.mp4`;
    this.videoFile = fs.openSync(this.videoUri, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
    let aVAudio = {
      audioSourceType: media.AudioSourceType.AUDIO_SOURCE_TYPE_MIC
    }
    let aVVideo: media.AVRecorderConfig = {
      videoSourceType: media.VideoSourceType.VIDEO_SOURCE_TYPE_SURFACE_YUV,
      profile: videoConfigProfile,
      url: `fd://${this.videoFile.fd.toString()}`, // 文件需先由调用者创建，赋予读写权限，将文件fd传给此参数，eg.fd://45--file:///data/media/01.mp4
      rotation: 90, // 合理值0、90、180、270，非合理值prepare接口将报错
      location: {
        latitude: 30, longitude: 130
      }
    }
    if (options.maxDuration) {
      aVVideo.maxDuration = options.maxDuration
    }

    if (options.orientation) {
      let videoMetaData: media.AVMetadata = {
        videoOrientation: '0' // 合理值0、90、180、270，非合理值prepare接口报错。
      };
      aVVideo.metadata = videoMetaData
    }

    return this.hasAudio ? {
      ...aVAudio, ...aVVideo
    } : aVVideo;
  }

  private getQuality(quality: string, videoWidth: number, videoHeight: number) {
    switch (quality) {
      case "2160p":
        videoWidth = 3840;
        videoHeight = 2160;
        break;
      case "1080p":
        videoWidth = 1920;
        videoHeight = 1080;
        break;
      case "720p":
        videoWidth = 1280;
        videoHeight = 720;
        break;
      case "480p":
        videoWidth = 640;
        videoHeight = 480;
        break;
      case "4:3":
        videoWidth = 640;
        videoHeight = 480;
        break;
      case "288p":
        videoWidth = 352;
        videoHeight = 288;
        break;
      default:
        videoWidth = 1920;
        videoHeight = 1080
        break;
    }
    return { videoWidth, videoHeight };
  }

  //设置预览样式 cover/contain
  setResizeMode(_resizeMode: string, displayWidth: number = 1216, displayHeight: number = 2688,
    callback: (width: number, height: number) => void) {
    let previewSize = this.previewProfile.size
    let screenAspect = displayWidth / displayHeight;
    let previewAspect = previewSize.height / previewSize.width;
    let componentWidth: number = 0;
    let componentHeight: number = 0;
    let resizeMode = _resizeMode ?? 'cover';
    if (resizeMode === 'cover') {
      componentWidth = displayWidth;
      componentHeight = displayHeight
    } else if (resizeMode === 'contain') {
      if (screenAspect >= previewAspect) {
        componentWidth = displayHeight * previewAspect;
        componentHeight = displayHeight;
      } else {
        componentWidth = displayHeight / previewAspect;
        componentHeight = displayHeight;
      }
    }
    // 计算设备左上角与预览流左上角偏移量
    this.offsetX = (componentWidth - displayWidth) / 2;
    this.offsetY = (componentHeight - displayHeight) / 2;
    this.rect = {
      surfaceWidth: componentWidth, surfaceHeight: componentHeight
    }
    callback(componentWidth, componentHeight);
  }

  //开始预览 isActive:true
  async activeChange(isActive: boolean): Promise<void> {
    const targetSession = this.photoSession ? this.photoSession : this.videoSession;
    try {
      if (isActive) {
        await targetSession.start();
      } else {
        await targetSession.stop();
      }
    } catch (error) {
      Logger.error(TAG, `The activeChange targetSession start call failed. error code: ${error.code}`);
      this.onError(`The activeChange targetSession start call failed. error code: ${error.code}`)
    }
  }

  //设置曝光补偿
  setExposure(exposure: number): void {
    Logger.debug(`RNOH in NativeCamera setExposure:${exposure}`);
    let cameraSession;
    if (this.photoSession) {
      cameraSession = this.photoSession;
    } else if (this.videoSession) {
      cameraSession = this.videoSession;
    } else {
      Logger.error(TAG, `The setTorchMode call failed. error cameraSession is undefined`);
      return;
    }
    try {
      //[-4,4]
      const [min, max]: Array<number> = cameraSession.getExposureBiasRange();
      if (exposure >= min && exposure <= max) {
        cameraSession?.setExposureBias(exposure);
        Logger.debug(`RNOH in setExposureBias success`);
      } else {
      }
    } catch (error) {
      Logger.error(TAG, `The setExposureBias call failed. error code: ${error.code}`);
    }
  }

  //设置缩放[0.49,50]
  setSmoothZoom(zoom: number): void {
    Logger.debug(`RNOH in NativeCamera setSmoothZoom:${zoom}`);
    try {
      const [min, max]: Array<number> = this.getZoomRange();
      if (zoom <= min) {
        zoom = min;
      } else if (zoom >= max) {
        zoom = max;
      }
      this.photoSession?.setSmoothZoom(zoom, camera.SmoothZoomMode.NORMAL);
      this.photoPreviewScale = zoom;
      Logger.debug(`RNOH in setSmoothZoom success`);
    } catch (error) {
      Logger.error(TAG, `The setSmoothZoom call failed. error code: ${error.code}.`);
    }
  }

  //获取缩放阈值
  getZoomRange(forceUpdate: boolean = false): ZoomRangeType {
    try {
      if (this.ZoomRange === null || forceUpdate) {
        const [min, max]: Array<number> = this.photoSession?.getZoomRatioRange();
        this.ZoomRange = [min, max];
      }
      return this.ZoomRange;
    } catch (error) {
      Logger.error(TAG, `The getZoomRatioRange call failed. error code: ${error.code}.`);
    }
  }

  //设置手电筒模式
  setTorch(mode: string): void {
    let cameraSession;
    if (this.photoSession) {
      cameraSession = this.photoSession;
    } else if (this.videoSession) {
      cameraSession = this.videoSession;
    } else {
      Logger.error(TAG, `The setTorchMode call failed. error cameraSession is undefined`);
      return;
    }

    if (cameraSession.hasFlash()) {
      if (mode === 'on' && cameraSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_ALWAYS_OPEN)) {
        cameraSession?.setFlashMode(camera.FlashMode.FLASH_MODE_OPEN);
      } else if (mode === 'off' && cameraSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_CLOSE)) {
        cameraSession?.setFlashMode(camera.FlashMode.FLASH_MODE_CLOSE);
      } else if (mode === 'auto' && cameraSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_AUTO)) {
        cameraSession?.setFlashMode(camera.FlashMode.FLASH_MODE_AUTO);
      } else if (mode === 'torch' && cameraSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_ALWAYS_OPEN)) {
        cameraSession?.setFlashMode(camera.FlashMode.FLASH_MODE_ALWAYS_OPEN);
      }
    }
  }

  /**
   * 设置视频防抖模式
   */
  async setVideoStabilizationMode(isStart: boolean, mode?: string) {
    if (!this.videoSession) {
      return
    }
    let videoMode = camera.VideoStabilizationMode.AUTO
    if (mode === 'off') {
      videoMode = camera.VideoStabilizationMode.OFF
    }
    if (mode === 'standard') {
      videoMode = camera.VideoStabilizationMode.LOW
    }
    if (mode === 'cinematic') {
      videoMode = camera.VideoStabilizationMode.MIDDLE
    }
    let isSupported: boolean = false;
    try {
      isSupported = this.videoSession.isVideoStabilizationModeSupported(videoMode);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `The isVideoStabilizationModeSupported call failed. error code: ${err.code}`);
    }
    if (isSupported) {
      try {
        this.videoSession.setVideoStabilizationMode(videoMode);
        if (!isStart) {
          this.videoSession.beginConfig();
          await this.videoSession.commitConfig();
          await this.videoSession.start();
        }
      } catch (error) {
        let err = error as BusinessError;
        Logger.error(TAG, `The setVideoStabilizationMode call failed. error code: ${err.code}`);
      }
    } else {
      this.ctx &&
      this.ctx.rnInstance.emitDeviceEvent('onError', new CameraCaptureError('capture/unknown',
        `the device does not support the ${mode} video stabilization mode.`));
    }
  }

  /**
   * 相机输出能力
   */
  getSupportedOutputCapability(cameraDevice: camera.CameraDevice,
    cameraManager: camera.CameraManager): camera.CameraOutputCapability {
    let cameraOutputCapability: camera.CameraOutputCapability =
      cameraManager.getSupportedOutputCapability(cameraDevice, this.mediaModel);
    return cameraOutputCapability;
  }

  /**
   * 资源释放
   */
  async cameraRelease() {
    try {
      if (this.cameraInput) {
        await this.cameraInput.close();
        this.cameraInput = undefined;
      }
      if (this.previewOutput) {
        await this.previewOutput.release();
        this.previewOutput = undefined;
      }
      if (this.photoOutPut) {
        await this.photoOutPut.release();
        this.photoOutPut = undefined;
      }
      if (this.videoOutput) {
        await this.videoOutput.release();
        this.videoOutput = undefined
      }
      if (this.photoSession) {
        await this.photoSession.release();
        this.photoSession = undefined
      }
      if (this.videoSession) {
        await this.videoSession.release();
        this.videoSession = undefined
      }
      if (this.videoFile && this.videoFile.fd) {
        fs.closeSync(this.videoFile);
      }
      if (this.avRecorder) {
        await this.avRecorder.release();
        this.avRecorder = undefined
      }
    } catch (error) {
      Logger.error(TAG, `releaseCamera end error: ${JSON.stringify(error)}`);
      this.onError(`releaseCamera end error: ${JSON.stringify(error)}`)
    }
    Logger.info(TAG, `camera released!`);
  }

  // 通过弹窗获取需要保存到媒体库的位于应用沙箱的图片/视频uri
  async getMediaLibraryUri(srcFileUri: string, title: string, fileNameExtension: string,
    photoType: photoAccessHelper.PhotoType): Promise<string> {
    try {
      let srcFileUris: Array<string> = [
        // 应用沙箱的图片/视频uri
        srcFileUri
      ];
      let photoCreationConfigs: Array<photoAccessHelper.PhotoCreationConfig> = [
        {
          title: title,
          fileNameExtension: fileNameExtension,
          photoType: photoType,
          subtype: photoAccessHelper.PhotoSubtype.DEFAULT,
        }
      ];
      let desFileUris: Array<string> =
        await this.phAccessHelper.showAssetsCreationDialog(srcFileUris, photoCreationConfigs);
      return desFileUris[0];
    } catch (err) {
      Logger.error(TAG, `showAssetsCreationDialog failed, errCode is:${err.code},errMsg is:${err.message}`);
    }
  }

  // 保存图片
  async savePicture(photoAccess: photoAccessHelper.PhotoAsset): Promise<void> {
    let photoFile = `${this.basicPath}/${this.outPathArray[0]}/${Date.now().toString()}.jpeg`;
    // photoFile = await this.getMediaLibraryUri(photoFile, `${Date.now()}`, 'jpeg', photoAccessHelper.PhotoType.IMAGE)
    // 根据相机拍照图片路径，获取文件buffer
    let file = fs.openSync(photoAccess.uri, fs.OpenMode.READ_ONLY);
    let stat = fs.statSync(file.fd);
    let buffer = new ArrayBuffer(stat.size);
    fs.readSync(file.fd, buffer);
    fs.fsyncSync(file.fd);
    fs.closeSync(file);
    let _file;
    try {
      _file = fs.openSync(photoFile, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
      await fs.write(_file.fd, buffer);
    } catch (error) {
      Logger.error(TAG, `savePicture statSync failed,code:${error}.`);
    }
    fs.closeSync(_file);
    this.photoPath = photoFile;
  }


  setPhotoOutputCb(photoOutput: camera.PhotoOutput): void {
    photoOutput.on('photoAssetAvailable', (err: BusinessError, photoAsset: photoAccessHelper.PhotoAsset) => {
      if (err || photoAsset === undefined) {
        Logger.error(TAG, `setPhotoOutputCb photoAssetAvailable failed, ${JSON.stringify(err)}`);
        return;
      }
      this.savePicture(photoAsset);
    });
  }

  /**
   * 参数配置
   */
  focus(mode: camera.FocusMode, rnPoint: Point) {
    let status: boolean = false;
    const targetSession = this.photoSession ? this.photoSession : this.videoSession;
    //设置对接模式
    try {
      Logger.debug(`RNOH in NativeCamera setFocusMode:${mode}`);
      targetSession.setFocusMode(mode);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `The setFocusMode call failed. error code: ${err.code}`);
      return;
    }
    // 指定焦点时设置焦点
    if (rnPoint) {
      let ohPoint = this.convertPoint(rnPoint);
      Logger.debug(`RNOH in NativeCamera setFocusPoint ohPoint x:${ohPoint.x},ohPoint y:${ohPoint.y}`);
      try {
        targetSession.setFocusPoint(ohPoint);
      } catch (error) {
        let err = error as BusinessError;
        Logger.error(TAG, `The setFocusPoint call failed. error code: ${err.code}`);
      }
    }
  }

  /**
   * 参数配置
   */
  focusRn(mode: camera.FocusMode, rnPoint?: Point) {
    let status: boolean = false;
    const targetSession = this.photoSession ? this.photoSession : this.videoSession;
    //设置对接模式
    try {
      Logger.debug(`RNOH in NativeCamera setFocusMode:${mode}`);
      targetSession.setFocusMode(mode);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `The setFocusMode call failed. error code: ${err.code}`);
      return;
    }
    // 指定焦点时设置焦点
    if (rnPoint) {
      let ohPoint = this.convertPointRn(rnPoint);
      Logger.debug(`RNOH in NativeCamera setFocusPoint ohPoint x:${ohPoint.x},ohPoint y:${ohPoint.y}`);
      try {
        targetSession.setFocusPoint(ohPoint);
      } catch (error) {
        let err = error as BusinessError;
        Logger.error(TAG, `The setFocusPoint call failed. error code: ${err.code}`);
      }
    }
  }

  /**
   * 转换为鸿蒙Point坐标
   * VC坐标系(x,y)-> OH坐标系(x/w,y/h)
   * @param rnPoint
   * @returns
   */
  convertPointRn(rnPoint: Point): Point {
    let ohPoint: Point = {
      x: 0, y: 0
    }
    if (rnPoint) {
      ohPoint.x = rnPoint.x * this.rect.surfaceWidth / 1000;
      ohPoint.y = rnPoint.y * this.rect.surfaceHeight / 1000;
    }
    return ohPoint;
  }

  convertPoint(rnPoint: Point): Point {
    let ohPoint: Point = {
      x: 0, y: 0
    }
    if (rnPoint) {
      ohPoint.x = (rnPoint.x + this.offsetX) / this.rect.surfaceWidth;
      ohPoint.y = (rnPoint.y + this.offsetY) / this.rect.surfaceHeight;
    }
    return ohPoint;
  }


  /**
   * 设置photoQuality
   * @param quality
   */
  setPhotoQualitySetting(quality: 'speed' | 'balanced' | 'quality' = 'speed'): void {
    this.photoCaptureSetting.quality = this.getQualityLevel(quality);
  }

  /**
   * photoQuality转换
   * @param level
   * @returns
   */
  getQualityLevel(level) {
    switch (level) {
      case 'speed':
        return camera.QualityLevel.QUALITY_LEVEL_LOW;
      case 'balanced':
        return camera.QualityLevel.QUALITY_LEVEL_MEDIUM;
      case 'quality':
        return camera.QualityLevel.QUALITY_LEVEL_HIGH;
      default:
        return camera.QualityLevel.QUALITY_LEVEL_MEDIUM;
    }
  }

  /**
   * 设置拍摄位置
   * @param enableLocation
   */
  async setPhotoLocationSetting(enableLocation: boolean): Promise<void> {
    if (enableLocation) {
      this.photoCaptureSetting.location = await this.getLocation();
    } else {
      delete this.photoCaptureSetting.location;
    }
  }

  /**
   * 获取当前位置
   */
  async getLocation(): Promise<camera.Location> {
    let requestInfo: geoLocationManager.CurrentLocationRequest = {
      'priority': geoLocationManager.LocationRequestPriority.FIRST_FIX,
      'scenario': geoLocationManager.LocationRequestScenario.UNSET,
      'maxAccuracy': 0
    };
    try {
      const result = await geoLocationManager.getCurrentLocation(requestInfo);
      return result
    } catch (error) {
      if (error.code === '3301100') {
        Logger.error(TAG, `the switch for the location function is not turned on, error code: ${error?.code}.`);
        this.ctx &&
        this.ctx.rnInstance.emitDeviceEvent('onError', new CameraCaptureError('capture/location-not-turned-on',
          'the switch for the location function is not turned on.'));
      }
      Logger.error(TAG, `getCurrentLocation error, error code is ${error?.code}.`);
      delete this.photoCaptureSetting.location;
    }
  }

  /**
   * 拍照
   */
  async takePhoto(options: TakePhotoOptions, devOrientation: number): Promise<PhotoFile> {
    Logger.debug("takePhoto quality:" + options.quality)
    Logger.debug("takePhoto orientation:" + options.orientation)
    Logger.debug("takePhoto mirrorImage:" + options.mirrorImage)

    let quality = camera.QualityLevel.QUALITY_LEVEL_MEDIUM;
    if (options) {
      if (options.quality) {
        if (options.quality <= 0.33) {
          quality = camera.QualityLevel.QUALITY_LEVEL_LOW;
        } else if (0.33 < options.quality && options.quality <= 0.66) {
          quality = camera.QualityLevel.QUALITY_LEVEL_MEDIUM;
        } else if (0.66 < options.quality) {
          quality = camera.QualityLevel.QUALITY_LEVEL_HIGH;
        }

        this.photoCaptureSetting.quality = quality;
      }

      if (options.mirrorImage) {
        this.photoCaptureSetting.mirror = options.mirrorImage;
      }

      if (options.orientation) {
        switch (options.orientation) {
          case 1:
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_0;
            break;
          case 2:
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_90;
            break;
          case 3:
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_180;
            break;
          case 4:
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_270;
            break;
          case 'auto':
            break;
          case 'portrait':
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_0;
            break;
          case 'landscapeRight':
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_90;
            break;
          case 'portraitUpsideDown':
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_180;
            break;
          case 'landscapeLeft':
            this.photoCaptureSetting.rotation = camera.ImageRotation.ROTATION_270;
            break;
        }

      }
    }

    try {
      await this.photoOutPut.capture(this.photoCaptureSetting);
    } catch (error) {
      Logger.error(TAG, `Failed to capture error: ${error.message},code:${error.code}`);
      this.onError(`Failed to capture error: ${error.message},code:${error.code}`)
      return;
    }
    await this.waitForPathResult();
    let photoFile: PhotoFile = {} as PhotoFile;
    photoFile.width = this.photoProfile?.size.height;
    photoFile.height = this.photoProfile?.size.width;
    photoFile.path = this.photoPath;
    photoFile.pictureOrientation = this.getOrientation(this.photoCaptureSetting.rotation)

    let imageSource = image.createImageSource(this.photoPath); // this.uri 为图片的本地 URI
    // 获取 EXIF 标签 'DateTime'
    let key = [image.PropertyKey.BITS_PER_SAMPLE,
      image.PropertyKey.ORIENTATION,
      image.PropertyKey.IMAGE_LENGTH,
      image.PropertyKey.IMAGE_WIDTH,
      image.PropertyKey.GPS_LATITUDE,
      image.PropertyKey.GPS_LONGITUDE,
      image.PropertyKey.GPS_LATITUDE_REF,
      image.PropertyKey.GPS_LONGITUDE_REF,
      image.PropertyKey.DATE_TIME_ORIGINAL,
      image.PropertyKey.EXPOSURE_TIME,
      image.PropertyKey.SCENE_TYPE,
      image.PropertyKey.ISO_SPEED_RATINGS,
      image.PropertyKey.F_NUMBER,
      image.PropertyKey.DATE_TIME,
      image.PropertyKey.GPS_TIME_STAMP,
      image.PropertyKey.GPS_DATE_STAMP,
      image.PropertyKey.IMAGE_DESCRIPTION,
      image.PropertyKey.MAKE,
      image.PropertyKey.MODEL,
      image.PropertyKey.PHOTO_MODE,
      image.PropertyKey.SENSITIVITY_TYPE,
      image.PropertyKey.STANDARD_OUTPUT_SENSITIVITY,
      image.PropertyKey.RECOMMENDED_EXPOSURE_INDEX,
      image.PropertyKey.ISO_SPEED,
      image.PropertyKey.APERTURE_VALUE,
      image.PropertyKey.EXPOSURE_BIAS_VALUE,
      image.PropertyKey.METERING_MODE,
      image.PropertyKey.LIGHT_SOURCE,
      image.PropertyKey.FLASH,
      image.PropertyKey.FOCAL_LENGTH,
      image.PropertyKey.USER_COMMENT,
      image.PropertyKey.PIXEL_X_DIMENSION,
      image.PropertyKey.PIXEL_Y_DIMENSION,
      image.PropertyKey.WHITE_BALANCE,
      image.PropertyKey.FOCAL_LENGTH_IN_35_MM_FILM,
      image.PropertyKey.CAPTURE_MODE,
      image.PropertyKey.PHYSICAL_APERTURE,
      image.PropertyKey.ROLL_ANGLE,
      image.PropertyKey.PITCH_ANGLE,
      image.PropertyKey.SCENE_FOOD_CONF,
      image.PropertyKey.SCENE_STAGE_CONF,
      image.PropertyKey.SCENE_BLUE_SKY_CONF,
      image.PropertyKey.SCENE_GREEN_PLANT_CONF,
      image.PropertyKey.SCENE_BEACH_CONF,
      image.PropertyKey.SCENE_SNOW_CONF,
      image.PropertyKey.SCENE_SUNSET_CONF,
      image.PropertyKey.SCENE_FLOWERS_CONF,
      image.PropertyKey.SCENE_NIGHT_CONF,
      image.PropertyKey.SCENE_TEXT_CONF,
      image.PropertyKey.FACE_COUNT,
      image.PropertyKey.FOCUS_MODE,
      image.PropertyKey.COMPRESSION,
      image.PropertyKey.PHOTOMETRIC_INTERPRETATION,
      image.PropertyKey.STRIP_OFFSETS,
      image.PropertyKey.SAMPLES_PER_PIXEL,
      image.PropertyKey.ROWS_PER_STRIP,
      image.PropertyKey.STRIP_BYTE_COUNTS,
      image.PropertyKey.X_RESOLUTION,
      image.PropertyKey.Y_RESOLUTION,
      image.PropertyKey.PLANAR_CONFIGURATION,
      image.PropertyKey.RESOLUTION_UNIT,
      image.PropertyKey.TRANSFER_FUNCTION,
      image.PropertyKey.SOFTWARE,
      image.PropertyKey.ARTIST,
      image.PropertyKey.WHITE_POINT,
      image.PropertyKey.PRIMARY_CHROMATICITIES,
      image.PropertyKey.YCBCR_COEFFICIENTS,
      image.PropertyKey.YCBCR_SUB_SAMPLING,
      image.PropertyKey.YCBCR_POSITIONING,
      image.PropertyKey.REFERENCE_BLACK_WHITE,
      image.PropertyKey.COPYRIGHT,
      image.PropertyKey.JPEG_INTERCHANGE_FORMAT,
      image.PropertyKey.JPEG_INTERCHANGE_FORMAT_LENGTH,
      image.PropertyKey.EXPOSURE_PROGRAM,
      image.PropertyKey.SPECTRAL_SENSITIVITY,
      image.PropertyKey.OECF,
      image.PropertyKey.EXIF_VERSION,
      image.PropertyKey.DATE_TIME_DIGITIZED,
      image.PropertyKey.COMPONENTS_CONFIGURATION,
      image.PropertyKey.SHUTTER_SPEED,
      image.PropertyKey.BRIGHTNESS_VALUE,
      image.PropertyKey.MAX_APERTURE_VALUE,
      image.PropertyKey.SUBJECT_DISTANCE,
      image.PropertyKey.SUBJECT_AREA,
      image.PropertyKey.MAKER_NOTE,
      image.PropertyKey.SUBSEC_TIME,
      image.PropertyKey.SUBSEC_TIME_ORIGINAL,
      image.PropertyKey.SUBSEC_TIME_DIGITIZED,
      image.PropertyKey.FLASHPIX_VERSION,
      image.PropertyKey.COLOR_SPACE,
      image.PropertyKey.RELATED_SOUND_FILE,
      image.PropertyKey.FLASH_ENERGY,
      image.PropertyKey.SPATIAL_FREQUENCY_RESPONSE,
      image.PropertyKey.FOCAL_PLANE_X_RESOLUTION,
      image.PropertyKey.FOCAL_PLANE_Y_RESOLUTION,
      image.PropertyKey.FOCAL_PLANE_RESOLUTION_UNIT,
      image.PropertyKey.SUBJECT_LOCATION,
      image.PropertyKey.EXPOSURE_INDEX,
      image.PropertyKey.SENSING_METHOD,
      image.PropertyKey.FILE_SOURCE,
      image.PropertyKey.CFA_PATTERN,
      image.PropertyKey.CUSTOM_RENDERED,
      image.PropertyKey.EXPOSURE_MODE,
      image.PropertyKey.DIGITAL_ZOOM_RATIO,
      image.PropertyKey.SCENE_CAPTURE_TYPE,
      image.PropertyKey.GAIN_CONTROL,
      image.PropertyKey.CONTRAST,
      image.PropertyKey.SATURATION,
      image.PropertyKey.SHARPNESS,
      image.PropertyKey.DEVICE_SETTING_DESCRIPTION,
      image.PropertyKey.SUBJECT_DISTANCE_RANGE
    ];
    imageSource.getImageProperties(key).then((data) => {
    }).catch((err: BusinessError) => {
      Logger.error(JSON.stringify(err));
    });
    if (options.base64) {
      let file = fs.openSync(this.photoPath, fs.OpenMode.READ_WRITE); // 打开文件

      let stat = fs.statSync(this.photoPath); // 获取文件状态
      Logger.info("stat.size:" + stat.size) // 打印文件的长度
      let buf = new ArrayBuffer(stat.size); // 创建一个ArrayBuffer对象
      let base64 = new util.Base64Helper(); // 实例化Base64Helper
      let num = fs.readSync(file.fd, buf); // 读取文件
      let data = base64.encodeSync(new Uint8Array(buf.slice(0, num))) //  转换成Uint8Array
      Logger.info(`data长度:${data.length}`)
      Logger.info(`data:${data}`)
      let textDecoder = util.TextDecoder.create('utf-8', { ignoreBOM: true })
      let retStr = textDecoder.decodeWithStream(data, { stream: false }); // 可以把Uint8Array转码成base64
      Logger.info("" + retStr) // 打印结果
      photoFile.base64 = retStr;
    }

    photoFile.deviceOrientation = devOrientation;

    this.photoPath = '';
    return photoFile;
  }

  async ModifyImageProperties(imageSourceObj: image.ImageSource) {
    let keyValues: Record<PropertyKey, string | null> = {
      [image.PropertyKey.IMAGE_WIDTH]: "0",
      [image.PropertyKey.IMAGE_LENGTH]: "0"
    };
    let checkKey = [image.PropertyKey.IMAGE_WIDTH, image.PropertyKey.IMAGE_LENGTH];
    imageSourceObj.modifyImageProperties(keyValues).then(() => {

    }).catch((err: BusinessError) => {
      Logger.error(`Failed to modify the Image Width and Image Height, error.code ${err.code}, error.message ${err.message}`);
    });
  }

  getOrientation(orientation: camera.ImageRotation) {
    switch (orientation) {
      case camera.ImageRotation.ROTATION_0:
        return Orientation.PORTRAIT;
      case camera.ImageRotation.ROTATION_90:
        return Orientation.LANDSCAPE_LEFT;
      case camera.ImageRotation.ROTATION_180:
        return Orientation.PORTRAIT_UPSIDE_DOWN;
      case camera.ImageRotation.ROTATION_270:
        return Orientation.LANDSCAPE_RIGHT;
      default:
        Logger.error(TAG, `getOrientation param:${orientation}`);
        break;
    }
  }

  /**
   * 等待path的值被设置
   * @returns
   */
  private waitForPathResult(): Promise<void> {
    return new Promise(resolve => {
      const intervalId = setInterval(() => {
        if (this.photoPath !== '') {
          clearInterval(intervalId);
          resolve();
        }
      }, 100);
    })
  }

  /**
   * 获取可用设备
   */
  getAvailableCameraDevices(): Array<camera.CameraDevice> {
    let camerasArray = this.cameraManager?.getSupportedCameras();
    if (!camerasArray) {
      Logger.error(TAG, 'getAvailableCameraDevices cannot get cameras');
      return;
    }
    this.camerasArray = camerasArray;
    return camerasArray;
  }

  convertCameraDevice(): CameraDeviceInfo[] {
    if (!this.camerasArray) {
      Logger.error(TAG, 'convertCameraDeviceInfo cameraDevices is null');
      return;
    }
    let cameraDevices = this.camerasArray

    let cameraArray: Array<CameraDeviceInfo> = [];
    for (const cameraDevice of cameraDevices) {
      let cameraInfo: CameraDeviceInfo = {} as CameraDeviceInfo;
      cameraInfo.id = cameraDevice.cameraId;
      cameraInfo.physicalDevices = this.getCameraPhysicalDevices(cameraDevice);
      cameraInfo.position = this.getCameraPosition(cameraDevice);
      cameraInfo.hasFlash = this.cameraManager?.isTorchSupported();
      cameraInfo.hasTorch = this.cameraManager?.isTorchModeSupported(camera.TorchMode.ON);

      let cameraDeviceFormats: Array<CameraDeviceFormat> = [];
      let capability =
        this.cameraManager.getSupportedOutputCapability(cameraDevice, camera.SceneMode.NORMAL_VIDEO);
      for (const pProfile of capability.photoProfiles) {
        let cameraDeviceFormat = {} as CameraDeviceFormat;
        cameraDeviceFormat.photoHeight = pProfile.size.height;
        cameraDeviceFormat.photoWidth = pProfile.size.width;
        cameraDeviceFormats.push(cameraDeviceFormat);
      }
      let supportedVideoStabilizationMode: Array<VideoStabilizationMode> =
        this.getSupportedVideoStabilizationMode(this.videoSession);
      for (const vProfile of capability.videoProfiles) {
        let cameraDeviceFormat = {} as CameraDeviceFormat;
        cameraDeviceFormat.videoHeight = vProfile.size.height;
        cameraDeviceFormat.videoWidth = vProfile.size.width;
        cameraDeviceFormat.minFps = vProfile.frameRateRange.min;
        cameraDeviceFormat.maxFps = vProfile.frameRateRange.max;
        cameraDeviceFormat.videoStabilizationModes = supportedVideoStabilizationMode;
        cameraDeviceFormats.push(cameraDeviceFormat);
      }
      // this.getVideoSessionParams(cameraDevice, cameraInfo, cameraDevices);
      cameraInfo.formats = cameraDeviceFormats;
      cameraArray.push(cameraInfo);
    }
    return cameraArray;
  }

  private getCameraPhysicalDevices(cameraDevice: camera.CameraDevice) {
    if (cameraDevice.cameraType === camera.CameraType.CAMERA_TYPE_WIDE_ANGLE) { // 广角相机
      return [PhysicalCameraDeviceType.WIDE_ANGLE_CAMERA];
    }
    if (cameraDevice.cameraType === camera.CameraType.CAMERA_TYPE_ULTRA_WIDE) { // 超广角相机
      return [PhysicalCameraDeviceType.ULTRA_WIDE_ANGLE_CAMERA];
    }
    if (cameraDevice.cameraType === camera.CameraType.CAMERA_TYPE_TELEPHOTO) { // 长焦相机
      return [PhysicalCameraDeviceType.TELEPHOTO_CAMERA];
    }
    return [];
  }

  private getCameraPosition(cameraDevice: camera.CameraDevice) {
    if (cameraDevice.connectionType !== camera.ConnectionType.CAMERA_CONNECTION_BUILT_IN) {
      return CameraPosition.EXTERNAL;
    }
    if (cameraDevice.cameraPosition === camera.CameraPosition.CAMERA_POSITION_BACK) {
      return CameraPosition.BACK;
    }
    if (cameraDevice.cameraPosition === camera.CameraPosition.CAMERA_POSITION_FRONT) {
      return CameraPosition.FRONT;
    }
    return CameraPosition.BACK;
  }

  initDeviceInfo(): CameraDeviceInfo[] {
    this.getAvailableCameraDevices();
    let cameraInfos = this.convertCameraDevice();
    return cameraInfos;
  }

  private getSupportedVideoStabilizationMode(videoSession: camera.VideoSession) {
    let supportedVideoStabilizationMode: Array<VideoStabilizationMode> = [];
    if (!videoSession) {
      Logger.warn(TAG, `getSupportedVideoStabilizationMode params videoSession is empty`)
      return supportedVideoStabilizationMode;
    }
    if (videoSession.isVideoStabilizationModeSupported(camera.VideoStabilizationMode.OFF)) {
      supportedVideoStabilizationMode.push(VideoStabilizationMode.OFF);
    }
    if (videoSession.isVideoStabilizationModeSupported(camera.VideoStabilizationMode.LOW)) {
      supportedVideoStabilizationMode.push(VideoStabilizationMode.STANDARD);
    }
    if (videoSession.isVideoStabilizationModeSupported(camera.VideoStabilizationMode.MIDDLE)) {
      supportedVideoStabilizationMode.push(VideoStabilizationMode.CINEMATIC);
    }
    if (videoSession.isVideoStabilizationModeSupported(camera.VideoStabilizationMode.HIGH)) {
      supportedVideoStabilizationMode.push(VideoStabilizationMode.CINEMATIC_EXTENDED);
    }
    if (videoSession.isVideoStabilizationModeSupported(camera.VideoStabilizationMode.AUTO)) {
      supportedVideoStabilizationMode.push(VideoStabilizationMode.AUTO);
    }
    return supportedVideoStabilizationMode;
  }

  private focusSupport(photoSession: camera.PhotoSession): boolean {
    if (photoSession.isFocusModeSupported(camera.FocusMode.FOCUS_MODE_MANUAL)) {
      return true
    }
    if (photoSession.isFocusModeSupported(camera.FocusMode.FOCUS_MODE_CONTINUOUS_AUTO)) {
      return true
    }
    if (photoSession.isFocusModeSupported(camera.FocusMode.FOCUS_MODE_AUTO)) {
      return true
    }
    if (photoSession.isFocusModeSupported(camera.FocusMode.FOCUS_MODE_LOCKED)) {
      return true
    }
    return false;
  }

  /**
   * @param options
  * 更新audio属性
   */
  setAudio(isAudio) {
    if (isAudio !== undefined) {
      this.hasAudio = isAudio
    }
  }

  setVideoFlashMode(mode: string) {
    let hasFlash = this.videoSession.hasFlash();
    if (!hasFlash) {
      this.onError('The device does not support the flash memory.');
    }
    if (mode === 'on' &&
    this.videoSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_OPEN)) {
      this.videoSession?.setFlashMode(camera.FlashMode.FLASH_MODE_OPEN);
    } else if (mode === 'off' &&
    this.videoSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_CLOSE)) {
      this.videoSession?.setFlashMode(camera.FlashMode.FLASH_MODE_CLOSE);
    } else if (mode === 'auto' && this.videoSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_AUTO)) {
      this.videoSession?.setFlashMode(camera.FlashMode.FLASH_MODE_AUTO);
    } else if (mode === 'torch' && this.videoSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_ALWAYS_OPEN)) {
      this.videoSession?.setFlashMode(camera.FlashMode.FLASH_MODE_ALWAYS_OPEN);
    }
  }

  /**
   * @note 开始录制
   * @param options RecordVideoOptions
   * @param props VisionCameraViewSpec.RawProps
   */
  async startRecording(options: RecordVideoOptions, prop: TempCameraProps) {
    if (this.avRecorder.state === 'stopped' || this.avRecorder.state === 'idle' || (this.avRecorder.state === 'prepared'
      && this.uphasAudio)) {
      try {
        //首次进入更改录像配置需要重新重转置
        if (this.uphasAudio) {
          await this.avRecorder.reset();
          this.uphasAudio = false
        }
        if (prop.captureAudio) {
          this.uphasAudio = true;
        } else {
          this.uphasAudio = false;
        }
        // // 重新进入 prepared 状态
        await this.avRecorder.prepare(this.prepareAVRecorderConfig(options, prop));
        await this.avRecorder.getInputSurface();
      } catch (error) {
        Logger.error(TAG, `restart recording error: ${JSON.stringify(error)}`);
      }
    }

    try {
      // 开始录制
      await this.avRecorder.start();
    } catch (error) {
      Logger.error(TAG, 'startRecording catch Failed to start recording.' + JSON.stringify(error))
      this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingError',
        new CameraCaptureError('capture/recording-in-progress', 'Failed to start recording.'));
    }

    if (options.mirrorVideo) {
      // this.enableMirror(this.videoOutput, true, this.avRecorder);
    }

    // 启动录像输出流
    this.videoOutput.start((err: BusinessError) => {
      if (err) {
        Logger.error(TAG, 'startRecording videoOutput.start Failed to start recording.' + JSON.stringify(err))
        this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingError',
          new CameraCaptureError('capture/recording-in-progress', 'Failed to start recording.'));
        return;
      }
    });
  }

  // getDeviceDegree(): Promise<number> {
  //   return new Promise<number>((resolve) => {
  //     try {
  //       sensor.once(sensor.SensorId.GRAVITY, (data: sensor.GravityResponse) => {
  //         Logger.info('Succeeded in invoking once. X-coordinate component: ' + data.x);
  //         Logger.info('Succeeded in invoking once. Y-coordinate component: ' + data.y);
  //         Logger.info('Succeeded in invoking once. Z-coordinate component: ' + data.z);
  //         let x = data.x;
  //         let y = data.y;
  //         let z = data.z;
  //         let deviceDegree: number;
  //         if ((x * x + y * y) * 3 < z * z) {
  //           deviceDegree = -1;
  //         } else {
  //           let sd: Decimal = Decimal.atan2(y, -x);
  //           let sc: Decimal = Decimal.round(Number(sd) / 3.141592653589 * 180)
  //           deviceDegree = 90 - Number(sc);
  //           deviceDegree = deviceDegree >= 0 ? deviceDegree % 360 : deviceDegree % 360 + 360;
  //         }
  //         resolve(deviceDegree);
  //       });
  //     } catch (error) {
  //       let err = error as BusinessError;
  //       console.error('Failed to register gravity sensor: ' + JSON.stringify(err));
  //       resolve(-1); // 异常时返回默认值
  //     }
  //   });
  // }

  // async enableMirror(videoOutput: camera.VideoOutput, mirrorMode: boolean,
  //   aVRecorder: media.AVRecorder): Promise<void> {
  //   try {
  //     videoOutput.enableMirror(mirrorMode);
  //     let deviceDegree = await this.getDeviceDegree();
  //     aVRecorder.updateRotation(videoOutput.getVideoRotation(deviceDegree));
  //   } catch (error) {
  //     let err = error as BusinessError;
  //   }
  // }

  /**
   * 停止录制
   */
  async stopRecording() {
    if (this.avRecorder != undefined) {
      if (this.avRecorder.state === 'started' || this.avRecorder.state === 'paused') {
        try {
          // 停止录制
          Logger.debug(TAG, `stopRecording`);
          await this.avRecorder.stop();
        } catch (error) {
          let err = error as BusinessError;
          Logger.error(TAG, `stopRecording: Failed to stop the avRecorder. error: ${JSON.stringify(err)}`);
          this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingError',
            new CameraCaptureError('capture/recording-in-progress', 'Failed to stop recording.'));
        }
        // 停止录像输出流
        this.videoOutput.stop((err: BusinessError) => {
          if (err) {
            Logger.error(TAG, `stopRecording: Failed to stop the video output. error: ${JSON.stringify(err)}`);
            this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingError',
              new CameraCaptureError('capture/recording-in-progress', 'Failed to stop recording.'));
            return;
          }
        });
      }
      // 重置
      await this.avRecorder.reset();
      // 此处不要释放录制实例，否则需要重新创建 videoOutput 加入 session里，会导致画面闪断

      if (this.videoSession.hasFlash() &&
        this.videoSession.getFlashMode() === camera.FlashMode.FLASH_MODE_ALWAYS_OPEN &&
      this.videoSession?.isFlashModeSupported(camera.FlashMode.FLASH_MODE_CLOSE)) {
        this.videoSession?.setFlashMode(camera.FlashMode.FLASH_MODE_CLOSE);
      }
    }
  }

  /**
   * 发送录制成功回调事件
   */
  async sendOnRecordingFinishedEvent(deviceOrientation: number) {
    let avMetadataExtractor: media.AVMetadataExtractor = await media.createAVMetadataExtractor();
    avMetadataExtractor.fdSrc = {
      fd: this.videoFile.fd
    }
    let avMetadata: media.AVMetadata;
    try {
      avMetadata = await avMetadataExtractor.fetchMetadata();
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `avMetadataExtractor fetch error: ${JSON.stringify(err)}`);
    }
    this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingFinished', {
      isRecordingInterrupted: false,
      deviceOrientation: deviceOrientation,
      uri: this.videoUri,
      videoOrientation: avMetadata.videoOrientation,
      codec: this.codec
    });

    Logger.error(TAG, `sendOnRecordingFinishedEvent:` + this.videoUri);
    // 关闭文件
    fs.closeSync(this.videoFile);
    this.videoFile = undefined;
  }

  /**
   * 暂停录制
   */
  async pauseRecording() {
    if (this.avRecorder != undefined && this.avRecorder.state === 'started') {
      await this.avRecorder.pause();
      this.videoOutput.stop((err: BusinessError) => {
        if (err) {
          Logger.error(TAG, `pauseRecording: Failed to stop the video output. error: ${JSON.stringify(err)}`);
          this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingError',
            new CameraCaptureError('capture/recording-in-progress', 'Failed to stop the video output.'));
          return;
        }
      });
    }
  }

  /**
   * 恢复录制
   */
  async resumeRecording() {
    if (this.avRecorder != undefined && this.avRecorder.state === 'paused') {
      this.videoOutput.start((err: BusinessError) => {
        if (err) {
          Logger.error(TAG, `resumeRecording: Failed to start the video output. error: ${JSON.stringify(err)}`);
          this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingError',
            new CameraCaptureError('capture/recording-in-progress', 'Failed to stop the video output.'));
          return;
        }
      });
      await this.avRecorder.resume();
    }
  }


  onCameraError(message: string) {
    if (this.ctx) {
      this.ctx.rnInstance.emitComponentEvent(
        this.tag,
        "NativeCamera", {
        type: 'onMountError',
        error: { "message": message }
      })
    }
  }

  onAudioConnected() {
    if (this.ctx) {
      this.ctx.rnInstance.emitComponentEvent(
        this.tag,
        "NativeCamera", {
        type: 'onAudioConnected'
      })
    }
  }

  onError(message: string) {
    if (this.ctx) {
      this.ctx.rnInstance?.emitDeviceEvent('onError', {
        nativeEvent: {
          errorMessage: `${TAG}: ${message}`
        }
      });
    }
  }
}
