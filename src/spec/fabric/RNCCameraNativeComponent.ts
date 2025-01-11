import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Double,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import {UnsafeMixed} from '../codegenUtils'

export interface NativeProps extends ViewProps {
  type?: string;
  cameraId?: string;
  ratio?: string,
  flashMode?: Int32,
  exposure?: Int32,
  autoFocus?: string,
  focusDepth?: Int32,
  autoFocusPointOfInterest?: UnsafeMixed<{ x: Int32, y: Int32 }>,
  zoom?: Int32,
  whiteBalance?: Int32,
  pictureSize?: string,
  barCodeTypes?: Array<string>,
  barCodeScannerEnabled: boolean,
  useCamera2Api?: boolean,
  playSoundOnCapture: boolean,
  faceDetectorEnabled: boolean,
  faceDetectionMode?: Int32,
  faceDetectionLandmarks?: Int32,
  faceDetectionClassifications?: Int32,
  trackingEnabled: boolean,
  googleVisionBarcodeDetectorEnabled: boolean,
  googleVisionBarcodeType?: Int32,
  googleVisionBarcodeMode?: Int32,
  textRecognizerEnabled?: boolean,
}

export interface NativeCommands {
  takePictureAsync: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  recordAsync: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  refreshAuthorizationStatus: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  stopRecording: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  pausePreview: (viewRef: React.ElementRef<HostComponent<NativeProps>>, javascript: string) => void;
  resumePreview: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  getAvailablePictureSizes: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    data: string,
  ) => void;
  getSupportedRatiosAsync: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    url: string,
  ) => void;
  isRecording: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'takePictureAsync',
    'recordAsync',
    'refreshAuthorizationStatus',
    'stopRecording',
    'pausePreview',
    'resumePreview',
    'getAvailablePictureSizes',
    'getSupportedRatiosAsync',
    'isRecording',
  ],
});

export default codegenNativeComponent<NativeProps>('RNCamera') as HostComponent<NativeProps>;
