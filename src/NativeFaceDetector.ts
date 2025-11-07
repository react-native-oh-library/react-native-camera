import { TurboModule, TurboModuleRegistry } from 'react-native';

type DetectionOptions = {
  mode?: {},
  detectLandmarks?: {},
  runClassifications?: {},
};

export interface Spec extends TurboModule {
  detectFaces(options: DetectionOptions, uri: string): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('RNCFaceDector');
