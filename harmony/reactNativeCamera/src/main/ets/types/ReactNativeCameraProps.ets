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

import { ViewBaseProps } from "@rnoh/react-native-openharmony"

export interface FocusPoint {
  x: number,
  y: number
}

export interface RectOfInterest {
  x: number,
  y: number,
  width: number,
  height: number
}

export interface ReactNativeCameraProps extends ViewBaseProps {
  zoomControlsVisible: boolean,
  trafficEnabled: boolean,
  baiduHeatMapEnabled: boolean,
  zoomGesturesEnabled: boolean, //是否充许手势缩放
  scrollGesturesEnabled: boolean, //是否允许拖动
  mapType: number,
  showsUserLocation: boolean,
  autoFocus: string | number,
  autoFocusPointOfInterest: FocusPoint,
  cameraId: string,
  pictureSize: string,
  type: string,
  flashMode: string,
  exposure: number,
  captureAudio: boolean,
  useNativeZoom: boolean,
  zoom: number,
  maxZoom: number,
  focusDepth: number,
  barCodeScannerEnabled: boolean,
  detectedImageInEvent: boolean,
  googleVisionBarcodeType: number,
  googleVisionBarcodeMode: number,
  rectOfInterest: RectOfInterest,
  faceDetectionMode: number,
  faceDetectionLandmarks: number,
  faceDetectionClassifications: number,
  trackingEnabled: boolean,
  ratio: string,
  whiteBalance: string,
  playSoundOnCapture: boolean,
  playSoundOnRecord: boolean,
  videoStabilizationMode: string,
  defaultVideoQuality: string,
  keepAudioSession: boolean
}