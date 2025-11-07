/**
 * MIT License
 *
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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