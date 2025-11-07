/**
 * MIT License
 *
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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
  autoFocus: string,
  autoFocusPointOfInterest: FocusPoint,
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
  videoStabilizationMode: string,
  defaultVideoQuality: string,
  keepAudioSession: boolean
}