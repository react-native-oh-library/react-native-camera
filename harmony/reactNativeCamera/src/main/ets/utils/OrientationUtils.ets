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