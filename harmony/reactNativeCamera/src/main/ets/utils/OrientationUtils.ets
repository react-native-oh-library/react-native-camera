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

import { display } from '@kit.ArkUI';
import { Orientation } from '../core/CameraEnumBox';
import Logger from '../Logger';

export class OrientationUtils {
  static getDefaultDisplay(): number {
    let displayClass: display.Display | null = null;
    try {
      displayClass = display.getDefaultDisplaySync();
    } catch (exception) {
      Logger.error('Failed to obtain the default display object. Code: ' + JSON.stringify(exception));
    }

    if (displayClass) {
      return displayClass.orientation;
    }

    return -1;
  }

  static getOrientationNumber(orientation: Orientation): number {
    switch (orientation) {
      case Orientation.PORTRAIT:
        return 0;
      case Orientation.LANDSCAPE_RIGHT:
        return 1;
      case Orientation.PORTRAIT_UPSIDE_DOWN:
        return 2;
      case Orientation.LANDSCAPE_LEFT:
        return 3;
      default:
        return -1;
    }
  }
}