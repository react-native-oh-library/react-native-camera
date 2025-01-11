import { TurboModuleRegistry, RootTag } from 'react-native';
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';

/**
 * Codegen restriction: All TypeScript interfaces extending TurboModule must be called 'Spec'.
 */

export interface ConstantsType {
  stubbed: boolean;
  Type: {
    back: number;
  };
  AutoFocus: {
    on: number;
  };
  FlashMode: {
    off: number;
  };
  WhiteBalance: {
    auto: boolean;
  };
  Orientation: {};
  BarCodeType: Object;
  VideoQuality: Object;
  VideoCodec: number;
  FaceDetection: {
    fast: number;
    Mode: Object;
    Landmarks: {
      none: number;
    };
    Classifications: {
      none: number;
    };
  };
  GoogleVisionBarcodeDetection: {
    BarcodeType: { None: number };
    BarcodeMode: { NORMAL: number };
  };
  Exposure: number;
  VideoStabilization: Object;
}

export interface Spec extends TurboModule {
  getConstants(): ConstantsType;
  pausePreview(_cameraHandle?: number): void;
  isRecording(_cameraHandle?: number): boolean;
  checkVideoAuthorizationStatus(): boolean;
  checkIfRecordAudioPermissionsAreDefined(): boolean;
  resumePreview(_cameraHandle?: number): void;
  takePicture(): void;
  record(options: Object, _cameraHandle?: number): void;
  stopRecording(_cameraHandle?: number): void;
  getSupportedRatios(): void;
  getCameraIds(): void;
  getAvailablePictureSizes(ratio: number, _cameraHandle?: number): string[];
  checkIfRecordAudioPermissionsAreDefined(): void;
}

export default TurboModuleRegistry.get<Spec>('CameraTurboModule')!;
