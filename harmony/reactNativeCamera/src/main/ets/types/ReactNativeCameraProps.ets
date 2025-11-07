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