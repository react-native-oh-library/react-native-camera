/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the MIT License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://github.com/react-native-camera/react-native-camera/blob/v4.2.1/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { TurboModulesFactory } from '@rnoh/react-native-openharmony/ts';
import { RNOHPackage } from '@rnoh/react-native-openharmony';
import type { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { FaceDectorTurboModule } from './FaceDectorTurboModule';

class FaceDectorTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === 'RNCFaceDector') {
      return new FaceDectorTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === 'RNCFaceDector';
  }
}

export class FaceDectorPackage extends RNOHPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new FaceDectorTurboModulesFactory(ctx);
  }
}
