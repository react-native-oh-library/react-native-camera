import { TurboModule, TurboModuleRegistry } from 'react-native';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

export type CameraId = {
  id:string,
  type:Int32
}

export interface Spec extends TurboModule {
  getCameraPermission: () => Promise<boolean>;
  getAuidPermission(): Promise<boolean>;
  getCameraIds():Promise<CameraId[]>;
  getAvailablePictureSizes():Promise<string[]>;
}

export default TurboModuleRegistry.get<Spec>('RNCCameraModule');
