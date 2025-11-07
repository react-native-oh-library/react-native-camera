/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
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