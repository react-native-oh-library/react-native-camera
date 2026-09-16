> Document Template: v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-camera</code> </h1>
</p>

This project is based on [react-native-camera](https://github.com/react-native-camera/react-native-camera/tree/v4.2.1).

Please check the matching version information on the Releases page: [@react-native-ohos/react-native-camera Releases](https://github.com/react-native-oh-library/react-native-camera/releases). For older versions not published to npm, please refer to the [Installation Guide](./tgz-usage.md) to install tgz packages.

| Name | Version(Npm Address) | Release Information | Supported RN Version | Supported Autolink | Compile API Version | Community Baseline Version | Source code address |
| - | - | - | - | - | - | - | - |
| @react-native-ohos/react-native-camera | [~4.0.0 (In development)](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.84.* | Yes | API12+ | v4.2.1 | [sig](https://github.com/react-native-oh-library/react-native-camera/tree/sig) |
| @react-native-ohos/react-native-camera | [~3.42.0](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.82.* | Yes | API12+ | v3.40.0 | [br_rnoh0.82](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.82) |
| @react-native-ohos/react-native-camera | [~3.41.1](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.77.* | No | API12+ | v3.40.0 | [br_rnoh0.77](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.77) |
| @react-native-ohos/react-native-camera | [~3.40.1](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.72.* | No | API12+ | v3.40.0 | [br_rnoh0.72](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.72) |

## Introduction

react-native-camera is a camera component for React Native, which also reads barcodes.<br/>
This repository hosts `@react-native-ohos/react-native-camera`. The current version (4.0.0-beta.1) adapts to the RN 0.84 framework and upgrades the community baseline to react-native-camera v4.2.1: the JS layer integrates via codegen specs (NativeCamera / NativeCameraModule / NativeFaceDetector), and the HarmonyOS side implements preview, photo capture, video recording and barcode scanning based on Camera Kit / AVRecorder.

## Installation

Go to the project directory and execute the following instruction:

**npm**

```bash
npm install @react-native-ohos/react-native-camera
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-camera
```

## Link

| | Supported Autolink | RN framework version |
| - | - | - |
| ~4.0.0 | Yes | 0.84 |

Projects using AutoLink should configure according to this document. Autolink framework guide: https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/en/Autolinking.md

If the version you use supports Autolink and your project has integrated Autolink, you can skip the ManualLink configuration.
<details>
  <summary>ManualLink: guidance for manually configuring native dependencies</summary>

First, open the `harmony` directory of the project with DevEco Studio.

### 1. Overrides RN SDK

To keep the project on a single RN SDK version, add an `overrides` field in the project root `oh-package.json5`, pointing to the RN SDK version required by the project.

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "file:./react_native_openharmony.har"
  }
}
```

### 2. Introducing Native Code

Method 1: via har package (recommended)

> [!TIP] The har package is located in the `harmony` folder of the library installation path.

Open `entry/oh-package.json5` and add the following dependency:

```json
"dependencies": {
    "@react-native-ohos/react-native-camera": "file:../../node_modules/@react-native-ohos/react-native-camera/harmony/reactNativeCamera.har"
  }
```

Click the `sync` button in the top-right corner, or run:

```bash
cd entry
ohpm install
```

Method 2: direct source linking

> [!TIP] For direct source linking, please refer to [link-source-code](https://gitcode.com/CPF-RN/usage-docs/blob/master/en/link-source-code.md)

### 3. Configuring CMakeLists and Introducing NativeCameraPackage

Open `entry/src/main/cpp/CMakeLists.txt` and add:

```diff
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

# RNOH_BEGIN: manual_package_linking_1
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-camera/src/main/cpp" ./reactNativeCamera)
# RNOH_END: manual_package_linking_1

# RNOH_BEGIN: manual_package_linking_2
+ target_link_libraries(rnoh_app PUBLIC rnoh_native_camera)
# RNOH_END: manual_package_linking_2
```

Open `entry/src/main/cpp/PackageProvider.cpp` and add:

```diff
#include "RNOH/PackageProvider.h"
+ #include "NativeCameraPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
+     std::make_shared<NativeCameraPackage>(ctx)
    };
}
```

### 4. Introducing ReactNativeCameraPackage on the ArkTS side

Open `entry/src/main/ets/RNPackagesFactory.ts` and add:

```diff
  ...
+ import ReactNativeCameraPackage from '@react-native-ohos/react-native-camera';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+   new ReactNativeCameraPackage(ctx)
  ];
}
```

> [!TIP] The ArkTS component (ReactCameraView) is provided automatically by the component builder registry inside `ReactNativeCameraPackage` (`createWrappedCustomRNComponentBuilderByComponentNameMap`); the host does not need extra configuration in `buildCustomRNComponent` or `arkTsComponentNames`.
</details>

### Running

Click the `sync` button in the top-right corner, or run:

```bash
cd entry
ohpm install
```

Then build and run.

## Constraints

### Compatibility

To use this library, a correct React-Native and RNOH version is required, together with matching DevEco Studio and device ROM.

Verified on:

1. RNOH: 0.84.2; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;

### Compilation and Runtime API Requirements

> [!TIP] All versions of this library are version-isolated and support compiling with `API12+` projects and running on `API12+` ROMs.

> [!TIP] The following features depend on specific API versions; compiling with projects or running on ROMs below the specified API version may cause partial feature limitation.
1. The `whiteBalance` property requires a project compiled with `API20+` and a ROM supporting `API20+` to take effect.

### Permission Requirements

#### Add permissions in `module.json5` under the `entry` directory

Open `entry/src/main/module.json5` and add:

```diff
...
"requestPermissions": [
+  {
+    "name": "ohos.permission.CAMERA",
+    "reason": "$string:camera_reason",
+    "usedScene": {
+      "abilities": [
+        "EntryAbility"
+      ],
+      "when":"inuse"
+    }
+  },
+  {
+    "name": "ohos.permission.MICROPHONE",
+    "reason": "$string:microphone_reason",
+    "usedScene": {
+      "abilities": [
+        "EntryAbility"
+      ],
+      "when":"inuse"
+    }
+  },
]
```

#### Add the permission rationale strings under the `entry` directory

Open `entry/src/main/resources/base/element/string.json` and add:

```diff
...
{
  "string": [
+    {
+      "name": "camera_reason",
+      "value": "Use the camera"
+    },
+    {
+      "name": "microphone_reason",
+      "value": "Use the microphone"
+    },
  ]
}
```

## Example

The following code shows the basic usage of this library:

> [!WARNING] The import name stays unchanged.

```js
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from "@react-native-ohos/react-native-camera";

export function CameraExample() {
  const cameraRef = React.useRef<RNCamera>(null);

  const takePicture = () => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }
    camera
      .takePictureAsync({ quality: 0.5 })
      .then((photoResult: any) => {
        console.log('takepicture result:' + (photoResult?.path ?? photoResult?.uri));
      })
      .catch((error: unknown) => {
        console.warn('takepicture failed:', error);
      });
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        type="back"
        autoFocus="on"
        flashMode="off"
        videoStabilizationMode="off"
        style={styles.cameraPreview}
      />
      <TouchableOpacity style={styles.actionBtn} onPress={takePicture}>
        <Text style={styles.actionBtnText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraPreview: { width: '100%', aspectRatio: 56 / 100 },
  actionBtn: {
    margin: 10,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 16 },
});
```

## Properties

> [!TIP] The "Platform" column indicates the platforms supported by the property in the original third-party library.

> [!TIP] In the "HarmonyOS Support" column, yes means the property is supported on HarmonyOS; no means not supported; partially means partially supported. Usage is consistent across platforms, benchmarked against iOS or Android behavior.

### RNCamera

| Name | Description | Type | Required | Platform | HarmonyOS Support |
| ---- | ----------- | ---- | -------- |----------|-------------------|
| children | Set child components | View | no | iOS/Android | yes |
| type | Select camera | string | no | iOS/Android | yes |
| cameraId | Precisely specify the camera device (the id returned by getCameraIdsAsync) | string | no | iOS/Android | yes |
| flashMode | Set flash mode | string | no | iOS/Android | yes |
| exposure | Set exposure | number | no | iOS/Android | yes |
| autoFocus | Set auto focus | string | no | iOS/Android | yes |
| whiteBalance | White balance | string | no | iOS/Android | yes |
| captureAudio | Enable audio recording | boolean | no | iOS/Android | yes |
| zoom | Set zoom ratio | number | no | iOS/Android | yes |
| focusDepth | Set focus value in non-auto-focus mode | number | no | iOS/Android | yes |
| maxZoom | Set max zoom ratio | number | no | iOS/Android | yes |
| pictureSize | Set default picture resolution | string | no | iOS/Android | yes |
| playSoundOnRecord | Play system sound at recording start/stop | boolean | no | Android | no |
| onCameraReady | Camera ready callback, no arguments | `() => void` | no | iOS/Android | yes |
| onBarCodeRead | Barcode scanning callback; event contains data (barcode content), type (barcode format), bounds (position) | `(event: BarCodeReadEvent) => void` | no | iOS/Android | yes |
| onFacesDetected | Face detection callback; response.faces is the face array (not yet supported on harmony) | `(response: {faces: Face[]}) => void` | no | iOS/Android | no |
| onDoubleTap | Double tap on preview callback; origin is the touch point {x, y} (component-relative) | `(origin: Point) => void` | no | iOS/Android | yes |
| notAuthorizedView | UI shown when not authorized | View | no | Android | no |
| pendingAuthorizationView | UI shown while authorizing | View | no | Android | no |
| ratio | Camera ratio | string | no | Android | no |
| defaultVideoQuality | Default video quality | string | no | iOS/Android | yes |
| autoFocusPointOfInterest | Set auto focus point (x/y) | Point | no | iOS/Android | no |
| useNativeZoom | Enable native pinch-to-zoom gesture | boolean | no | iOS/Android | yes |
| onStatusChange | Camera status change callback; event contains cameraStatus, recordAudioPermissionStatus | `(event: {cameraStatus, recordAudioPermissionStatus}) => void` | no | iOS/Android | yes |
| onMountError | Camera error callback; error.message is the error message | `(error: {message}) => void` | no | iOS/Android | yes |
| onPictureTaken | Picture taken callback, no arguments | `() => void` | no | iOS/Android | yes |
| onRecordingStart | Recording start callback; event.nativeEvent contains uri, videoOrientation, deviceOrientation | `(event: {nativeEvent: {uri, videoOrientation, deviceOrientation}}) => void` | no | iOS/Android | yes |
| onRecordingEnd | Recording end callback, no arguments | `() => void` | no | iOS/Android | yes |
| videoStabilizationMode | Video stabilization mode | string | no | iOS | no |
| barCodeTypes | Barcode type array | BarCodeType[] | no | iOS/Android | no |
| detectedImageInEvent | Include raw image in barcode callback | boolean | no | iOS/Android | no |
| rectOfInterest | Limit barcode recognition area | RectOfInterest | no | iOS/Android | no |
| googleVisionBarcodeType | Barcode type (Google Vision) | enum | no | Android | no |
| googleVisionBarcodeMode | Barcode recognition mode (Google Vision) | enum | no | Android | no |
| onGoogleVisionBarcodesDetected | Google Vision barcode callback | `(event: {type, barcodes, target}) => void` | no | Android | no |
| onFaceDetectionError | Face detection error callback | `(response: {isOperational}) => void` | no | iOS/Android | no |
| faceDetectionMode | Face detection mode | string | no | iOS/Android | no |
| faceDetectionLandmarks | Face landmarks detection | string | no | iOS/Android | no |
| faceDetectionClassifications | Face classification detection | string | no | iOS/Android | no |
| trackingEnabled | Face tracking | boolean | no | iOS/Android | no |
| onTextRecognized | Text recognition callback | `(response: {textBlocks}) => void` | no | iOS/Android | no |
| onTap | Single tap on preview callback; origin is the touch point {x, y} | `(origin: Point) => void` | no | iOS | no |
| onAudioInterrupted | Audio session interruption callback, no arguments | `() => void` | no | iOS | no |
| onAudioConnected | Audio session connected callback, no arguments | `() => void` | no | iOS | no |
| onSubjectAreaChanged | Subject area changed callback | `(event: {nativeEvent: {prevPoint: {x, y}}}) => void` | no | iOS | no |
| useCamera2Api | Use Android Camera2 API | boolean | no | Android | no |
| playSoundOnCapture | Shutter sound on capture | boolean | no | Android | no |
| permissionDialogTitle | Permission dialog title (deprecated) | string | no | Android | no |
| permissionDialogMessage | Permission dialog message (deprecated) | string | no | Android | no |
| androidCameraPermissionOptions | Camera permission dialog config | object | no | Android | no |
| androidRecordAudioPermissionOptions | Record-audio permission dialog config | object | no | Android | no |
| cameraViewDimensions | Scan area dimensions (Android) | object | no | Android | no |
| keepAudioSession | Keep audio session on unmount | boolean | no | iOS | no |

### camera

| Name | Description | Type | Required | Platform | HarmonyOS Support |
| ---- | ----------- | ---- | -------- | --------|-------------------|
| takePictureAsync | Take a photo; optional options: quality (0~1), imageType (jpeg/png), path, etc.; resolves with TakePictureResponse (width, height, path, pictureOrientation, deviceOrientation) | `(options?: TakePictureOptions) => Promise<TakePictureResponse>` | no | iOS/Android | yes |
| recordAsync | Start recording; optional options: quality, maxDuration, maxFileSize, mute, path, etc.; resolves with RecordResponse (uri, videoOrientation, deviceOrientation, isRecordingInterrupted) | `(options?: RecordOptions) => Promise<RecordResponse>` | no | iOS/Android | yes |
| stopRecording | Stop recording, no arguments, no return value; on harmony there is a transcoding delay before recordAsync resolves | `() => void` | no | iOS/Android | yes |
| pauseRecording | Pause recording, no arguments, no return value; valid only while recording | `() => void` | no | iOS/Android | yes |
| resumeRecording | Resume recording, no arguments, no return value; valid only after pause | `() => void` | no | iOS/Android | yes |
| pausePreview | Pause preview (frame freeze), no arguments, no return value | `() => void` | no | iOS/Android | yes |
| resumePreview | Resume preview, no arguments, no return value | `() => void` | no | iOS/Android | yes |
| getCameraIdsAsync | Get available cameras; resolves with CameraDeviceInfo[], members: { id: string (device id, settable to cameraId), type: number (camera type), deviceType?: string } | `() => Promise<CameraDeviceInfo[]>` | no | iOS/Android | yes |
| getAvailablePictureSizes | Get available picture sizes; resolves with string[] such as "1920x1080" | `() => Promise<string[]>` | no | iOS/Android | yes |
| getSupportedPreviewFpsRange | Get supported fps ranges; resolves with string[], each item "min,max" | `() => Promise<string[]>` | no | iOS/Android | yes |
| checkIfVideoIsValid | Validate a recorded file; path is the video file path; returns true = valid, false = not found or not a video | `(path: string) => Promise<boolean>` | no | iOS/Android | yes |
| hasTorch | Query flash support; returns true/false | `() => Promise<boolean>` | no | iOS/Android | yes |
| refreshAuthorizationStatus | Re-request camera/microphone permission; after resolve the latest authorization status can be read | `() => Promise<void>` | no | iOS/Android | yes |
| getSupportedRatiosAsync | Get supported preview aspect ratios; resolves with string[] such as "4:3", "16:9" | `() => Promise<string[]>` | no | Android | yes |

### Constants

Enum constants are accessed via `RNCamera.Constants` (e.g. `RNCamera.Constants.FlashMode.torch`). Valid members:

| Enum | Related Interface | Members | HarmonyOS Support |
| ---- | ----------------- | ------- | ----------------- |
| CameraStatus | onStatusChange event | READY / PENDING_AUTHORIZATION / NOT_AUTHORIZED | partially(READY / NOT_AUTHORIZED) |
| RecordAudioPermissionStatus | onStatusChange event | AUTHORIZED / PENDING_AUTHORIZATION / NOT_AUTHORIZED | partially(AUTHORIZED / NOT_AUTHORIZED) |
| AutoFocus | autoFocus prop | on / off | yes |
| FlashMode | flashMode prop | on / off / torch / auto | yes |
| CameraType | type prop | front / back | yes |
| WhiteBalance | whiteBalance prop | sunny / cloudy / shadow / incandescent / fluorescent / auto | yes (effective with API20+) |
| VideoQuality | defaultVideoQuality prop, recordAsync quality | 2160p / 1080p / 720p / 480p / 4:3 / 288p (iOS) | yes (288p upstream iOS-only) |
| ImageType | takePictureAsync imageType | jpeg / png | yes |
| Orientation | takePictureAsync / recordAsync orientation | auto / landscapeLeft / landscapeRight / portrait / portraitUpsideDown | no |
| VideoStabilization | videoStabilizationMode prop | off / standard / cinematic / auto | no |
| BarCodeType | barCodeTypes prop | aztec / code128 / code39 / code39mod43 / code93 / ean13 / ean8 / pdf417 / qr / upc_e / interleaved2of5 / itf14 / datamatrix | no |
| VideoCodec | recordAsync codec (iOS) | H264 / JPEG / HVEC / AppleProRes422 / AppleProRes4444 | no |
| FaceDetection | faceDetectionMode etc. | Mode: fast / accurate; Landmarks: all / none; Classifications: all / none | no |
| GoogleVisionBarcodeDetection | googleVisionBarcodeType etc. (Android) | BarcodeType: CODE_128 / CODE_39 / CODABAR / DATA_MATRIX / EAN_13 / EAN_8 / ITF / QR_CODE / UPC_A / UPC_E / PDF417 / AZTEC / ALL; BarcodeMode: NORMAL / ALTERNATE / INVERTED | no |

## Known Issues

- [ ] onFacesDetected (face detection) is not yet supported [issue#8](https://github.com/react-native-oh-library/react-native-camera/issues/8)


## Others

- notAuthorizedView, pendingAuthorizationView and ratio are Android-only properties; HarmonyOS provides the system permission dialog when requesting authorization.
- playSoundOnRecord originates from Android semantics (MediaActionSound); the OHOS camera has no shutter-sound equivalent API, so it is currently a no-op. The property can be passed normally without affecting other features.
- checkIfVideoIsValid failure semantics differ by platform: HarmonyOS returns false for "file not found / metadata parsing failure"; the Android upstream conservatively returns true on load failure.

## Directory Structure

````
/react-native-camera                    # Project root
├── harmony                             # HarmonyOS adaptation code
│    └── reactNativeCamera.har          # har package
│    └── reactNativeCamera              # Core HarmonyOS adaptation code
│          └─ index.ets                 # Entry of the HarmonyOS adaptation code
│          └─ src/main/ets              # ArkTS implementation layer
│          └─ src/main/cpp              # C++ layer (NativeCameraPackage/Props/RNCCameraModule, etc.)
├── src                                 # RN code
│    └─ index.js                        # Entry file
│    └─ RNCamera.js / FaceDetector.js   # Component and capability wrappers
│    └─ NativeCamera.ts / NativeCameraModule.ts / NativeFaceDetector.ts  # codegen specs
├── types                               # TS type definitions
├── README.md                           # Chinese installation and usage guide
├── README_en.md                        # English installation and usage guide
````

## Contributing

If you find any problem during usage, feel free to submit an [Issue](https://github.com/react-native-oh-library/react-native-camera/issues); PRs are also welcome ([Pull Requests](https://github.com/react-native-oh-library/react-native-camera/pulls)).

## License

This project is based on the [MIT License](https://github.com/react-native-camera/react-native-camera/blob/master/LICENSE), please feel free to enjoy and participate in open source.
