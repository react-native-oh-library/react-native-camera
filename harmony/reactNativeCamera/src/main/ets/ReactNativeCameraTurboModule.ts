/**
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
        data.push(temp)
      }
      resolve(data)
    });
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
}
