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
interface FocusPoint {
  x: number,
  y: number
}

interface RectOfInterest {
  x: number,
  y: number,
  width: number,
  height: number
}

export class TempCameraProps {
  zoomControlsVisible: boolean = false;
  trafficEnabled: boolean = false;
  baiduHeatMapEnabled: boolean = false;
  zoomGesturesEnabled: boolean = false; //是否充许手势缩放
  scrollGesturesEnabled: boolean = false; //是否允许拖动
  mapType: number = 0;
  showsUserLocation: boolean = false;
  autoFocus: string = "";
  autoFocusPointOfInterest: FocusPoint = null;
  pictureSize: string = "";
  type: string = "back";
  flashMode: string = "";
  exposure: number = 0;
  captureAudio: boolean = false;
  useNativeZoom: boolean = false;
  zoom: number = 0;
  maxZoom: number = 0;
  focusDepth: number = 0;
  detectedImageInEvent: boolean = false;
  googleVisionBarcodeType: number = 0;
  googleVisionBarcodeMode: number = 0;
  rectOfInterest: RectOfInterest;
  barCodeScannerEnabled: boolean = false;
  faceDetectionMode: number = 0;
  faceDetectionLandmarks: number = 0;
  faceDetectionClassifications: number = 0;
  trackingEnabled: boolean = false;
  ratio: string = "";
  playSoundOnCapture: boolean = false;
  videoStabilizationMode: string = "";
  defaultVideoQuality: string = "";
  keepAudioSession: boolean = false
  whiteBalance: string = ""
}