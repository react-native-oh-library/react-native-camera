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