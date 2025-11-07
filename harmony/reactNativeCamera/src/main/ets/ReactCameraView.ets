/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import camera from '@ohos.multimedia.camera';
import { Descriptor, RNComponentContext, RNViewBase } from '@rnoh/react-native-openharmony';
import Logger from './utils/Logger';
import { CameraCaptureError, CameraRuntimeError } from './types/CameraError';
import PermissionUtils from './utils/PermissionUtils';
import CameraSession from './service/CameraSession';
import {
  CameraPermissionRequestResult,
  CameraPermissionStatus,
  PhotoFile,
  Point,
  ScanResult,
  TakePhotoOptions
} from './core/CameraConfig';
import { display } from '@kit.ArkUI';
import ScanSession from './service/ScanSession';
import { cameraState } from './core/CameraEnumBox';
import CameraManager from './service/CameraManager';
import { CameraDeviceInfo } from './core/CameraDeviceInfo';
import Utils from './utils/Utils';
import { VisionCameraViewSpec } from './types/VisionCameraViewSpec';
import { RecordVideoOptions } from './types/VideoFile';
import { Permissions } from '@kit.AbilityKit';
import { scanBarcode } from '@kit.ScanKit';
import { BusinessError, emitter } from '@kit.BasicServicesKit';
import { ICallBack, MP4Parser } from '@ohos/mp4parser';
import fileio from '@ohos.fileio';
import { TempCameraProps } from './types/TempCameraProp';
import { ReactNativeCameraProps } from './types/ReactNativeCameraProps';
import { OrientationUtils } from './utils/OrientationUtils';
import { AuthType } from './types/AuthType';
import { customScan, scanCore } from '@kit.ScanKit';

const previewViewType: Record<'surface-view' | 'texture-view', 'surface' | 'texture'> = {
  'surface-view': 'surface',
  'texture-view': 'texture'
}
const TAG: string = 'ReactCameraView:'

export const REACT_NATIVE_CAMERA_TYPE: string = "NativeCamera"

export type ReactNativeCameraDescriptor = Descriptor<"NativeCamera", ReactNativeCameraProps>;

class TapPoint {
  x: number = 0;
  y: number = 0;
}

class TapCallBack {
  isDoubleTap: boolean = false;
  touchOrigin: TapPoint = new TapPoint();
}

class StartRecordingCallbackInner {
  uri: string = "";
  videoOrientation: number = -1;
  deviceOrientation: number = -1;
}

class StartRecordingCallback {
  nativeEvent: StartRecordingCallbackInner = new StartRecordingCallbackInner();
}

class StatusChange {
  cameraStatus: string = "";
  recordAudioPermissionStatus: string = "";
}

@Component
export struct ReactCameraView {
  private callbackList: Array<() => void> = []
  public static readonly NAME = VisionCameraViewSpec.NAME
  public ctx!: RNComponentContext
  public tag: number = -1
  @State private descriptorWrapper: VisionCameraViewSpec.DescriptorWrapper =
    {} as VisionCameraViewSpec.DescriptorWrapper
  private eventEmitter: VisionCameraViewSpec.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []
  private cleanCommandCallback?: () => void;
  @State propertyArr: Array<string> = [];
  private mXComponentController: XComponentController = new XComponentController();
  private surfaceId: string = '';
  context: Context = getContext(this);
  private localDisplay?: display.Display;
  private cameraSession: CameraSession = {} as CameraSession;
  private cameraState: cameraState = cameraState.PHOTO;
  rect: SurfaceRect = { surfaceWidth: 1920, surfaceHeight: 1080 };
  private scanSession: ScanSession = {} as ScanSession;
  private cameraManager: CameraManager = new CameraManager();
  @State scaleValue: number = 1;
  @State componentWidth: number = 0;
  @State componentHeight: number = 0;
  private timer = 0
  private enableZoomGesture: boolean | undefined = undefined;
  private prevProps: VisionCameraViewSpec.RawProps | undefined = undefined;
  private currentProps: VisionCameraViewSpec.RawProps = {} as VisionCameraViewSpec.RawProps;
  @State pageFlag: boolean = false;
  @State localDisplayWidth: number = 100;
  @State localDisplayHeight: number = 100;
  @State androidPreviewViewType: 'surface' | 'texture' = 'surface';
  private noViewPhoto: boolean = false;
  @State descriptor: ReactNativeCameraDescriptor = {} as ReactNativeCameraDescriptor
  @State autoFocus: string = "on";
  @State focusMode: camera.FocusMode = camera.FocusMode.FOCUS_MODE_AUTO;
  @State type: number = 1
  @State exposure: number = -1
  @State useNativeZoom: boolean = true
  @State zoom: number = 0
  @State tempProp: TempCameraProps = new TempCameraProps();
  @State focusDepth: number = 0;
  @State isRecording: boolean = false
  @State videoStabilizationMode: string = ""
  @State maxZoom: number = 0

  aboutToAppear() {
    this.localDisplay = display.getDefaultDisplaySync();
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<ReactNativeCameraDescriptor>(this.tag)
    this.getProp(this.descriptor)
    this.eventEmitter = new VisionCameraViewSpec.EventEmitter(this.ctx.rnInstance, this.tag)
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<VisionCameraViewSpec.DescriptorWrapper>(this.tag)!)

    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor) => {
        Logger.debug("subscribeToDescriptorChanges")
        this.descriptor = (_descriptor as ReactNativeCameraDescriptor)
        this.updateProp(this.descriptor);
      }
    ))
    this.subscribeToLifecycleEvents();

    // 设置预览宽高
    const width = this.descriptorWrapper.width;
    const height = this.descriptorWrapper.height;
    this.localDisplayWidth = vp2px(width) || this.localDisplay?.width;
    this.localDisplayHeight = vp2px(height) || this.localDisplay?.height;
    //todo vision camera的参数感觉对我没用
    // this.enableZoomGesture = props.enableZoomGesture;
    this.registerCommandCallback();

    if (this.descriptor.props.barCodeScannerEnabled) {
      Logger.debug("barCodeScannerEnabled")
      this.cameraState = cameraState.SCAN;
    }

    //请求权限，获取权限再初始化画面
    this.defaultGrantPermission(this.descriptor.props).then(res => {
      Logger.debug("defaultGrantPermission")
      this.surfaceId = this.mXComponentController.getXComponentSurfaceId();
      this.initSession(this.descriptor.props);
      this.onInitialized();
    });

    this.registerEvent();
  }

  private registerEvent() {
    let cameraCallback: Callback<emitter.GenericEventData<void>> =
      (eventData: emitter.GenericEventData<void>): void => {
        this.surfaceId = this.mXComponentController.getXComponentSurfaceId();
        this.initSession(this.descriptor.props);
        this.onInitialized();
        let isCameraAuth = eventData.data?.["isCameraAuth"];
        let statusChange = new StatusChange();
        if (isCameraAuth == AuthType.READY) {
          statusChange.cameraStatus = "ready"
        } else if (isCameraAuth == AuthType.PENDING_AUTHORIZATION) {
          statusChange.cameraStatus = "pending_authorization"
        } else {
          statusChange.cameraStatus = "not_authorized"
        }
        this.onStatusChange(statusChange)
      };
    // 收到eventId为"eventId"的事件后执行回调函数
    emitter.on("cameraCallback", cameraCallback);

    let audioCallback: Callback<emitter.GenericEventData<void>> = (eventData: emitter.GenericEventData<void>): void => {
      let isAudioAuth = eventData.data?.["isAudioAuth"];
      let statusChange = new StatusChange();
      if (isAudioAuth == AuthType.READY) {
        statusChange.recordAudioPermissionStatus = "ready"
      } else if (isAudioAuth == AuthType.PENDING_AUTHORIZATION) {
        statusChange.recordAudioPermissionStatus = "pending_authorization"
      } else {
        statusChange.recordAudioPermissionStatus = "not_authorized"
      }
      this.onStatusChange(statusChange)
    };
    // 收到eventId为"eventId"的事件后执行回调函数
    emitter.on("audioCallback", audioCallback);
  }

  private getProp(descriptor: ReactNativeCameraDescriptor) {
    Logger.debug(`RNOH in NativeCamera descriptor props, ${JSON.stringify(descriptor.props)}`);
    this.tempProp = descriptor.props;

    if (descriptor.props.exposure) {
      Logger.debug(`RNOH in NativeCamera descriptor exposure, ${JSON.stringify(descriptor.props.exposure)}`);
      this.exposure = descriptor.props.exposure;
    }

    if (descriptor.props.useNativeZoom) {
      Logger.debug(`RNOH in NativeCamera descriptor useNativeZoom, ${JSON.stringify(descriptor.props.useNativeZoom)}`);
      this.useNativeZoom = descriptor.props.useNativeZoom;
    }


    if (descriptor.props.focusDepth) {
      Logger.debug(`RNOH in NativeCamera descriptor focusDepth, ${JSON.stringify(descriptor.props.focusDepth)}`);
      this.focusDepth = descriptor.props.focusDepth;
    }

    if (descriptor.props.videoStabilizationMode != null) {
      Logger.debug(`RNOH in NativeCamera descriptor videoStabilizationMode, ${JSON.stringify(descriptor.props.videoStabilizationMode)}`);
      this.videoStabilizationMode = descriptor.props.videoStabilizationMode;
    }

  }

  private updateProp(descriptor: ReactNativeCameraDescriptor) {
    Logger.debug(`RNOH in NativeCamera descriptor props, ${JSON.stringify(descriptor.props)}`);
    this.tempProp = descriptor.props;
    this.cameraSession.changeCameraPosition({
      surfaceId: this.surfaceId, props: this.tempProp,
      mediaModel: this.cameraState === cameraState.PHOTO ? camera.SceneMode.NORMAL_PHOTO : camera.SceneMode.NORMAL_VIDEO
    })


    if (descriptor.props.defaultVideoQuality != null) {
      Logger.debug(`RNOH in NativeCamera descriptor defaultVideoQuality, ${JSON.stringify(descriptor.props.defaultVideoQuality)}`);
      this.cameraSession.resetVideoSession({
        surfaceId: this.surfaceId, props: this.tempProp,
        mediaModel: this.cameraState === cameraState.PHOTO ? camera.SceneMode.NORMAL_PHOTO :
          camera.SceneMode.NORMAL_VIDEO
      })
    }

    if (descriptor.props.pictureSize && descriptor.props.pictureSize.includes("x")) {
      Logger.debug(`RNOH in NativeCamera descriptor pictureSize, ${JSON.stringify(descriptor.props.pictureSize)}`);
      this.cameraSession.changePictureSize({
        surfaceId: this.surfaceId, props: this.tempProp,
        mediaModel: this.cameraState === cameraState.PHOTO ? camera.SceneMode.NORMAL_PHOTO :
          camera.SceneMode.NORMAL_VIDEO
      })
    }

    if (descriptor.props.exposure) {
      Logger.debug(`RNOH in NativeCamera descriptor exposure, ${JSON.stringify(descriptor.props.exposure)}`);
      this.exposure = descriptor.props.exposure;
      this.cameraSession.setExposure(this.exposure)
    }

    if (descriptor.props.captureAudio != null) {
      Logger.debug(`RNOH in NativeCamera descriptor captureAudio, ${JSON.stringify(descriptor.props.captureAudio)}`);
      this.cameraSession.setAudio(descriptor.props.captureAudio)
    }

    if (descriptor.props.useNativeZoom) {
      Logger.debug(`RNOH in NativeCamera descriptor useNativeZoom, ${JSON.stringify(descriptor.props.useNativeZoom)}`);
      this.useNativeZoom = descriptor.props.useNativeZoom;
    }

    if (descriptor.props.maxZoom > 0) {
      this.maxZoom = descriptor.props.maxZoom
    }

    if (descriptor.props.zoom && this.zoom != descriptor.props.zoom) {
      Logger.debug(`RNOH in NativeCamera descriptor zoom, ${JSON.stringify(descriptor.props.zoom)}`);
      this.zoom = descriptor.props.zoom;
      if (this.maxZoom > 0) {
        Logger.debug(`RNOH in NativeCamera descriptor maxZoom, ${JSON.stringify(descriptor.props.maxZoom)}`);
        if (this.zoom > this.maxZoom) {
          this.cameraSession.setSmoothZoom(this.maxZoom)
        } else {
          this.cameraSession.setSmoothZoom(this.zoom);
        }
      } else {
        this.cameraSession.setSmoothZoom(this.zoom);
      }

    }

    if (descriptor.props.focusDepth) {
      Logger.debug(`RNOH in NativeCamera descriptor focusDepth, ${JSON.stringify(descriptor.props.focusDepth)}`);
      this.focusDepth = descriptor.props.focusDepth;
    }

    if (descriptor.props.videoStabilizationMode != null) {
      Logger.debug(`RNOH in NativeCamera descriptor videoStabilizationMode, ${JSON.stringify(descriptor.props.videoStabilizationMode)}`);
      this.videoStabilizationMode = descriptor.props.videoStabilizationMode;
    }

    if (descriptor.props.flashMode) {
      Logger.debug(`RNOH in NativeCamera descriptor flashMode, ${JSON.stringify(descriptor.props.flashMode)}`);
      this.cameraSession.setTorch(descriptor.props.flashMode)
    }

    if (descriptor.props.whiteBalance) {
      Logger.debug(`RNOH in NativeCamera descriptor whiteBalance, ${JSON.stringify(descriptor.props.whiteBalance)}`);
      this.cameraSession.setWhiteBalance(descriptor.props.whiteBalance)
    }

    if (descriptor.props.autoFocus === "on") {
      Logger.debug("autoFocus" + descriptor.props.autoFocus)
      this.focusMode = camera.FocusMode.FOCUS_MODE_AUTO
      this.cameraSession.focusRn(this.focusMode, descriptor.props.autoFocusPointOfInterest);
    } else {
      this.focusMode = camera.FocusMode.FOCUS_MODE_AUTO
      this.cameraSession.focusRn(this.focusMode);
    }

    if (descriptor.props.autoFocus === "off" && descriptor.props.focusDepth) {
      Logger.debug("focusDepth" + descriptor.props.focusDepth)
      this.focusMode = camera.FocusMode.FOCUS_MODE_AUTO
      this.cameraSession.focusRn(this.focusMode, { "x": descriptor.props.focusDepth, "y": descriptor.props.focusDepth })
    }


  }

  /**
   * 初始化Session
   */
  async initSession(props: TempCameraProps): Promise<void> {
    Logger.debug("initSession")
    return new Promise(async (resolve, reject) => {
      if (this.cameraState === cameraState.SCAN) {
        Logger.debug("SCANSession")
        this.scanSession = new ScanSession(this.ctx);
        this.scanSession.initScan(scanCore.ScanType.ALL);
        this.scanStart(true);
      } else {
        Logger.debug("CameraSession")
        this.cameraSession = new CameraSession(this.ctx);
        this.cameraSession.setTagId(this.tag)
        await this.cameraSession.initCamera(this.surfaceId, props,
          this.cameraState === cameraState.PHOTO ? camera.SceneMode.NORMAL_PHOTO : camera.SceneMode.NORMAL_VIDEO)
          .then(() => {

          });

        this.cameraSession.setResizeMode('cover', this.localDisplayWidth, this.localDisplayHeight,
          (width, height) => {
            this.componentWidth = width;
            this.componentHeight = height;
          });
      }
      resolve()
    })

  }

  /**
   * 请求权限
   */
  async defaultGrantPermission(props: ReactNativeCameraProps) {
    const permissions: Permissions[] = [
      'ohos.permission.CAMERA',
    ]
    if (props.captureAudio = true) {
      permissions.push('ohos.permission.MICROPHONE')
    }
    try {
      const res = await new PermissionUtils().defaultGrantPermission(permissions);
      Logger.debug("getpermison:" + res)
      return res;
    } catch (e) {
      throw (new Error(e))
    }
  }

  /**
   * 订阅生命周期监听事件
   */
  subscribeToLifecycleEvents() {
    this.callbackList.push(this.ctx.rnInstance.subscribeToLifecycleEvents("FOREGROUND", () => {
      const props = this.tempProp;
      if (this.cameraState === cameraState.SCAN) {
        setTimeout(() => {
          this.scanSession = new ScanSession();
          this.scanSession.initScan(scanCore.ScanType.ALL);
          // if (props.isActive) {
          this.scanStart(true);
          // }
        }, 200)
      } else {
        try {
          let mediaModel =
            this.cameraState === cameraState.VIDEO ? camera.SceneMode.NORMAL_VIDEO : camera.SceneMode.NORMAL_PHOTO
          this.cameraSession.initCamera(this.surfaceId, this.tempProp, mediaModel)
          this.cameraSession.setResizeMode('cover', this.localDisplayWidth, this.localDisplayHeight,
            (width, height) => {
              this.componentWidth = width;
              this.componentHeight = height;
            });
        } catch (err) {
          Logger.error(TAG, `subscribeToLifecycleEvents initCamera error: ${JSON.stringify(err)}`);
        }
      }
    })
    )
    this.callbackList.push(this.ctx.rnInstance.subscribeToLifecycleEvents("BACKGROUND", async () => {
      if (this.cameraState === cameraState.SCAN) {
        clearTimeout(this.timer)
        await this.scanSession.scanStop();
        this.scanSession.scanRelease();
      } else {
        this.cameraSession.cameraRelease()
      }
    }))
  }

  private onDescriptorWrapperChange(descriptorWrapper: VisionCameraViewSpec.DescriptorWrapper) {
    this.descriptorWrapper = descriptorWrapper;
    const descriptorBase = descriptorWrapper['descriptor'];
    const props = descriptorBase.rawProps;
    this.currentProps = props;
    if (this.cameraState !== cameraState.SCAN && !Utils.isEmptyObject(this.cameraSession)) {
      Logger.debug("arkts 6")
      //todo 我需要操作吗单独更新吗，还是使用getprop
      // this.updateProps(props);
    }
    if (this.cameraState === cameraState.SCAN && !Utils.isEmptyObject(this.scanSession)) {
      const isActiveChange = props.isActive !== undefined && this.prevProps?.isActive !== props.isActive;
      if (isActiveChange) {
        if (props.isActive) {
          this.scanStart(true);
        } else {
          this.scanSession.scanStop();
          this.scanSession.setEndStatus(true);
        }
      }
      if (props.torch !== undefined && this.prevProps?.torch !== props.torch) {
        this.scanSession.setTorch(props.torch);
      }
    }
    this.prevProps = props;
  }

  async aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
    if (this.cameraState === cameraState.SCAN) {
      clearTimeout(this.timer)
      await this.scanSession.scanStop();
      this.scanSession.scanRelease();
    } else {
      await this.cameraSession.cameraRelease();
    }
    this.cleanCommandCallback?.();
    this.cancellationCallback()
  }

  sleep(delay: number) {
    let start = new Date().getTime();
    while ((new Date().getTime() - start) < delay) {
      continue;
    }
  }

  registerCommandCallback() {
    if (this.ctx) {
      this.ctx.componentCommandReceiver.registerCommandCallback(
        this.tag,
        async (command, args: (string | number | boolean | object)[]) => {
          if (command === 'takePicture') {
            Logger.debug(TAG, `registerCommandCallback: takePicture,  ${command}`)
            const options = args[0] as TakePhotoOptions;
            if (this.cameraState == cameraState.VIDEO) {
              this.cameraState = cameraState.PHOTO
              this.initSession(this.tempProp)
              this.sleep(10)
              this.takePhoto(options)
            } else {
              this.takePhoto(options)
            }

          }
          if (command === 'record') {
            const options = args[0] as RecordVideoOptions;
            Logger.debug(TAG, `registerCommandCallback: record.${JSON.stringify(options)}}`)
            if (this.cameraState == cameraState.PHOTO) {
              this.cameraState = cameraState.VIDEO
              await this.initSession(this.tempProp);
              this.sleep(10)
              this.startRecording(options);
            } else {
              this.startRecording(options);
            }
            let startRecordCallback: StartRecordingCallback = new StartRecordingCallback();
            startRecordCallback.nativeEvent.uri = "";
            if (options.orientation) {
              startRecordCallback.nativeEvent.videoOrientation =
                OrientationUtils.getOrientationNumber(options.orientation);
            }
            startRecordCallback.nativeEvent.deviceOrientation = OrientationUtils.getDefaultDisplay();

            this.ctx.rnInstance.emitComponentEvent(
              this.tag,
              VisionCameraViewSpec.NAME, {
              type: 'onRecordingStart',
              data: startRecordCallback
            })

          }
          if (command === 'stopRecording') {
            Logger.debug(TAG, `registerCommandCallback: stopRecording,  ${command}`)
            this.stopRecording();
            this.ctx.rnInstance.emitComponentEvent(
              this.tag,
              VisionCameraViewSpec.NAME, {
              type: 'onRecordingEnd'
            })
          }
          if (command === 'pauseRecording') {
            Logger.debug(TAG, `registerCommandCallback: pauseRecording,  ${command}`)
            this.pauseRecording();
          }
          if (command === 'resumeRecording') {
            Logger.debug(TAG, `registerCommandCallback: resumeRecording,  ${command}`)
            this.resumeRecording();
          }
          if (command === 'pausePreview') {
            Logger.debug(TAG, `registerCommandCallback: pausePreview.`)
            this.cameraSession.activeChange(false);
          }
          if (command === 'resumePreview') {
            Logger.debug(TAG, `registerCommandCallback: resumePreview.`)
            this.cameraSession.activeChange(true);
          }
          if (command === 'getAvailablePictureSizes') {
            Logger.debug(TAG, `registerCommandCallback: getAvailablePictureSizes.`)
          }
          if (command === 'isRecording') {
            Logger.debug(TAG, `registerCommandCallback: isRecording.`)
            this.ctx.rnInstance.emitDeviceEvent('isRecording', this.isRecording);
          }
        });
    }
  }

  onInitialized() {
    Logger.debug(TAG, "onCameraReady")
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      VisionCameraViewSpec.NAME, {
      type: 'onCameraReady'
    })
  }

  onStatusChange(status: StatusChange) {
    Logger.debug(TAG, "onStatusChange")
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      VisionCameraViewSpec.NAME, {
      type: 'onStatusChange',
      statusChange: status
    })
  }

  onError(cameraError: CameraRuntimeError) {
    this.ctx.rnInstance.emitDeviceEvent('onError', cameraError);
  }

  async scanStart(isFirst?: boolean) {
    clearTimeout(this.timer)
    let scanResult: ScanResult | Array<scanBarcode.ScanResult> | undefined = undefined;
    const isActive = this.descriptorWrapper['rawProps'].isActive;
    try {
      this.scanSession.scanStart(this.surfaceId,
        { width: this.localDisplayWidth, height: this.localDisplayHeight }, isFirst, isActive,
        (error: BusinessError, result: Array<scanBarcode.ScanResult>) => {
          if (error) {
            Logger.error(TAG, `start failed, code: ${error.code}, message: ${error.message} `)
            return;
          }
          scanResult = result;
          if (scanResult) {
            const callbackResult = this.scanSession.showScanResult(result);
            Logger.info("scanResult" + callbackResult)
            this.ctx.rnInstance.emitComponentEvent(
              this.tag,
              VisionCameraViewSpec.NAME, {
              type: 'onBarCodeRead',
              data: callbackResult
            })
          }
          customScan.rescan();
        });
    } catch (error) {
      if (error.code === '1000500001') {
        this.onError(new CameraRuntimeError('unknown/unknown', 'codeScanner preview size not support.'))
      }
    }

  }

  /**
   * 拍照
   */
  async takePhoto(options: TakePhotoOptions): Promise<PhotoFile> {
    const photoFile = await this.cameraSession.takePhoto(options,OrientationUtils.getDefaultDisplay());
    this.ctx.rnInstance.emitDeviceEvent('onTaskPhoto', photoFile);
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      VisionCameraViewSpec.NAME, {
      type: 'onPictureTaken'
    })
    return photoFile;
  }

  /**
   * 获取可用设备
   */
  getAvailableCameraDevices(): CameraDeviceInfo[] {
    return this.cameraManager.getAvailableCameraDevices();
  }

  /**
   * 获取当前相机权限状态
   */
  getCameraPermissionStatus(): CameraPermissionStatus {
    return this.cameraManager.getCameraPermissionStatus();
  }

  /**
   * 向用户请求相机权限
   */
  requestCameraPermission(): Promise<CameraPermissionRequestResult> {
    return this.cameraManager.requestCameraPermission();
  }

  /**
   * 获取当前麦克风录制权限状态
   */
  getMicrophonePermissionStatus(): CameraPermissionStatus {
    return this.cameraManager.getMicrophonePermissionStatus();
  }

  /**
   * 向用户请求麦克风权限
   */
  requestMicrophonePermission(): Promise<CameraPermissionRequestResult> {
    return this.cameraManager.requestMicrophonePermission();
  }

  /**
   * 获取当前位置权限状态
   */
  getLocationPermissionStatus(): CameraPermissionStatus {
    return this.cameraManager.getLocationPermissionStatus();
  }

  /**
   * 向用户请求位置权限
   */
  requestLocationPermission(): Promise<CameraPermissionRequestResult> {
    return this.cameraManager.requestLocationPermission();
  }

  /**
   * 开始录制
   */
  startRecording(options: RecordVideoOptions): void {
    this.isRecording = true
    this.cameraSession.startRecording(options,this.tempProp)
  }

  /**
   * 停止录制
   */
  async stopRecording() {
    await this.cameraSession.stopRecording()
    this.isRecording = false
    //当帧率设置30fps时直接回调，不需要转换，系统默认录制出来是30fps
    if (this.cameraSession.fps == 30) {
      Logger.debug("stopRecording fps 30")
      this.cameraSession.sendOnRecordingFinishedEvent(OrientationUtils.getDefaultDisplay());
      return;
    }
    //由于系统Api media.AVRecorder->prepare录制后videoFrameRate设置无效，因此使用FFmpeg处理帧率转换
    let inPath = this.cameraSession.videoUri;
    let outPath = this.context.cacheDir + "/temp.mp4";
    let this_ = this;
    let callBack: ICallBack = {
      async callBackResult(code: number) {
        if (code == 0) { //处理转换帧率成功
          await this_.copyFile(outPath, inPath);
          this_.cameraSession.sendOnRecordingFinishedEvent(OrientationUtils.getDefaultDisplay());
        } else {
          this.ctx && this.ctx.rnInstance.emitDeviceEvent('onRecordingError',
            new CameraCaptureError('capture/recording-in-progress', 'Failed to stop recording.'));
        }
      }
    }
    MP4Parser.ffmpegCmd("ffmpeg -y -i " + inPath + " -r " + this.cameraSession.fps + " -c:v libopenh264 -c:a copy " +
      outPath, callBack)
  }

  /**
   * 拷贝文件
   * @param srcPath
   * @param destPath
   * @returns
   */
  async copyFile(srcPath: string, destPath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let srcFd: number = -1;
      let destFd: number = -1;
      const bufferSize: number = 4096;
      const buffer: ArrayBuffer = new ArrayBuffer(bufferSize);

      try {
        srcFd = await fileio.open(srcPath, 0o102, 0o666);
        if (srcFd === -1) {
          throw new Error(`Unable to open the source file: ${srcPath}`);
        }
        destFd = await fileio.open(destPath, 0o102, 0o666);
        if (destFd === -1) {
          throw new Error(`Unable to open the target file: ${destPath}`);
        }
        let bytesRead: number;
        do {
          bytesRead = await fileio.readSync(srcFd, buffer);
          if (bytesRead > 0) {
            const bytesWritten = await fileio.write(destFd, buffer, { length: bytesRead });
            if (bytesWritten !== bytesRead) {
              throw new Error(`Writing the file is incomplete. It was expected to write ${bytesRead} bytes, but actually wrote ${bytesWritten} bytes`);
            }
          }
        } while (bytesRead > 0);
        resolve();
      } catch (err) {
        reject(new Error(`File copy failed: ${err.message}`));
      } finally {
        if (srcFd !== -1) {
          try {
            await fileio.close(srcFd);
          } catch (closeErr) {
            Logger.error(`Failed to close the source file descriptor: ${closeErr.message}`);
          }
        }
        if (destFd !== -1) {
          try {
            await fileio.close(destFd);
          } catch (closeErr) {
            Logger.error(`Failed to close the target file descriptor: ${closeErr.message}`);
          }
        }
      }
    });
  }

  /**
   * 暂停录制
   */
  pauseRecording() {
    this.isRecording = false
    this.cameraSession.pauseRecording()
  }

  /**
   * 恢复录制
   */
  resumeRecording() {
    this.isRecording = true
    this.cameraSession.resumeRecording()
  }

  cancellationCallback() {
    this.callbackList.forEach(
      callback => {
        callback?.()
      }
    )
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
      controlsFocus: false
    }) {
      Stack({ alignContent: Alignment.Bottom }) {

        Column() {
          XComponent({
            id: 'CameraViewComponent',
            type: this.androidPreviewViewType,
            controller: this.mXComponentController
          })
            .onLoad(() => {
              this.surfaceId = this.mXComponentController.getXComponentSurfaceId();
            })
            .width(this.cameraState === cameraState.SCAN ? this.localDisplayWidth + 'px' : this.componentWidth + 'px')
            .height(this.cameraState === cameraState.SCAN ? this.localDisplayHeight + 'px' :
              this.componentHeight + 'px')
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .gesture(
          GestureGroup(GestureMode.Parallel, PinchGesture({ fingers: 2 })// 当捏合手势触发时，可以通过回调函数获取缩放比例，从而修改组件的缩放比例
            .onActionUpdate((event: GestureEvent) => {
              this.scaleValue = this.cameraSession.photoPreviewScale * event.scale;
            })
            .onActionEnd(() => {
              Logger.debug("usenativezoom")
              if (this.useNativeZoom) {
                Logger.debug("usenativezoom" + this.scaleValue)
                this.cameraSession.setSmoothZoom(this.scaleValue);
              }
            }), TapGesture({ count: 1 })
            .onAction((event: GestureEvent) => {
              if (event) {
                let tapCallback = new TapCallBack();
                tapCallback.isDoubleTap = false;
                if (event.fingerList[0]) {
                  tapCallback.touchOrigin.x = event.fingerList[0].displayX;
                  tapCallback.touchOrigin.y = event.fingerList[0].displayY;
                  if (this.cameraState === cameraState.PHOTO) {
                    this.cameraSession.focus(this.focusMode,
                      { x: vp2px(event.fingerList[0].displayX), y: vp2px(event.fingerList[0].displayY) } as Point)
                  }
                  this.ctx.rnInstance.emitComponentEvent(
                    this.tag,
                    VisionCameraViewSpec.NAME, {
                    type: 'onTouch',
                    tapCallback: tapCallback
                  })
                }
              }
            }), TapGesture({ count: 2 })
            .onAction((event: GestureEvent) => {
              if (event) {
                let tapCallback = new TapCallBack();
                tapCallback.isDoubleTap = true;
                if (event.fingerList[0]) {
                  tapCallback.touchOrigin.x = event.fingerList[0].displayX;
                  tapCallback.touchOrigin.y = event.fingerList[0].displayY;
                  this.ctx.rnInstance.emitComponentEvent(
                    this.tag,
                    VisionCameraViewSpec.NAME, {
                    type: 'onTouch',
                    tapCallback: tapCallback
                  })
                }
              }
            }))
          // 在组件上绑定三指触发的捏合手势

        )
      }
      .width(this.localDisplayWidth + 'px')
      .height(this.localDisplayHeight + 'px')
    }
  }
}