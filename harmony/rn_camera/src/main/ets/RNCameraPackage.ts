import { RNPackage, TurboModulesFactory } from '@rnoh/react-native-openharmony/ts';
import type {
  TurboModule,
  TurboModuleContext,
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  DescriptorWrapperFactoryByDescriptorType
} from '@rnoh/react-native-openharmony/ts';
import { RNCameraModule } from './RNCameraTurboModule';
import { FaceDetectorModule } from './FaceDetectorModule';
import { TM, RNC } from "./generated/ts"

class RNCameraTurboModuleFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === TM.CameraTurboModule.NAME) {
      globalThis.uiAbilityContext = this.ctx.uiAbilityContext;
      return new RNCameraModule(this.ctx);
    }
    if (name === TM.RNFaceDetector.NAME) {
      globalThis.uiAbilityContext = this.ctx.uiAbilityContext;
      return new FaceDetectorModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === TM.CameraTurboModule.NAME || name === TM.RNFaceDetector.NAME;
  }
}

export class RNCameraPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new RNCameraTurboModuleFactory(ctx);
  }

  createDescriptorWrapperFactoryByDescriptorType(
    ctx: DescriptorWrapperFactoryByDescriptorTypeCtx
  ): DescriptorWrapperFactoryByDescriptorType {

    return {
      [RNC.RNCamera.NAME]: (ctx) =>
      new RNC.RNCamera.DescriptorWrapper(ctx.descriptor),
    };
  }
}