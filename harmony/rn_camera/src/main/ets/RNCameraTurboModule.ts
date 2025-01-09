import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "./generated/ts"

export class RNCameraModule extends TurboModule implements TM.CameraTurboModule.Spec {
  private logger = this.ctx.logger.clone("RNCameraModule")

  getConstants(): TM.CameraTurboModule.ConstantsType {
    let result = {
      stubbed: true,
      Type: {
        back: 1,
      },
      VideoQuality: {
        '2160p': '2',
        '1080p': '2',
        '720p': '2',
        '480p': '2',
        '4:3': '2',
        '288p': '2',
      },
      VideoCodec: 2,
      AutoFocus: {
        on: 1,
      },
      FlashMode: {
        off: 1,
      },
      WhiteBalance: {
        auto: true,
      },
      Orientation: {},
      BarCodeType: {},
      FaceDetection: {
        fast: 1,
        Mode: {},
        Landmarks: {
          none: 1,
        },
        Classifications: {
          none: 1,
        },
      },
      GoogleVisionBarcodeDetection: {
        BarcodeType: {None: 2},
        BarcodeMode: {NORMAL: 2},
      },
      Exposure: 1,
      VideoStabilization: {},
    }

    return result;
  };

  pausePreview(): void {
    this.logger.info('pausePreview has been invoked')
  }

  resumePreview(): void {
    this.logger.info('resumePreview has been invoked')
  }

  takePicture(): void {
    this.logger.info('takePicture has been invoked')
  }

  record(): void {
    this.logger.info('record has been invoked')
  }

  stopRecording(): void {
    this.logger.info('stopRecording has been invoked')
  }

  getSupportedRatios(): void {
    this.logger.info('getSupportedRatios has been invoked')
  }

  getCameraIds(): void {
    this.logger.info('getCameraIds has been invoked')
  }

  getAvailablePictureSizes(): string[] {
    this.logger.info('getAvailablePictureSizes has been invoked')
    return ['']
  }

  checkIfRecordAudioPermissionsAreDefined(): boolean {
    this.logger.info('checkIfRecordAudioPermissionsAreDefined has been invoked')
    return true;
  }
  isRecording(): boolean {
    return true;
  }

  checkVideoAuthorizationStatus(): boolean {
    this.logger.info('checkVideoAuthorizationStatus has been invoked')
    return true;
  }
}