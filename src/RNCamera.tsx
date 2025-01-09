// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {
  findNodeHandle,
  Platform,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import {ViewPropTypes} from 'deprecated-react-native-prop-types'
import RNCamera from './spec/fabric/RNCCameraNativeComponent'
import CameraTurboModule from './spec/turbomodule/NativeCameraTurboModule'

import type { FaceFeature } from './FaceDetector';

const Rationale = PropTypes.shape({
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttonPositive: PropTypes.string,
  buttonNegative: PropTypes.string,
  buttonNeutral: PropTypes.string,
});

const requestPermissions = async (
  captureAudio: boolean,
  CameraManager: any,
  androidCameraPermissionOptions: Rationale,
  androidRecordAudioPermissionOptions: Rationale,
): Promise<{ hasCameraPermissions: boolean, hasRecordAudioPermissions: boolean }> => {
  let hasCameraPermissions = false;
  let hasRecordAudioPermissions = false;


  hasCameraPermissions = await CameraManager.checkVideoAuthorizationStatus();

  if (captureAudio) {
    hasRecordAudioPermissions = await CameraManager.checkRecordAudioAuthorizationStatus?.();
  }

  return {
    hasCameraPermissions,
    hasRecordAudioPermissions,
  };
};

const styles = StyleSheet.create({
  authorizationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notAuthorizedText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

type Orientation = 'auto' | 'landscapeLeft' | 'landscapeRight' | 'portrait' | 'portraitUpsideDown';
type OrientationNumber = 1 | 2 | 3 | 4;

type PictureOptions = {
  quality?: number,
  orientation?: Orientation | OrientationNumber,
  base64?: boolean,
  mirrorImage?: boolean,
  exif?: boolean,
  writeExif?: boolean | { [name: string]: any },
  width?: number,
  fixOrientation?: boolean,
  forceUpOrientation?: boolean,
  pauseAfterCapture?: boolean,
};

type TrackedFaceFeature = FaceFeature & {
  faceID?: number,
};

type TrackedTextFeature = {
  type: string,
  bounds: {
    size: {
      width: number,
      height: number,
    },
    origin: {
      x: number,
      y: number,
    },
  },
  value: string,
  components: Array<TrackedTextFeature>,
};

type TrackedBarcodeFeature = {
  bounds: {
    size: {
      width: number,
      height: number,
    },
    origin: {
      x: number,
      y: number,
    },
  },
  data: string,
  dataRaw: string,
  type: BarcodeType,
  format?: string,
  addresses?: {
    addressesType?: 'UNKNOWN' | 'Work' | 'Home',
    addressLines?: string[],
  }[],
  emails?: Email[],
  phones?: Phone[],
  urls?:(string[]),
  name?: {
    firstName?: string,
    lastName?: string,
    middleName?: string,
    prefix?: string,
    pronounciation?: string,
    suffix?: string,
    formattedName?: string,
  },
  phone?: Phone,
  organization?: string,
  latitude?: number,
  longitude?: number,
  ssid?: string,
  password?: string,
  encryptionType?: string,
  title?: string,
  url?: string,
  firstName?: string,
  middleName?: string,
  lastName?: string,
  gender?: string,
  addressCity?: string,
  addressState?: string,
  addressStreet?: string,
  addressZip?: string,
  birthDate?: string,
  documentType?: string,
  licenseNumber?: string,
  expiryDate?: string,
  issuingDate?: string,
  issuingCountry?: string,
  eventDescription?: string,
  location?: string,
  organizer?: string,
  status?: string,
  summary?: string,
  start?: string,
  end?: string,
  email?: Email,
  phoneNumber?: string,
  message?: string,
};

type BarcodeType =
  | 'EMAIL'
  | 'PHONE'
  | 'CALENDAR_EVENT'
  | 'DRIVER_LICENSE'
  | 'GEO'
  | 'SMS'
  | 'CONTACT_INFO'
  | 'WIFI'
  | 'TEXT'
  | 'ISBN'
  | 'PRODUCT'
  | 'URL';

type Email = {
  address?: string,
  body?: string,
  subject?: string,
  emailType?: 'UNKNOWN' | 'Work' | 'Home',
};

type Phone = {
  number?: string,
  phoneType?: 'UNKNOWN' | 'Work' | 'Home' | 'Fax' | 'Mobile',
};

type RecordingOptions = {
  maxDuration?: number,
  maxFileSize?: number,
  orientation?: Orientation,
  quality?: number | string,
  codec?: string,
  mute?: boolean,
  path?: string,
  videoBitrate?: number,
};

type EventCallbackArgumentsType = {
  nativeEvent: Object,
};

type Rect = {
  x: number,
  y: number,
  width: number,
  height: number,
};

type PropsType = typeof ViewPropTypes & {
  zoom?: number,
  maxZoom?: number,
  ratio?: string,
  focusDepth?: number,
  type?: number | string,
  onCameraReady?: Function,
  onAudioInterrupted?: Function,
  onAudioConnected?: Function,
  onStatusChange?: Function,
  onBarCodeRead?: Function,
  onPictureTaken?: Function,
  onPictureSaved?: Function,
  onGoogleVisionBarcodesDetected?: ({ barcodes }: {barcodes:Array<TrackedBarcodeFeature>}) => void,
  onSubjectAreaChanged?: ({ nativeEvent: { prevPoint: {x, y } } }: any) => void,
  faceDetectionMode?: number,
  trackingEnabled?: boolean,
  flashMode?: number | string,
  exposure?: number,
  barCodeTypes?: Array<string>,
  googleVisionBarcodeType?: number,
  googleVisionBarcodeMode?: number,
  whiteBalance?: number | string,
  faceDetectionLandmarks?: number,
  autoFocus?: string | boolean | number,
  autoFocusPointOfInterest?: { x: number, y: number },
  faceDetectionClassifications?: number,
  onFacesDetected?: ({ faces }: {faces: Array<TrackedFaceFeature>}) => void,
  onTextRecognized?: ({ textBlocks}: {textBlocks: Array<TrackedTextFeature>}) => void,
  captureAudio?: boolean,
  keepAudioSession?: boolean,
  useCamera2Api?: boolean,
  playSoundOnCapture?: boolean,
  videoStabilizationMode?: number | string,
  pictureSize?: string,
  rectOfInterest: Rect,
};

type StateType = {
  isAuthorized: boolean,
  isAuthorizationChecked: boolean,
  recordAudioPermissionStatus: RecordAudioPermissionStatus,
};

export type Status = 'READY' | 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED';

const CameraStatus: { [key: Status]: Status } = {
  READY: 'READY',
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
};

export type RecordAudioPermissionStatus = 'AUTHORIZED' | 'NOT_AUTHORIZED' | 'PENDING_AUTHORIZATION';

const RecordAudioPermissionStatusEnum: {
  [key: RecordAudioPermissionStatus]: RecordAudioPermissionStatus,
} = {
  AUTHORIZED: 'AUTHORIZED',
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
};

const CameraManager = CameraTurboModule || {
    stubbed: true,
    Type: {
      back: 1,
    },
    AutoFocus: {
      on: 1,
    },
    FlashMode: {
      off: 1,
    },
    WhiteBalance: {},
    BarCodeType: {},
    FaceDetection: {
      fast: 1,
      Mode: {},
      Landmarks: {
        none: 0,
      },
      Classifications: {
        none: 0,
      },
    },
    GoogleVisionBarcodeDetection: {
      BarcodeType: 0,
      BarcodeMode: 0,
    },
  };

const EventThrottleMs = 500;

const mapValues = (input: any, mapper: any) => {
  const result: any = {};
  Object.entries(input).map(([key, value]) => {
    result[key] = mapper(value, key);
  });
  return result;
};

export default class Camera extends React.Component<PropsType, StateType> {
  static Constants = {
    Type: CameraManager.getConstants().Type,
    FlashMode: CameraManager.getConstants().FlashMode,
    AutoFocus: CameraManager.getConstants().AutoFocus,
    WhiteBalance: CameraManager.getConstants().WhiteBalance,
    VideoQuality: CameraManager.getConstants().VideoQuality,
    VideoCodec: CameraManager.getConstants().VideoCodec,
    BarCodeType: CameraManager.getConstants().BarCodeType,
    GoogleVisionBarcodeDetection: CameraManager.getConstants().GoogleVisionBarcodeDetection,
    FaceDetection: CameraManager.getConstants().FaceDetection,
    CameraStatus,
    RecordAudioPermissionStatus: RecordAudioPermissionStatusEnum,
    VideoStabilization: CameraManager.getConstants().VideoStabilization,
    Orientation: {
      auto: 'auto',
      landscapeLeft: 'landscapeLeft',
      landscapeRight: 'landscapeRight',
      portrait: 'portrait',
      portraitUpsideDown: 'portraitUpsideDown',
    },
  };

  // Values under keys from this object will be transformed to native options
  static ConversionTables = {
    type: CameraManager.getConstants().Type,
    flashMode: CameraManager.getConstants().FlashMode,
    exposure: CameraManager.getConstants().Exposure,
    autoFocus: CameraManager.getConstants().AutoFocus,
    whiteBalance: CameraManager.getConstants().WhiteBalance,
    faceDetectionMode: (CameraManager.getConstants().FaceDetection || {}).Mode,
    faceDetectionLandmarks: (CameraManager.getConstants().FaceDetection || {}).Landmarks,
    faceDetectionClassifications: (CameraManager.getConstants().FaceDetection || {}).Classifications,
    googleVisionBarcodeType: (CameraManager.getConstants().GoogleVisionBarcodeDetection || {}).BarcodeType,
    videoStabilizationMode: CameraManager.getConstants().VideoStabilization || {},
  };

  static propTypes = {
    ...ViewPropTypes,
    zoom: PropTypes.number,
    maxZoom: PropTypes.number,
    ratio: PropTypes.string,
    focusDepth: PropTypes.number,
    onMountError: PropTypes.func,
    onCameraReady: PropTypes.func,
    onAudioInterrupted: PropTypes.func,
    onAudioConnected: PropTypes.func,
    onStatusChange: PropTypes.func,
    onBarCodeRead: PropTypes.func,
    onPictureTaken: PropTypes.func,
    onPictureSaved: PropTypes.func,
    onGoogleVisionBarcodesDetected: PropTypes.func,
    onFacesDetected: PropTypes.func,
    onTextRecognized: PropTypes.func,
    onSubjectAreaChanged: PropTypes.func,
    trackingEnabled: PropTypes.bool,
    faceDetectionMode: PropTypes.number,
    faceDetectionLandmarks: PropTypes.number,
    faceDetectionClassifications: PropTypes.number,
    barCodeTypes: PropTypes.arrayOf(PropTypes.string),
    googleVisionBarcodeType: PropTypes.number,
    googleVisionBarcodeMode: PropTypes.number,
    type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cameraId: PropTypes.string,
    flashMode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    exposure: PropTypes.number,
    whiteBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    autoFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    autoFocusPointOfInterest: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    permissionDialogTitle: PropTypes.string,
    permissionDialogMessage: PropTypes.string,
    androidCameraPermissionOptions: Rationale,
    androidRecordAudioPermissionOptions: Rationale,
    notAuthorizedView: PropTypes.element,
    pendingAuthorizationView: PropTypes.element,
    captureAudio: PropTypes.bool,
    keepAudioSession: PropTypes.bool,
    useCamera2Api: PropTypes.bool,
    playSoundOnCapture: PropTypes.bool,
    videoStabilizationMode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pictureSize: PropTypes.string,
    mirrorVideo: PropTypes.bool,
    rectOfInterest: PropTypes.any,
    defaultVideoQuality: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps: Object = {
    zoom: 0,
    maxZoom: 0,
    ratio: '4:3',
    focusDepth: 0,
    type: CameraManager.getConstants().Type.back,
    cameraId: null,
    autoFocus: CameraManager.getConstants().AutoFocus.on,
    flashMode: CameraManager.getConstants().FlashMode.off,
    exposure: -1,
    whiteBalance: CameraManager.getConstants().WhiteBalance.auto,
    faceDetectionMode: (CameraManager.getConstants().FaceDetection || {}).fast,
    barCodeTypes: Object.values(CameraManager.getConstants().BarCodeType),
    googleVisionBarcodeType: ((CameraManager.getConstants().GoogleVisionBarcodeDetection || {}).BarcodeType || {})
      .None,
    googleVisionBarcodeMode: ((CameraManager.getConstants().GoogleVisionBarcodeDetection || {}).BarcodeMode || {})
      .NORMAL,
    faceDetectionLandmarks: ((CameraManager.getConstants().FaceDetection || {}).Landmarks || {}).none,
    faceDetectionClassifications: ((CameraManager.getConstants().FaceDetection || {}).Classifications || {}).none,
    permissionDialogTitle: '',
    permissionDialogMessage: '',
    androidCameraPermissionOptions: {
      title: '',
      message: '',
    },
    androidRecordAudioPermissionOptions: {
      title: '',
      message: '',
    },
    notAuthorizedView: (
      <View style={styles.authorizationContainer}>
        <Text style={styles.notAuthorizedText}>Camera not authorized</Text>
      </View>
    ),
    pendingAuthorizationView: (
      <View style={styles.authorizationContainer}>
        <ActivityIndicator size="small" />
      </View>
    ),
    captureAudio: true,
    keepAudioSession: false,
    useCamera2Api: false,
    playSoundOnCapture: false,
    pictureSize: 'None',
    videoStabilizationMode: 0,
    mirrorVideo: false,
  };

  _cameraRef?: Object;
  _cameraHandle?: number;
  _lastEvents: any;
  _lastEventsTimes: any;
  _isMounted: boolean;

  constructor(props: PropsType) {
    super(props);
    this._lastEvents = {};
    this._lastEventsTimes = {};
    this._isMounted = true;
    this.state = {
      isAuthorized: true,
      isAuthorizationChecked: false,
      recordAudioPermissionStatus: (RecordAudioPermissionStatusEnum as any).PENDING_AUTHORIZATION,
    };
  }

  async takePictureAsync(options?: PictureOptions) {
    if (!options) {
      options = {};
    }
    if (!options.quality) {
      options.quality = 1;
    }

    if (options.orientation) {
      if (typeof options.orientation !== 'number') {
        const { orientation } = options;
        options.orientation = CameraManager.getConstants().Orientation[orientation];
        if (__DEV__) {
          if (typeof options.orientation !== 'number') {
            // eslint-disable-next-line no-console
            console.warn(`Orientation '${orientation}' is invalid.`);
          }
        }
      }
    }

    if (options.pauseAfterCapture === undefined) {
      options.pauseAfterCapture = false;
    }

    if (!this._cameraHandle) {
      throw 'Camera handle cannot be null';
    }

    return await CameraManager.takePicture(options, this._cameraHandle);
  }

  async getSupportedRatiosAsync() {
    throw new Error('Ratio is not supported on harmony');
  }

  async getCameraIdsAsync() {
    return await CameraManager.getCameraIds();
  }

  getAvailablePictureSizes = async (): Promise<string[]> => {
    //$FlowFixMe
    return await CameraManager.getAvailablePictureSizes(this.props.ratio, this._cameraHandle);
  };

  async recordAsync(options?: RecordingOptions) {
    if (!options || typeof options !== 'object') {
      options = {};
    } else if (typeof options.quality === 'string') {
      options.quality = Camera.Constants.VideoQuality[options.quality];
    }
    if (options.orientation) {
      if (typeof options.orientation !== 'number') {
        const { orientation } = options;
        options.orientation = CameraManager.getConstants().Orientation[orientation];
        if (__DEV__) {
          if (typeof options.orientation !== 'number') {
            // eslint-disable-next-line no-console
            console.warn(`Orientation '${orientation}' is invalid.`);
          }
        }
      }
    }

    if (__DEV__) {
      if (options.videoBitrate && typeof options.videoBitrate !== 'number') {
        // eslint-disable-next-line no-console
        console.warn('Video Bitrate should be a positive integer');
      }
    }

    const { recordAudioPermissionStatus } = this.state;
    const { captureAudio } = this.props;

    if (
      !captureAudio ||
      recordAudioPermissionStatus !== RecordAudioPermissionStatusEnum.AUTHORIZED
    ) {
      options.mute = true;
    }

    if (__DEV__) {
      if (
        (!options.mute || captureAudio) &&
        recordAudioPermissionStatus !== RecordAudioPermissionStatusEnum.AUTHORIZED
      ) {
        // eslint-disable-next-line no-console
        console.warn('Recording with audio not possible. Permissions are missing.');
      }
    }

    return await CameraManager.record(options, this._cameraHandle);
  }

  stopRecording() {
    CameraManager.stopRecording(this._cameraHandle);
  }

  pausePreview() {
    CameraManager.pausePreview(this._cameraHandle);
  }

  isRecording() {
    return CameraManager.isRecording(this._cameraHandle);
  }

  resumePreview() {
    CameraManager.resumePreview(this._cameraHandle);
  }

  _onMountError = ({ nativeEvent }: EventCallbackArgumentsType) => {
    if (this.props.onMountError) {
      this.props.onMountError(nativeEvent);
    }
  };

  _onCameraReady = () => {
    if (this.props.onCameraReady) {
      this.props.onCameraReady();
    }
  };

  _onAudioInterrupted = () => {
    if (this.props.onAudioInterrupted) {
      this.props.onAudioInterrupted();
    }
  };

  _onAudioConnected = () => {
    if (this.props.onAudioConnected) {
      this.props.onAudioConnected();
    }
  };

  _onStatusChange = () => {
    if (this.props.onStatusChange) {
      this.props.onStatusChange({
        cameraStatus: this.getStatus(),
        recordAudioPermissionStatus: this.state.recordAudioPermissionStatus,
      });
    }
  };

  _onPictureSaved = ({ nativeEvent }: EventCallbackArgumentsType) => {
    if (this.props.onPictureSaved) {
      this.props.onPictureSaved(nativeEvent);
    }
  };

  _onObjectDetected = (callback?: Function) => ({ nativeEvent }: EventCallbackArgumentsType) => {
    const { type } = nativeEvent;
    if (
      this._lastEvents[type] &&
      this._lastEventsTimes[type] &&
      JSON.stringify(nativeEvent) === this._lastEvents[type] &&
      new Date() - this._lastEventsTimes[type] < EventThrottleMs
    ) {
      return;
    }

    if (callback) {
      callback(nativeEvent);
      this._lastEventsTimes[type] = new Date();
      this._lastEvents[type] = JSON.stringify(nativeEvent);
    }
  };

  _onSubjectAreaChanged = e => {
    if (this.props.onSubjectAreaChanged) {
      this.props.onSubjectAreaChanged(e);
    }
  };

  _setReference = (ref?: Object) => {
    if (ref) {
      this._cameraRef = ref;
      this._cameraHandle = findNodeHandle(ref);
    } else {
      this._cameraRef = null;
      this._cameraHandle = null;
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  async arePermissionsGranted() {
    const {
      permissionDialogTitle,
      permissionDialogMessage,
      androidCameraPermissionOptions,
      androidRecordAudioPermissionOptions,
    } = this.props;

    let cameraPermissions = androidCameraPermissionOptions;
    let audioPermissions = androidRecordAudioPermissionOptions;
    if (permissionDialogTitle || permissionDialogMessage) {
      // eslint-disable-next-line no-console
      console.warn(
        'permissionDialogTitle and permissionDialogMessage are deprecated. Please use androidCameraPermissionOptions instead.',
      );
      cameraPermissions = {
        ...cameraPermissions,
        title: permissionDialogTitle,
        message: permissionDialogMessage,
      };
      audioPermissions = {
        ...audioPermissions,
        title: permissionDialogTitle,
        message: permissionDialogMessage,
      };
    }

    const { hasCameraPermissions, hasRecordAudioPermissions } = await requestPermissions(
      this.props.captureAudio,
      CameraManager,
      cameraPermissions,
      audioPermissions,
    );

    const recordAudioPermissionStatus = hasRecordAudioPermissions
      ? RecordAudioPermissionStatusEnum.AUTHORIZED
      : RecordAudioPermissionStatusEnum.NOT_AUTHORIZED;
    return { hasCameraPermissions, recordAudioPermissionStatus };
  }

  async componentDidMount() {
    const {
      hasCameraPermissions,
      recordAudioPermissionStatus,
    } = await this.arePermissionsGranted();
    if (this._isMounted === false) {
      return;
    }

    this.setState(
      {
        isAuthorized: hasCameraPermissions,
        isAuthorizationChecked: true,
        recordAudioPermissionStatus,
      },
      this._onStatusChange,
    );
  }

  getStatus = (): Status => {
    const { isAuthorized, isAuthorizationChecked } = this.state;
    if (isAuthorizationChecked === false) {
      return CameraStatus.PENDING_AUTHORIZATION;
    }
    return isAuthorized ? CameraStatus.READY : CameraStatus.NOT_AUTHORIZED;
  };

  // FaCC = Function as Child Component;
  hasFaCC = (): any => typeof this.props.children === 'function';

  renderChildren = (): any => {
    if (this.hasFaCC()) {
      return this.props.children({
        camera: this,
        status: this.getStatus(),
        recordAudioPermissionStatus: this.state.recordAudioPermissionStatus,
      });
    }
    return this.props.children;
  };

  render() {
    const { style, ...nativeProps } = this._convertNativeProps(this.props);
    if (this.state.isAuthorized || this.hasFaCC()) {
      return (
        <View style={style}>
          <RNCamera
            {...nativeProps}
            style={StyleSheet.absoluteFill}
            ref={this._setReference}
            onMountError={this._onMountError}
            onCameraReady={this._onCameraReady}
            onAudioInterrupted={this._onAudioInterrupted}
            onAudioConnected={this._onAudioConnected}
            onGoogleVisionBarcodesDetected={this._onObjectDetected(
              this.props.onGoogleVisionBarcodesDetected,
            )}
            onBarCodeRead={this._onObjectDetected(this.props.onBarCodeRead)}
            onFacesDetected={this._onObjectDetected(this.props.onFacesDetected)}
            onTextRecognized={this._onObjectDetected(this.props.onTextRecognized)}
            onPictureSaved={this._onPictureSaved}
            onSubjectAreaChanged={this._onSubjectAreaChanged}
          />
          {this.renderChildren()}
        </View>
      );
    } else if (!this.state.isAuthorizationChecked) {
      return this.props.pendingAuthorizationView;
    } else {
      return this.props.notAuthorizedView;
    }
  }

  _convertNativeProps({ children, ...props }: PropsType) {
    const newProps = mapValues(props, this._convertProp);

    if (props.onBarCodeRead) {
      newProps.barCodeScannerEnabled = true;
    }

    if (props.onGoogleVisionBarcodesDetected) {
      newProps.googleVisionBarcodeDetectorEnabled = true;
    }

    if (props.onFacesDetected) {
      newProps.faceDetectorEnabled = true;
    }

    if (props.onTextRecognized) {
      newProps.textRecognizerEnabled = true;
    }

    if (Platform.OS === 'ios') {
      delete newProps.googleVisionBarcodeMode;
      delete newProps.ratio;
    }

    return newProps;
  }

  _convertProp(value: any, key: string): any {
    if (typeof value === 'string' && Camera.ConversionTables[key]) {
      return Camera.ConversionTables[key][value];
    }

    return value;
  }
}

export const Constants = Camera.Constants;

