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


import { Permissions } from '@kit.AbilityKit';
import { ErrorWithCause } from '../types/CameraError';
import { Orientation } from './CameraEnumBox';

export interface Point {
  x: number;
  y: number;
}

type OrientationNumber = 1 | 2 | 3 | 4;

export interface TakePhotoOptions {

  // flash?: 'on' | 'off' | 'auto'
  //
  // enableAutoRedEyeReduction?: boolean
  //
  // enableAutoDistortionCorrection?: boolean
  //
  // enableShutterSound?: boolean
  quality?: number, //照片质量
  orientation?: Orientation | OrientationNumber, //照片方向
  base64?: boolean, //todo 不知道
  mirrorImage?: boolean, //是否镜像
  exif?: boolean, //是否exif格式
  writeExif?: boolean | { [name: string]: any }, //todo 不知道
  width?: number, //宽度
  fixOrientation?: boolean, //todo 不知道
  forceUpOrientation?: boolean, //强制向上方向
  pauseAfterCapture?: boolean, //拍摄后暂停
  imageType?: 'jpeg' | 'png', // 4.2.1 新增：拍照输出格式（png 走 ImagePacker 编码）
  path?: string, // 4.2.1 新增：自定义保存路径
}

export interface PhotoFile {

  width: number
  height: number
  pictureOrientation: Orientation
  deviceOrientation:number
  base64:string
  path: string
}

export interface ScanResult {
  codes: Code[]
  frame: CodeScannerFrame
}

export interface BarCodeReadEvent {
  data: string;
  rawData?: string;
  type: string;
  bounds: {
    origin: {
      x: string;
      y: string;
    }
    ; size: {
      width: string;
      height: string;
    }
  };
  /**
   * Raw image bytes in JPEG format (quality 100) as Base64-encoded string, only provided if `detectedImageInEvent=true`.
   */
  image: string;
}

export interface Code {
  type: string
  value?: string
  corners?: Point[]
  frame?: Frame
}

export interface CodeScannerFrame {
  width: number
  height: number
}

export interface Frame {
  x: number
  y: number
  width: number
  height: number
}

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

export interface CodeScanner {
  codeTypes: CodeType[]
  onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => void
}

export const PermissionArray: Array<Permissions> = [
  'ohos.permission.CAMERA',
  'ohos.permission.MICROPHONE',
  'ohos.permission.APPROXIMATELY_LOCATION'
];

export type CameraPermissionStatus = 'granted' | 'not-determined' | 'denied' | 'restricted'

export interface ScanRect {
  width: number,
  height: number
}

export type CameraPermissionRequestResult = 'granted' | 'denied'

export type CodeType =
  | 'code-128'
    | 'code-39'
    | 'code-93'
    | 'codabar'
    | 'ean-13'
    | 'ean-8'
    | 'itf'
    | 'upc-e'
    | 'upc-a'
    | 'qr'
    | 'pdf-417'
    | 'aztec'
    | 'data-matrix'

export interface OnErrorEvent {
  code: string
  message: string
  cause?: ErrorWithCause
}