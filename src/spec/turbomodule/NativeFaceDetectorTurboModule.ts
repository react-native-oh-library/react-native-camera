import { TurboModuleRegistry, RootTag } from 'react-native';
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';

/**
 * Codegen restriction: All TypeScript interfaces extending TurboModule must be called 'Spec'.
 */

export interface FaceDetectorConstantsType {
  stubbed: boolean;
  Mode: Object;
  Landmarks: Object;
  Classifications: Object;
}

export interface Spec extends TurboModule {
  getConstants(): FaceDetectorConstantsType;
  detectFaces(option: Object): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('RNFaceDetector')!;
