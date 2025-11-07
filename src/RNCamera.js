// @flow
import React from 'react';
import PropTypes from 'prop-types';
import NativeCamera, { Commands, RecordResponse } from "./NativeCamera";
import NativeCameraModule from "./NativeCameraModule";
import { FaceFeature } from './FaceDetector';
import {
  findNodeHandle,
  Platform,
  ViewPropTypes,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  PermissionsAndroid,
  DeviceEventEmitter
} from 'react-native';

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
  androidCameraPermissionOptions: Rationale | null,
  androidRecordAudioPermissionOptions: Rationale | null,
): Promise<{ hasCameraPermissions: boolean, hasRecordAudioPermissions: boolean }> => {
  let hasCameraPermissions = false;
  let hasRecordAudioPermissions = false;
  if (Platform.OS === 'ios') {
    hasCameraPermissions = await CameraManager.checkVideoAuthorizationStatus();
  } else if (Platform.OS === 'android') {
    const cameraPermissionResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      androidCameraPermissionOptions,
    );
    if (typeof cameraPermissionResult === 'boolean') {
      hasCameraPermissions = cameraPermissionResult;
    } else {
      hasCameraPermissions = cameraPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
    }
  } else if (Platform.OS === 'windows') {
    hasCameraPermissions = await CameraManager.checkMediaCapturePermission();
  } else if (Platform.OS === 'harmony') {
    hasCameraPermissions = await NativeCameraModule.getCameraPermission();
  }

  if (captureAudio) {
    if (Platform.OS === 'ios') {
      hasRecordAudioPermissions = await CameraManager.checkRecordAudioAuthorizationStatus();
    } else if (Platform.OS === 'android') {
      if (await CameraManager.checkIfRecordAudioPermissionsAreDefined()) {
        const audioPermissionResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          androidRecordAudioPermissionOptions,
        );
        if (typeof audioPermissionResult === 'boolean') {
          hasRecordAudioPermissions = audioPermissionResult;
        } else {
          hasRecordAudioPermissions = audioPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
        }
      } else if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(
          `The 'captureAudio' property set on RNCamera instance but 'RECORD_AUDIO' permissions not defined in the applications 'AndroidManifest.xml'. ` +
          `If you want to record audio you will have to add '<uses-permission android:name="android.permission.RECORD_AUDIO"/>' to your 'AndroidManifest.xml'. ` +
          `Otherwise you should set the 'captureAudio' property on the component instance to 'false'.`,
        );
      }
    } else if (Platform.OS === 'windows') {
      hasRecordAudioPermissions = await CameraManager.checkMediaCapturePermission();
    } else if (Platform.OS === 'harmony') {
      hasRecordAudioPermissions = await NativeCameraModule.getAuidPermission();
    }
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
  urls: ?(string[]),
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
  fps?: number,
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

type PropsType = typeof View.props & {
  zoom?: number,
  useNativeZoom?: boolean,
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
  onRecordingStart?: Function,
  onRecordingEnd?: Function,
  onTap?: Function,
  onDoubleTap?: Function,
  onGoogleVisionBarcodesDetected?: ({ barcodes: Array<TrackedBarcodeFeature> }) => void,
  onSubjectAreaChanged?: ({ nativeEvent: { prevPoint: {| x: number, y: number |} } }) => void,
    faceDetectionMode ?: number,
    trackingEnabled ?: boolean,
    flashMode ?: number | string,
    exposure ?: number,
    barCodeTypes ?: Array < string >,
    googleVisionBarcodeType ?: number,
    googleVisionBarcodeMode ?: number,
    whiteBalance ?: number | string | { temperature: number, tint: number, redGainOffset?: number, greenGainOffset?: number, blueGainOffset?: number },
    faceDetectionLandmarks ?: number,
    autoFocus ?: string | boolean | number,
    autoFocusPointOfInterest ?: { x: number, y: number },
    faceDetectionClassifications ?: number,
    onFacesDetected ?: ({ faces: Array < TrackedFaceFeature > }) => void,
      onTextRecognized ?: ({ textBlocks: Array < TrackedTextFeature > }) => void,
        captureAudio ?: boolean,
        keepAudioSession ?: boolean,
        useCamera2Api ?: boolean,
        playSoundOnCapture ?: boolean,
        videoStabilizationMode ?: number | string,
        pictureSize ?: string,
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

const CameraManager: Object = {
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

const mapValues = (input, mapper) => {
  const result = {};
  Object.entries(input).map(([key, value]) => {
    result[key] = mapper(value, key);
  });
  return result;
};

export default class Camera extends React.Component<PropsType, StateType> {
  static Constants = {
    Type: CameraManager.Type,
    FlashMode: CameraManager.FlashMode,
    AutoFocus: CameraManager.AutoFocus,
    WhiteBalance: CameraManager.WhiteBalance,
    VideoQuality: CameraManager.VideoQuality,
    VideoCodec: CameraManager.VideoCodec,
    BarCodeType: CameraManager.BarCodeType,
    GoogleVisionBarcodeDetection: CameraManager.GoogleVisionBarcodeDetection,
    FaceDetection: CameraManager.FaceDetection,
    CameraStatus,
    CaptureTarget: CameraManager.CaptureTarget,
    RecordAudioPermissionStatus: RecordAudioPermissionStatusEnum,
    VideoStabilization: CameraManager.VideoStabilization,
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
    type: CameraManager.Type,
    flashMode: CameraManager.FlashMode,
    exposure: CameraManager.Exposure,
    autoFocus: CameraManager.AutoFocus,
    whiteBalance: CameraManager.WhiteBalance,
    faceDetectionMode: (CameraManager.FaceDetection || {}).Mode,
    faceDetectionLandmarks: (CameraManager.FaceDetection || {}).Landmarks,
    faceDetectionClassifications: (CameraManager.FaceDetection || {}).Classifications,
    googleVisionBarcodeType: (CameraManager.GoogleVisionBarcodeDetection || {}).BarcodeType,
    googleVisionBarcodeMode: (CameraManager.GoogleVisionBarcodeDetection || {}).BarcodeMode,
    videoStabilizationMode: CameraManager.VideoStabilization || {},
  };

  static propTypes = {
    ...ViewPropTypes,
    zoom: PropTypes.number,
    useNativeZoom: PropTypes.bool,
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
    onRecordingStart: PropTypes.func,
    onRecordingEnd: PropTypes.func,
    onTap: PropTypes.func,
    onDoubleTap: PropTypes.func,
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
    whiteBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number,
    PropTypes.shape({
      temperature: PropTypes.number, tint: PropTypes.number,
      redGainOffset: PropTypes.number,
      greenGainOffset: PropTypes.number,
      blueGainOffset: PropTypes.number
    })]),
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
    useNativeZoom: false,
    ratio: '4:3',
    focusDepth: 0,
    type: "back",
    cameraId: null,
    autoFocus: CameraManager.AutoFocus.on,
    flashMode: CameraManager.FlashMode.off,
    whiteBalance: CameraManager.WhiteBalance.auto,
    faceDetectionMode: (CameraManager.FaceDetection || {}).fast,
    barCodeTypes: Object.values(CameraManager.BarCodeType),
    googleVisionBarcodeType: ((CameraManager.GoogleVisionBarcodeDetection || {}).BarcodeType || {})
      .None,
    googleVisionBarcodeMode: ((CameraManager.GoogleVisionBarcodeDetection || {}).BarcodeMode || {})
      .NORMAL,
    faceDetectionLandmarks: ((CameraManager.FaceDetection || {}).Landmarks || {}).none,
    faceDetectionClassifications: ((CameraManager.FaceDetection || {}).Classifications || {}).none,
    permissionDialogTitle: '',
    permissionDialogMessage: '',
    androidCameraPermissionOptions: null,
    androidRecordAudioPermissionOptions: null,
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

  _cameraRef: React.ElementRef<typeof NativeCamera> | null = null
  _cameraHandle: ?number;
  _lastEvents: { [string]: string };
  _lastEventsTimes: { [string]: Date };
  _isMounted: boolean;

  constructor(props: PropsType) {
    super(props);
    this._lastEvents = {};
    this._lastEventsTimes = {};
    this._isMounted = true;
    this.state = {
      isAuthorized: false,
      isAuthorizationChecked: false,
      recordAudioPermissionStatus: RecordAudioPermissionStatusEnum.PENDING_AUTHORIZATION,
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
        options.orientation = CameraManager.Orientation[orientation];
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

    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }

    return new Promise((resolve, reject) => {
      try {
        const onCodeScannedListener = DeviceEventEmitter.addListener('onTaskPhoto', (data) => {
          resolve(data);
          onCodeScannedListener.remove();
        });

        Commands.takePicture(this._cameraRef, options)
      }
      catch (e) {
        reject(e);
        return;
      }
    });
  }

  async getSupportedRatiosAsync() {
    if (Platform.OS === 'android') {
      return await Commands.getSupportedRatios(this._cameraHandle);
    } else {
      throw new Error('Ratio is not supported on iOS');
    }
  }

  async getCameraIdsAsync() {
    if (Platform.OS === 'android') {
      return await CameraManager.getCameraIds(this._cameraHandle);
    } else if (Platform.OS === 'ios') {
      return await CameraNativeCameraModuleManager.getCameraIds(); // iOS does not need a camera instance
    } else if (Platform.OS === 'harmony') {
      return new Promise(async (resolve, reject) => {
        try {
          let data = await NativeCameraModule.getCameraIds();
          resolve(data)
        }
        catch (e) {
          reject(e);
          return;
        }
      });;
    }
  }

  getSupportedPreviewFpsRange = async (): Promise<[]> => {
    if (Platform.OS === 'android') {
      return await Commands.getSupportedPreviewFpsRange(this._cameraHandle);
    } else {
      throw new Error('getSupportedPreviewFpsRange is not supported on iOS');
    }
  };

  getAvailablePictureSizes = async (): string[] => {
    //$FlowFixMe
    return await NativeCameraModule.getAvailablePictureSizes();
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
        options.orientation = CameraManager.Orientation[orientation];
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
    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }

    return new Promise((resolve, reject) => {
      try {
        const onRecordingFinishedListener = DeviceEventEmitter.addListener('onRecordingFinished', (video: RecordResponse) => {
          resolve(video)
          onRecordingFinishedListener.remove();
        });
        Commands.record(this._cameraRef, options)
      }
      catch (e) {
        reject(e);
        return;
      }
    });
  }

  stopRecording() {
    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }
    Commands.stopRecording(this._cameraRef);
  }

  pauseRecording() {
    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }
    Commands.pauseRecording(this._cameraRef);
  }

  resumeRecording() {
    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }
    Commands.resumeRecording(this._cameraRef);
  }

  pausePreview() {
    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }

    Commands.pausePreview(this._cameraRef);
  }

  isRecording() {
    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }
    return new Promise((resolve, reject) => {
      try {
        const isRecordingFinishedListener = DeviceEventEmitter.addListener('isRecording', (isRecording) => {
          resolve(isRecording)
          isRecordingFinishedListener.remove();
        });
        Commands.isRecording(this._cameraRef)
      }
      catch (e) {
        reject(e);
        return;
      }
    });
  }

  resumePreview() {
    if (!this._cameraRef) {
      throw 'Camera handle cannot be null';
    }
    Commands.resumePreview(this._cameraRef);
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
  _onTouch = ({ nativeEvent }: EventCallbackArgumentsType) => {
    if (this.props.onTap && !nativeEvent.isDoubleTap) {
      this.props.onTap(nativeEvent.touchOrigin);
    }
    if (this.props.onDoubleTap && nativeEvent.isDoubleTap) {
      this.props.onDoubleTap(nativeEvent.touchOrigin);
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

  _onObjectDetected = (callback: ?Function) => ({ nativeEvent }: EventCallbackArgumentsType) => {
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

  _setReference = (ref: ?Object) => {
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

  async refreshAuthorizationStatus() {
    const {
      hasCameraPermissions,
      recordAudioPermissionStatus,
    } = await this.arePermissionsGranted();
    if (this._isMounted === false) {
      return;
    }

    this.setState({
      isAuthorized: hasCameraPermissions,
      isAuthorizationChecked: true,
      recordAudioPermissionStatus,
    });
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
  hasFaCC = (): * => typeof this.props.children === 'function';

  renderChildren = (): * => {
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
          <NativeCamera
            {...nativeProps}
            videoStabilizationMode = {this.props.videoStabilizationMode}
            autoFocus={this.props.autoFocus}
            whiteBalance={this.props.whiteBalance}
            flashMode={this.props.flashMode}
            type={this.props.type}
            style={StyleSheet.absoluteFill}
            ref={(ref) => {
              this._cameraRef = ref;
              this._cameraHandle = findNodeHandle(ref);
            }}
            onMountError={this._onMountError}
            onCameraReady={this._onCameraReady}
            onAudioInterrupted={this._onAudioInterrupted}
            onAudioConnected={this._onAudioConnected}
            onGoogleVisionBarcodesDetected={this._onObjectDetected(
              this.props.onGoogleVisionBarcodesDetected,
            )}
            onBarCodeRead={this._onObjectDetected(this.props.onBarCodeRead)}
            onTouch={this._onTouch}
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

    if (props.onTap || props.onDoubleTap) {
      newProps.touchDetectorEnabled = true;
    }

    if (props.onTextRecognized) {
      newProps.textRecognizerEnabled = true;
    }

    if (Platform.OS === 'ios') {
      delete newProps.ratio;
    }

    return newProps;
  }

  _convertProp(value: *, key: string): * {
    if (typeof value === 'string' && Camera.ConversionTables[key]) {
      return Camera.ConversionTables[key][value];
    }

    return value;
  }
}

export const Constants = Camera.Constants;