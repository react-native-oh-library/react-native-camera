import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "./generated/ts"

export class FaceDetectorModule extends TurboModule implements TM.RNFaceDetector.Spec {
  private logger = this.ctx.logger.clone("FaceDetectorModule")

  getConstants(): TM.RNFaceDetector.FaceDetectorConstantsType {
    this.logger.info('getConstants has been invoked')
    return {
      stubbed: false,
      Mode: {},
      Landmarks: {},
      Classifications: {}
    }
  }

  detectFaces(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}