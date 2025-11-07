import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { WithDefault, Float, DirectEventHandler, Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps, HostComponent } from 'react-native';
import codegenNativeCommands from "react-native/Libraries/Utilities/codegenNativeCommands";

export type BarcodeType =
  | 'EMAIL'
  | 'PHONE'
  | 'CALENDAR_EVENT'
  | 'DRIVER_LICENSE'
  | 'GEO'
  | 'SMS'
  | 'CONTACT_INFO'
  | 'WIFI'
  | 'TEXT'
  | 'ISBN'
  | 'PRODUCT'
  | 'URL';


type BarCodeType = Readonly<{
  aztec: any;
  code128: any;
  code39: any;
  code39mod43: any;
  code93: any;
  ean13: any;
  ean8: any;
  pdf417: any;
  qr: any;
  upc_e: any;
  interleaved2of5: any;
  itf14: any;
  datamatrix: any;
}>;

interface Point {
  x: Int32;
  y: Int32;
}

interface Size {
  width: Int32;
  height: Int32;
}

export interface Email {
  address?: string;
  body?: string;
  subject?: string;
  emailType?: 'UNKNOWN' | 'Work' | 'Home';
}

export interface Phone {
  Int32?: string;
  phoneType?: 'UNKNOWN' | 'Work' | 'Home' | 'Fax' | 'Mobile';
}

export interface Barcode {
  bounds: {
    size: Size;
    origin: Point;
  };
  data: string;
  dataRaw: string;
  type: BarcodeType;
  format?: string;
  addresses?: {
    addressesType?: 'UNKNOWN' | 'Work' | 'Home';
    addressLines?: string[];
  }[];
  emails?: Email[];
  phones?: Phone[];
  urls?: string[];
  name?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    prefix?: string;
    pronounciation?: string;
    suffix?: string;
    formattedName?: string;
  };
  phone?: Phone;
  organization?: string;
  latitude?: Int32;
  longitude?: Int32;
  ssid?: string;
  password?: string;
  encryptionType?: string;
  title?: string;
  url?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  addressCity?: string;
  addressState?: string;
  addressStreet?: string;
  addressZip?: string;
  birthDate?: string;
  documentType?: string;
  licenseNumber?: string;
  expiryDate?: string;
  issuingDate?: string;
  issuingCountry?: string;
  eventDescription?: string;
  location?: string;
  organizer?: string;
  status?: string;
  summary?: string;
  start?: string;
  end?: string;
  email?: Email;
  phoneNumber?: string;
  message?: string;
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

export interface GoogleVisionBarcodesDetectedEvent {
  type: string;
  barcodes: Barcode[];
  target: Int32;
  /**
   * Raw image bytes in JPEG format (quality 100) as Base64-encoded string, only provided if `detectedImageInEvent=true`.
   */
  image?: string;
}

export interface GoogleVisionBarcodesDetectedEvent {
  type: string;
  barcodes: Barcode[];
  target: Int32;
  /**
   * Raw image bytes in JPEG format (quality 100) as Base64-encoded string, only provided if `detectedImageInEvent=true`.
   */
  image?: string;
}

export interface MountError {
  error?: ErrorMessage;
}

export interface ErrorMessage {
  message?: string;
}

export interface SubjectAreaChanged {
  nativeEvent?: ErrorMessage;
}

export interface NativeEvent {
  prevPoint?: ErrorMessage;
}

export interface PrevPoint {
  x?: Int32;
  y?: Int32;
}

type Rect = {
  x: Int32,
  y: Int32,
  width: Int32,
  height: Int32,
};

type Orientation = 'auto' | 'landscapeLeft' | 'landscapeRight' | 'portrait' | 'portraitUpsideDown';
type OrientationNumber = 1 | 2 | 3 | 4;

type PictureOptions = {
  quality?: Int32,
  orientation?: Orientation | OrientationNumber,
  base64?: boolean,
  mirrorImage?: boolean,
  exif?: boolean,
  writeExif?: boolean | { [name: string]: any },
  width?: Int32,
  fixOrientation?: boolean,
  forceUpOrientation?: boolean,
  pauseAfterCapture?: boolean,
};

export interface TakePictureResponse {
  width: Int32;
  height: Int32;
  uri: string;
  base64?: string;
  exif?: { [name: string]: any };
  pictureOrientation: Int32;
  deviceOrientation: Int32;
}

type VideoCodec = Readonly<{
  H264: symbol;
  JPEG: symbol;
  HVEC: symbol;
  AppleProRes422: symbol;
  AppleProRes4444: symbol;
}>;
type ImageType = Readonly<{
  'jpeg': any;
  'png': any;
}>;

interface RecordOptions {
  quality?: keyof VideoQuality;
  orientation?: keyof Orientation | OrientationNumber;
  maxDuration?: Int32;
  maxFileSize?: Int32;
  mute?: boolean;
  mirrorVideo?: boolean;
  path?: string;
  videoBitrate?: Int32;

  /** iOS only */
  codec?: keyof VideoCodec | VideoCodec[keyof VideoCodec];
  fps?: Int32;
}

export type RecordResponse = {
  /** Path to the video saved on your app's cache directory. */
  uri: string;
  videoOrientation: Int32;
  deviceOrientation: Int32;
  isRecordingInterrupted: boolean;
  /** iOS only */
  codec: VideoCodec[keyof VideoCodec];
}


export type VoidEventData = Readonly<{}>;

interface TapCallback {
  isDoubleTap: boolean;
  touchOrigin: {
    x: Int32;
    y: Int32;
  };
}

interface CameraErrorMessage {
  message: string
}

interface RecordStartData {
  nativeEvent: {
    uri: string;
    videoOrientation: Int32;
    deviceOrientation: Int32;
  };
}

type VideoStabilizationMode = 'off' | 'standard' | 'cinematic' | 'auto';

type VideoQuality = '2160p' | '1080p' | '720p' | '480p' | '4:3' | '288p';

type AutoFocusMode = 'on' | 'off';

type CameraType = 'back' | 'front';

interface StatuChange {
  cameraStatus: "ready" | "pending_authorization" | "not_authorized";
  recordAudioPermissionStatus: "ready" | "pending_authorization" | "not_authorized";
}

type WhiteBalance = 'sunny' | 'cloudy' | 'shadow' | 'incandescent' | 'fluorescent' | 'auto';

type FlashMode = 'on' | 'off' | 'torch' | 'auto';

export interface NativeProps extends ViewProps {
  autoFocus: WithDefault<AutoFocusMode, "on">,
  autoFocusPointOfInterest?: { x: Int32, y: Int32 },
  pictureSize?: string,
  type?: WithDefault<CameraType, 'back'>,
  flashMode?: WithDefault<FlashMode, "auto">,
  useCamera2Api?: boolean,
  exposure?: Int32,
  captureAudio?: boolean,
  useNativeZoom?: boolean,
  zoom?: Int32,
  maxZoom?: Int32,
  focusDepth?: Int32,
  detectedImageInEvent?: boolean,
  barCodeTypes?: Array<string>,
  googleVisionBarcodeType?: Int32,
  googleVisionBarcodeMode?: Int32,
  rectOfInterest: Rect,
  faceDetectionMode?: Int32,
  faceDetectionLandmarks?: Int32,
  faceDetectionClassifications?: Int32,
  trackingEnabled?: boolean,
  ratio?: string,
  defaultVideoQuality?: WithDefault<VideoQuality, "1080p">,
  keepAudioSession?: boolean,
  videoStabilizationMode?: WithDefault<VideoStabilizationMode, "auto">,
  whiteBalance?: WithDefault<WhiteBalance, "auto">,
  playSoundOnCapture?: boolean,
  barCodeScannerEnabled: boolean,
  touchDetectorEnabled: boolean,
  googleVisionBarcodeDetectorEnabled: boolean,
  faceDetectorEnabled: boolean,
  textRecognizerEnabled: boolean,
  onBarCodeRead: DirectEventHandler<BarCodeReadEvent>,
  onGoogleVisionBarcodesDetected: DirectEventHandler<GoogleVisionBarcodesDetectedEvent>,
  onCameraReady: DirectEventHandler<VoidEventData>,
  onAudioInterrupted: DirectEventHandler<VoidEventData>,
  onAudioConnected: DirectEventHandler<VoidEventData>,
  onPictureSaved: DirectEventHandler<VoidEventData>,
  onFaceDetected: DirectEventHandler<VoidEventData>,
  onTouch: DirectEventHandler<TapCallback>,
  // onLayout: boolean,
  onMountError: DirectEventHandler<CameraErrorMessage>,
  onSubjectAreaChanged: DirectEventHandler<SubjectAreaChanged>,
  onRecordingStart: DirectEventHandler<RecordStartData>,
  onRecordingEnd: DirectEventHandler<VoidEventData>,
  onPictureTaken: DirectEventHandler<VoidEventData>,
  onStatusChange: DirectEventHandler<StatuChange>,
}

type NativeCameraType = HostComponent<NativeProps>;
export interface NativeCommands {
  takePicture: (viewRef: React.ElementRef<NativeCameraType>, options?: PictureOptions) => Promise<TakePictureResponse>;
  record(viewRef: React.ElementRef<NativeCameraType>, options?: RecordOptions): Promise<RecordResponse>;
  stopRecording(viewRef: React.ElementRef<NativeCameraType>): void;
  pauseRecording(viewRef: React.ElementRef<NativeCameraType>): void;
  resumeRecording(viewRef: React.ElementRef<NativeCameraType>): void;
  pausePreview(viewRef: React.ElementRef<NativeCameraType>): void;
  resumePreview(viewRef: React.ElementRef<NativeCameraType>): void;
  getAvailablePictureSizes(viewRef: React.ElementRef<NativeCameraType>): Promise<string[]>;
  getSupportedRatios(viewRef: React.ElementRef<NativeCameraType>): Promise<string[]>;
  getSupportedPreviewFpsRange(viewRef: React.ElementRef<NativeCameraType>): Promise<string[]>;
  isRecording(viewRef: React.ElementRef<NativeCameraType>): Promise<boolean>;
}

export const reactCameraCommands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ["takePicture", "record", "stopRecording",
    "pauseRecording", "resumeRecording", "pausePreview", "resumePreview", "getAvailablePictureSizes"
    , "getSupportedRatios", "getSupportedPreviewFpsRange", "isRecording"]
});

export default codegenNativeComponent<NativeProps>('NativeCamera') as NativeCameraType;