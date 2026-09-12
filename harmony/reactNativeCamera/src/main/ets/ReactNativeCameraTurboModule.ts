/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the MIT License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://github.com/react-native-camera/react-native-camera/blob/v4.2.1/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



import type { TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { BusinessError, emitter } from '@kit.BasicServicesKit';
import { abilityAccessCtrl, common, Context } from '@kit.AbilityKit';
import PermissionUtils from './utils/PermissionUtils';
import { preferences } from '@kit.ArkData';
import Logger from './Logger';
import { SimpleCameraDeviceInfo } from './core/CameraDeviceInfo';
import { camera } from '@kit.CameraKit';
import { AuthType } from './types/AuthType';
import { media } from '@kit.MediaKit';
import fs from '@ohos.file.fs';

const TAG: string = '[RNOH]ReactNativeCameraTurboModule'


export class ReactNativeCameraTurboModule extends TurboModule {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  getCameraPermission(): Promise<boolean> {
    Logger.debug("getCameraPermission")
    return new Promise(async (resolve, reject) => {
      let context: Context = this.ctx.getUIContext().getHostContext() as common.UIAbilityContext;
      let localPreferences = await preferences.getPreferences(context, 'myStore')
      if (!new PermissionUtils().checkPermission('ohos.permission.CAMERA')) {
        if (localPreferences.getSync("isFirstCameraAuth", true)) { //第一次使用用户授权获取权限
          localPreferences.putSync("isFirstCameraAuth", false)
          localPreferences.flushSync();
          this.sendCameraEvent(AuthType.PENDING_AUTHORIZATION);
          let userAuth = new PermissionUtils().grantPermission('ohos.permission.CAMERA')
          if (userAuth) {
            this.sendCameraEvent(AuthType.PENDING_AUTHORIZATION);
            resolve(true)
          } else {
            this.sendCameraEvent(AuthType.NOT_AUTHORIZED);
            resolve(false)
          }
        } else {
          let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
          this.sendCameraEvent(AuthType.PENDING_AUTHORIZATION);
          atManager.requestPermissionOnSetting(context, ['ohos.permission.CAMERA'])
            .then((data: Array<abilityAccessCtrl.GrantStatus>) => {
              Logger.info(`requestPermissionOnSetting success, result: ${data}`);
              if (data[0] == 0) {
                this.sendCameraEvent(AuthType.READY);
                resolve(true)
              } else {
                this.sendCameraEvent(AuthType.NOT_AUTHORIZED);
                resolve(false)
              }
            })
            .catch((err: BusinessError) => {
              this.sendCameraEvent(AuthType.NOT_AUTHORIZED);
              Logger.error(`requestPermissionOnSetting fail, code: ${err.code}, message: ${err.message}`);
            });
        }

      } else {
        resolve(true)
      }
    });
  }

  private sendCameraEvent(type: AuthType) {
    let eventData: emitter.EventData = {
      data: {
        "isCameraAuth": type
      }
    };
    emitter.emit("cameraCallback", eventData);
  }

  private sendAudioEvent(type: AuthType) {
    let eventData: emitter.EventData = {
      data: {
        "isAudioAuth": type
      }
    };
    emitter.emit("audioCallback", eventData);
  }

  getAuidPermission(): Promise<boolean> {
    Logger.debug("getAuidPermission")
    return new Promise(async (resolve, reject) => {
      if (!new PermissionUtils().checkPermission('ohos.permission.MICROPHONE')) {
        let context: Context = this.ctx.getUIContext().getHostContext() as common.UIAbilityContext;
        let localPreferences = await preferences.getPreferences(context, 'myStore')
        if (localPreferences.getSync("isFirstAudioAuth", true)) { //第一次使用用户授权获取权限
          localPreferences.putSync("isFirstAudioAuth", false)
          localPreferences.flushSync();
          this.sendAudioEvent(AuthType.PENDING_AUTHORIZATION)
          let userAuth = new PermissionUtils().grantPermission('ohos.permission.MICROPHONE')
          if (userAuth) {
            this.sendAudioEvent(AuthType.READY)
            resolve(true)
          } else {
            this.sendAudioEvent(AuthType.NOT_AUTHORIZED)
            resolve(false)
          }
        } else {
          let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
          this.sendAudioEvent(AuthType.PENDING_AUTHORIZATION)
          atManager.requestPermissionOnSetting(context, ['ohos.permission.MICROPHONE'])
            .then((data: Array<abilityAccessCtrl.GrantStatus>) => {
              Logger.info(`requestPermissionOnSetting success, result: ${data}`);
              if (data[0] == 0) {
                this.sendAudioEvent(AuthType.READY)
                resolve(true)
              } else {
                this.sendAudioEvent(AuthType.NOT_AUTHORIZED)
                resolve(false)
              }
            })
            .catch((err: BusinessError) => {
              this.sendAudioEvent(AuthType.NOT_AUTHORIZED)
              Logger.error(`requestPermissionOnSetting fail, code: ${err.code}, message: ${err.message}`);
            });
        }

      } else {
        resolve(true)
      }
    });
  }

  getCameraIds(): Promise<SimpleCameraDeviceInfo[]> {
    Logger.debug("getCameraIds")
    return new Promise(async (resolve, reject) => {
      let cameraManager = camera.getCameraManager(this.ctx.getUIContext().getHostContext());
      let camerasArrayTemp = cameraManager?.getSupportedCameras();
      let data: SimpleCameraDeviceInfo[] = [];
      for (let i = 0; i < camerasArrayTemp.length; i++) {
        let temp = new SimpleCameraDeviceInfo();
        temp.id = camerasArrayTemp[i].cameraId;
        temp.type = camerasArrayTemp[i].cameraType;
        temp.deviceType = this.getDeviceType(camerasArrayTemp[i].cameraType);
        data.push(temp)
      }
      resolve(data)
    });
  }

  private getDeviceType(cameraType: camera.CameraType): string {
    switch (cameraType) {
      case camera.CameraType.CAMERA_TYPE_ULTRA_WIDE:
        return 'AVCaptureDeviceTypeBuiltInUltraWideCamera';
      case camera.CameraType.CAMERA_TYPE_WIDE_ANGLE:
        return 'AVCaptureDeviceTypeBuiltInWideAngleCamera';
      case camera.CameraType.CAMERA_TYPE_TELEPHOTO:
        return 'AVCaptureDeviceTypeBuiltInTelephotoCamera';
      default:
        return 'AVCaptureDeviceTypeBuiltInWideAngleCamera';
    }
  }

  getAvailablePictureSizes(): Promise<string[]> {
    Logger.debug("getAvailablePictureSizes")
    return new Promise(async (resolve, reject) => {
      let cameraManager = camera.getCameraManager(this.ctx.getUIContext().getHostContext());
      let camerasArray = cameraManager?.getSupportedCameras();
      if (!camerasArray) {
        Logger.error(TAG, 'getAvailableCameraDevices cannot get cameras');
        reject('getAvailableCameraDevices cannot get cameras')
        return;
      }
      let data :string[] = [];
      let capability = cameraManager.getSupportedOutputCapability(camerasArray[0], camera.SceneMode.NORMAL_PHOTO);
      for (let i = 0; i < capability.photoProfiles.length; i++) {
        data[i] = capability.photoProfiles[i].size.width + "x" + capability.photoProfiles[i].size.height
      }
      resolve(data)
    });
  }

  hasTorch(): Promise<boolean> {
    Logger.debug("hasTorch")
    return new Promise((resolve, reject) => {
      try {
        let cameraManager = camera.getCameraManager(this.ctx.getUIContext().getHostContext());
        let isSupported: boolean = cameraManager.isTorchModeSupported(camera.TorchMode.ON);
        resolve(isSupported)
      } catch (err) {
        let businessError = err as BusinessError;
        Logger.error(TAG, `hasTorch failed, code: ${businessError.code}, message: ${businessError.message}`);
        reject(businessError)
      }
    });
  }

  checkIfVideoIsValid(path: string): Promise<boolean> {
    Logger.debug("checkIfVideoIsValid")
    return new Promise(async (resolve, reject) => {
      let fileExists = fs.accessSync(path);
      if (!fileExists) {
        resolve(false)
        return;
      }
      let avMetadataExtractor: media.AVMetadataExtractor = await media.createAVMetadataExtractor();
      let file = fs.openSync(path, fs.OpenMode.READ_ONLY);
      avMetadataExtractor.fdSrc = {
        fd: file.fd
      }
      avMetadataExtractor.fetchMetadata().then((metadata) => {
        if (metadata.duration.length > 0 && parseInt(metadata.duration) > 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      }).catch((err: BusinessError) => {
        Logger.error(TAG, `checkIfVideoIsValid fetchMetadata failed, code: ${err.code}, message: ${err.message}`);
        resolve(false)
      }).finally(() => {
        avMetadataExtractor.release();
        fs.closeSync(file);
      });
    });
  }

  getSupportedPreviewFpsRange(handle: number): Promise<string[]> {
    Logger.debug("getSupportedPreviewFpsRange")
    return new Promise(async (resolve, reject) => {
      try {
        let cameraManager = camera.getCameraManager(this.ctx.getUIContext().getHostContext());
        let camerasArray = cameraManager?.getSupportedCameras();
        if (!camerasArray) {
          Logger.error(TAG, 'getSupportedPreviewFpsRange cannot get cameras');
          reject('getSupportedPreviewFpsRange cannot get cameras')
          return;
        }
        let deviceIndex = handle >= 0 && handle < camerasArray.length ? handle : 0;
        let capability =
          cameraManager.getSupportedOutputCapability(camerasArray[deviceIndex], camera.SceneMode.NORMAL_VIDEO);
        let data: string[] = [];
        for (let i = 0; i < capability.videoProfiles.length; i++) {
          let fpsRange = capability.videoProfiles[i].frameRateRange;
          data.push(`${fpsRange.min},${fpsRange.max}`)
        }
        resolve(data)
      } catch (err) {
        let businessError = err as BusinessError;
        Logger.error(TAG,
          `getSupportedPreviewFpsRange failed, code: ${businessError.code}, message: ${businessError.message}`);
        reject(businessError)
      }
    });
  }

  getSupportedRatios(handle: number): Promise<string[]> {
    Logger.debug("getSupportedRatios")
    return new Promise(async (resolve, reject) => {
      try {
        let cameraManager = camera.getCameraManager(this.ctx.getUIContext().getHostContext());
        let camerasArray = cameraManager?.getSupportedCameras();
        if (!camerasArray) {
          Logger.error(TAG, 'getSupportedRatios cannot get cameras');
          reject('getSupportedRatios cannot get cameras')
          return;
        }
        let deviceIndex = handle >= 0 && handle < camerasArray.length ? handle : 0;
        let capability =
          cameraManager.getSupportedOutputCapability(camerasArray[deviceIndex], camera.SceneMode.NORMAL_VIDEO);
        let data: string[] = [];
        for (let i = 0; i < capability.previewProfiles.length; i++) {
          let w = capability.previewProfiles[i].size.width;
          let h = capability.previewProfiles[i].size.height;
          // 辗转相除化简为最简整数比，与 Android 上游 "4:3"/"16:9" 输出格式对齐
          let a = w;
          let b = h;
          while (b !== 0) {
            let t = b;
            b = a % b;
            a = t;
          }
          let ratio = (w / a) + ':' + (h / a);
          if (!data.includes(ratio)) {
            data.push(ratio);
          }
        }
        resolve(data)
      } catch (err) {
        let businessError = err as BusinessError;
        Logger.error(TAG,
          `getSupportedRatios failed, code: ${businessError.code}, message: ${businessError.message}`);
        reject(businessError)
      }
    });
  }
}
