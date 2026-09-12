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


import type {
  AutoFocusSystem,
  VideoStabilizationMode,
  PhysicalCameraDeviceType,
  CameraPosition,
  HardwareLevel,
  Orientation
} from './CameraEnumBox'

export interface CameraDeviceFormat {
  photoHeight: number

  photoWidth: number

  videoHeight: number

  videoWidth: number

  maxISO: number

  minISO: number

  fieldOfView: number

  supportsVideoHdr: boolean

  supportsPhotoHdr: boolean

  supportsDepthCapture: boolean

  minFps: number

  maxFps: number

  autoFocusSystem: AutoFocusSystem

  videoStabilizationModes: VideoStabilizationMode[]
}

export interface CameraDeviceInfo {

  id: string

  physicalDevices: PhysicalCameraDeviceType[]

  position: CameraPosition

  name: string

  hasFlash: boolean

  hasTorch: boolean

  minFocusDistance: number

  isMultiCam: boolean

  minZoom: number

  maxZoom: number

  neutralZoom: number

  minExposure: number

  maxExposure: number

  formats: CameraDeviceFormat[]

  supportsLowLightBoost: boolean

  supportsRawCapture: boolean

  supportsFocus: boolean

  hardwareLevel: HardwareLevel

  sensorOrientation: Orientation
}

export class  SimpleCameraDeviceInfo {

  deviceType: string = ''

  id: string = ''

  type: number = 0
}