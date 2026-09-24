> Document Template: v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-camera</code> </h1>
</p>

This project is based on [react-native-camera](https://github.com/react-native-camera/react-native-camera).

The version correspondence details are as follows:

| Name | Version(Npm Address) | Release Information | Supported RN Version | Supported Autolink | Compile API Version | Community Baseline Version | Source code address |
| --- | --- | --- | --- | --- | --- | --- | --- |
| @react-native-ohos/react-native-camera | [~3.40.1](https://www.npmjs.com/package/@react-native-ohos/react-native-camera) | [Releases](https://github.com/react-native-oh-library/react-native-camera/releases) | 0.72.* | No | API12+ | v3.40.0 | [br_rnoh0.72](https://github.com/react-native-oh-library/react-native-camera/tree/br_rnoh0.72) |

## Introduction

react-native-camera is a camera component for React Native, which also reads barcodes.<br/>
It supports switching between front and back cameras, flash and white balance control, auto focus and zoom, taking pictures (takePictureAsync), recording videos (recordAsync) and barcode scanning (onBarCodeRead).

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

| Version | Supported Autolink | Supported RN Version |
|------|--------------------|----------------------|
| ~3.40.1 | No | 0.72.* |

Projects using AutoLink need to be configured according to this document, AutoLink framework guide: https://gitcode.com/CPF-RN/ohos_react_native/blob/main/docs/en/02-development/02-development-guide/autolinking.md

ManualLink: This step provides guidance for manually configuring native dependencies.

Open the `harmony` directory of the OpenHarmony project in DevEco Studio.

### 1. Overrides RN SDK

To ensure the project relies on the same version of the RN SDK, you need to add an `overrides` field in the project's root `oh-package.json5` file, specifying the RN SDK version to be used. The replacement version can be a specific version number, a semver range, or a locally available HAR package or source directory.

For more information about the purpose of this field, please refer to the [official documentation](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#en-us_topic_0000001792256137_overrides).

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.72.38" // ohpm version
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony.har" // a locally available HAR package
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony" // source code directory
  }
}
```

### 2. Introducing Native Code

There are two methods:

- Introduce through the har package;
- Directly link to the source code.

Method 1: Introduce through the har package (recommended)

> [!TIP] The har package is located in the `harmony` folder of the third-party library installation path.

Open `entry/oh-package.json5` and add the following dependency:

```json
"dependencies": {
    "@react-native-ohos/react-native-camera": "file:../../node_modules/@react-native-ohos/react-native-camera/harmony/reactNativeCamera.har"
  }
```

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Method 2: Directly link to the source code.

> [!TIP] For details, see [Directly Linking Source Code](https://gitcode.com/CPF-RN/usage-docs/blob/master/en/link-source-code.md).

### 3. Configuring CMakeLists and Introducing NativeCameraPackage

Open `entry/src/main/cpp/CMakeLists.txt` and add the following code:

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-camera/src/main/cpp" ./reactNativeCamera)
# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_native_camera)
# RNOH_END: manual_package_linking_2
```

Open `entry/src/main/cpp/PackageProvider.cpp` and add the following code:

```diff
#include "RNOH/PackageProvider.h"
#include "SamplePackage.h"
+ #include "NativeCameraPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<SamplePackage>(ctx),
+     std::make_shared<NativeCameraPackage>(ctx)
    };
}
```

### 4. Introducing the ReactCameraView component on the ArkTS side

Find **function buildCustomComponent()**, usually in `entry/src/main/ets/pages/index.ets` or `entry/src/main/ets/rn/LoadBundle.ets`, and add:

```diff
  ...
+ import { ReactCameraView } from "@react-native-ohos/react-native-camera"

@Builder
export function buildCustomRNComponent(ctx: ComponentBuilderContext) {
  ...
+ if (ctx.componentName === ReactCameraView.NAME) {
+   ReactCameraView({
+     ctx: ctx.rnComponentContext,
+     tag: ctx.tag
+   })
+ }
 ...
}
```

### 5. Introducing ReactNativeCameraPackage on the ArkTS side

Open `entry/src/main/ets/RNPackagesFactory.ts` and add the following code:

```diff
  ...
+ import { ReactNativeCameraPackage } from "@react-native-ohos/react-native-camera"

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+   new ReactNativeCameraPackage(ctx)
  ];
}
```

### Running

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Then build and run the code.

## Constraints

### Compatibility

This document is verified based on the following versions:

1. RNOH: 0.72.90; SDK: HarmonyOS NEXT Developer DB3; IDE: DevEco Studio: 5.0.5.220; ROM: NEXT.0.0.105;

### Compilation and Runtime API Requirements

> [!TIP] All versions of this library are version-isolated and support compiling with `API12+` projects and running on `API12+` ROMs.

> [!TIP] The following features depend on specific API versions; compiling with projects or running on ROMs below the specified API version may cause partial feature limitation.
1. The `whiteBalance` property takes effect only when running on a ROM supporting `API20+`.

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
+  {
+    "name": "ohos.permission.APPROXIMATELY_LOCATION",
+    "reason": "$string:location_reason",
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
+    {
+      "name": "location_reason",
+      "value": "Obtain the location information when recording"
+    },
  ]
}
```

> [!TIP] `ohos.permission.MICROPHONE` is required only when `captureAudio` is `true` (the default value); `ohos.permission.APPROXIMATELY_LOCATION` is used to write the location information when recording.

## Example

The following code shows the basic use scenario of this library:

> [!WARNING] The name of the imported repository remains unchanged.

```jsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

class CameraExample extends React.Component {
  takePicture = async () => {
    if (this.camera) {
      try {
        const data = await this.camera.takePictureAsync({ quality: 0.5 });
        console.log('takePicture result: ' + (data.path ? data.path : data.uri));
      } catch (error) {
        console.warn('takePicture failed:', error);
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => { this.camera = ref; }}
          style={styles.preview}
          type="back"
          flashMode="off"
          captureAudio={false}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.capture} onPress={this.takePicture}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: 'black' },
  preview: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  buttonContainer: { flex: 0, flexDirection: 'row', justifyContent: 'center' },
  capture: { flex: 0, backgroundColor: '#1E90FF', borderRadius: 5, padding: 15, margin: 20 },
  buttonText: { fontSize: 14, color: '#fff' },
});

export default CameraExample;
```

## How to Use

**Basic usage**

```jsx
<RNCamera
  ref={cameraRef}
  style={{ flex: 1 }}
  type="back"
  flashMode="off"
  autoFocus="on"
  captureAudio={false}
/>
```

**Taking a picture (takePictureAsync)**

```jsx
const options = { quality: 0.5, base64: true };
const data = await this.camera.takePictureAsync(options).catch((error) => {
  console.warn('takePicture failed:', error);
});
if (data) {
  console.log('takePicture result: ' + (data.path ? data.path : data.uri));
}
```

**Recording a video (recordAsync)**

```jsx
const result = await this.camera.recordAsync({ maxDuration: 30 }).catch((error) => {
  console.warn('record failed:', error);
});
if (result) {
  console.log('video saved to: ' + result.uri);
}
```

**Barcode scanning (onBarCodeRead)**

```jsx
<RNCamera
  ref={cameraRef}
  style={{ flex: 1 }}
  onBarCodeRead={(event) => {
    console.log('barCode type: ' + event.nativeEvent.type + ', data: ' + event.nativeEvent.data);
  }}
/>
```

## Available APIs

> [!TIP] The **Platform** column indicates the platform where the properties are supported in the original third-party library.

> [!TIP] If the **OpenHarmony Support** is **yes**, it means that the OpenHarmony platform supports this property; **no** means the opposite; **partially** means some capabilities of this property are supported. The usage method is the same on different platforms and the effect is the same as that of iOS or Android.

### Components

| Name | Parameter Type | Required | Platform | OpenHarmony Platform Support | Description |
|------|---------------|----------|----------|------------------------------|-------------|
| RNCamera | [RNCameraProps](#properties) | no | All | Yes | Camera component, supporting preview, picture taking, recording and barcode scanning |

### Properties
RNCameraProps

| Name | Parameter Type | Default Value | Required | Platform | OpenHarmony Platform Support | Description |
| --- | --- | --- | --- | --- | --- | --- |
| type | string | back | no | Android, iOS | Yes | Camera type: back or front. |
| flashMode | string | off | no | Android, iOS | Yes | Flash mode: on/off/torch/auto. |
| autoFocus | string | on | no | Android, iOS | Yes | Auto focus: on/off. |
| focusDepth | number | 0 | no | Android, iOS | Yes | Focus value when auto focus is disabled (0-1). |
| exposure | number | None | no | Android, iOS | Yes | Exposure compensation. |
| zoom | number | None | no | Android, iOS | Yes | Zoom ratio. |
| maxZoom | number | None | no | Android, iOS | Yes | Maximum zoom ratio. |
| useNativeZoom | boolean | false | no | Android, iOS | Yes | Enable the native pinch-to-zoom gesture. |
| captureAudio | boolean | true | no | Android, iOS | Yes | Whether to enable audio capture (for recording). |
| pictureSize | string | 'None' | no | Android, iOS | Yes | Picture size, in the format of "1920x1080". |
| defaultVideoQuality | string | None | no | Android, iOS | Yes | Default video quality, e.g. "1080p". |
| videoStabilizationMode | string | 0 | no | Android, iOS | Yes | Video stabilization mode: off/standard/cinematic/auto. |
| whiteBalance | string | auto | no | Android, iOS | Yes | White balance: sunny/cloudy/shadow/incandescent/fluorescent/auto. Takes effect only on ROMs supporting API20+. |
| onBarCodeRead | function | None | no | Android, iOS | Yes | Barcode scanning callback; event.nativeEvent contains data (barcode content), type (barcode type), bounds (position), etc. |
| onCameraReady | function | None | no | Android, iOS | Yes | Callback when the camera is ready. |
| onPictureTaken | function | None | no | Android, iOS | Yes | Callback when a picture is taken. |
| onRecordingStart | function | None | no | Android, iOS | Yes | Callback when recording starts; event.nativeEvent contains uri, videoOrientation and deviceOrientation. |
| onRecordingEnd | function | None | no | Android, iOS | Yes | Callback when recording ends. |
| onMountError | function | None | no | Android, iOS | Yes | Camera error callback; error.message is the error message. |
| onStatusChange | function | None | no | Android, iOS | No | Camera status change callback; the event contains cameraStatus and recordAudioPermissionStatus. |
| onAudioConnected | function | None | no | Android, iOS | Yes | Callback when the audio session is connected. |
| cameraId | string | None | no | iOS | No | Specify the camera device precisely (not supported on Harmony yet). |
| autoFocusPointOfInterest | object | None | no | Android, iOS | No | Set the auto focus point (x/y). |
| ratio | string | '4:3' | no | Android, iOS | No | Camera aspect ratio. |
| playSoundOnCapture | boolean | false | no | Android | No | Play the shutter sound when taking a picture. |
| keepAudioSession | boolean | false | no | iOS | No | Keep the audio session alive on unmount. |
| useCamera2Api | boolean | false | no | Android | No | Use the Android Camera2 API. |
| mirrorVideo | boolean | false | no | Android, iOS | No | Mirror the recorded video. |
| barCodeTypes | array | None | no | Android, iOS | No | Array of barcode types to detect. |
| detectedImageInEvent | boolean | false | no | Android, iOS | No | Include the raw image in the barcode scanning callback. |
| rectOfInterest | object | None | no | Android, iOS | No | Limit the area for barcode recognition. |
| googleVisionBarcodeType | number | None | no | Android | No | Barcode type (Google Vision). |
| googleVisionBarcodeMode | number | None | no | Android | No | Barcode detection mode (Google Vision). |
| faceDetectionMode | number | None | no | Android, iOS | No | Face detection mode. |
| faceDetectionLandmarks | number | None | no | Android, iOS | No | Face landmark detection. |
| faceDetectionClassifications | number | None | no | Android, iOS | No | Face classification detection. |
| trackingEnabled | boolean | false | no | Android, iOS | No | Face tracking. |
| notAuthorizedView | element | None | no | Android | No | UI displayed when not authorized. |
| pendingAuthorizationView | element | None | no | Android | No | UI displayed while requesting authorization. |
| permissionDialogTitle | string | '' | no | Android | No | Permission dialog title (deprecated). |
| permissionDialogMessage | string | '' | no | Android | No | Permission dialog message (deprecated). |
| androidCameraPermissionOptions | object | null | no | Android | No | Camera permission dialog options. |
| androidRecordAudioPermissionOptions | object | null | no | Android | No | Record audio permission dialog options. |
| onGoogleVisionBarcodesDetected | function | None | no | Android | No | Google barcode detection callback. |
| onFaceDetected | function | None | no | Android, iOS | No | Face detection data callback (not supported on Harmony yet). |
| onFaceDetectionError | function | None | no | Android, iOS | No | Face detection error callback. |
| onTextRecognized | function | None | no | Android, iOS | No | Text recognition callback. |
| onTap | function | None | no | iOS | No | Single tap callback on the preview. |
| onDoubleTap | function | None | no | Android, iOS | No | Double tap callback on the preview. |
| onAudioInterrupted | function | None | no | iOS | No | Callback when the audio session is interrupted. |
| onPictureSaved | function | None | no | Android, iOS | No | Callback when a picture is saved. |
| onSubjectAreaChanged | function | None | no | iOS | No | Callback when the subject area changes. |

### API

| Name | Type | Parameter Type | Return Value | Required | Platform | OpenHarmony Platform Support | Description |
| ---- | ---- | -------------- | ------------ | -------- | -------- | ---------------------------- | ----------- |
| takePictureAsync | function | options?: object | Promise<TakePictureResponse> | no | Android, iOS | Yes | Take a picture; options include quality (0-1), base64, etc.; resolves with the picture info (path/uri, width, height, etc.). |
| recordAsync | function | options?: object | Promise<RecordResponse> | no | Android, iOS | Yes | Start recording; options include maxDuration, maxFileSize, mute, quality (a number is recommended), etc.; resolves with RecordResponse (uri, videoOrientation, deviceOrientation, isRecordingInterrupted). |
| stopRecording | function | / | void | no | Android, iOS | Yes | Stop recording. |
| pauseRecording | function | / | void | no | Android, iOS | Yes | Pause recording; valid only while recording. |
| resumeRecording | function | / | void | no | Android, iOS | Yes | Resume recording; valid only after being paused. |
| pausePreview | function | / | void | no | Android, iOS | Yes | Pause the preview (freeze the frame). |
| resumePreview | function | / | void | no | Android, iOS | Yes | Resume the preview. |
| isRecording | function | / | Promise<boolean> | no | Android, iOS | Yes | Query whether recording is in progress. |
| getCameraIdsAsync | function | / | Promise<CameraDeviceInfo[]> | no | Android, iOS | Yes | Get the list of available camera devices. |
| getAvailablePictureSizes | function | / | Promise<string[]> | no | Android, iOS | Yes | Get the available picture sizes, e.g. "1920x1080". |
| refreshAuthorizationStatus | function | / | Promise<void> | no | Android, iOS | Yes | Check the camera/microphone permissions again and update the authorization state of the component. |
| getSupportedRatiosAsync | function | / | Promise<string[]> | no | Android, iOS | No | Get the supported preview aspect ratios. |
| getSupportedPreviewFpsRange | function | / | Promise<string[]> | no | Android, iOS | No | Get the supported preview FPS range. |

### Constants

The enumeration constants are accessed through `RNCamera.Constants` (e.g. `RNCamera.Constants.FlashMode.off`). The JS `Constants` on this branch are stubs and some enumeration members are missing. It is recommended to assign string literals directly to the enumerated properties (e.g. `flashMode="torch"`); the HarmonyOS side parses strings, and the behavior is consistent.

| Enum | Corresponding API | Member Values | OpenHarmony Platform Support |
| ---- | ----------------- | ------------- | ---------------------------- |
| CameraStatus | onStatusChange event | READY / PENDING_AUTHORIZATION / NOT_AUTHORIZED | Yes |
| RecordAudioPermissionStatus | onStatusChange event | AUTHORIZED / PENDING_AUTHORIZATION / NOT_AUTHORIZED | Yes |
| Type | type property | front / back | Yes |
| AutoFocus | autoFocus property | on / off | Yes |
| FlashMode | flashMode property | on / off / torch / auto | Yes |
| WhiteBalance | whiteBalance property | sunny / cloudy / shadow / incandescent / fluorescent / auto | partially (API20+ required) |
| VideoQuality | defaultVideoQuality property and quality of recordAsync | 2160p / 1080p / 720p / 480p / 4:3 | partially (Constants.VideoQuality is a stub on this branch; passing a number for the quality of recordAsync is recommended) |
| VideoStabilization | videoStabilizationMode property | off / standard / cinematic / auto | partially (the property is supported, but the Constants members are stubs) |
| Orientation | orientation of takePictureAsync / recordAsync | auto / landscapeLeft / landscapeRight / portrait / portraitUpsideDown | No |
| BarCodeType | barCodeTypes property | aztec / code128 / code39 / code39mod43 / code93 / ean13 / ean8 / pdf417 / qr / upc_e / interleaved2of5 / itf14 / datamatrix | No |
| VideoCodec | codec of recordAsync (iOS) | H264 / JPEG / HVEC / AppleProRes422 / AppleProRes4444 | No |
| FaceDetection | faceDetectionMode and related properties | Mode: fast / accurate; Landmarks: all / none; Classifications: all / none | No |
| GoogleVisionBarcodeDetection | googleVisionBarcodeType and related properties (Android) | BarcodeType: CODE_128 / CODE_39 / CODABAR / DATA_MATRIX / EAN_13 / EAN_8 / ITF / QR_CODE / UPC_A / UPC_E / PDF417 / AZTEC / ALL; BarcodeMode: NORMAL / ALTERNATE / INVERTED | No |

## Known Issues

- onFacesDetected face detection is not supported yet: [issue#8](https://github.com/react-native-oh-library/react-native-camera/issues/8)
- The autoFocusPointOfInterest property is not supported yet.

## Others

- whiteBalance takes effect only on ROMs supporting API20+.
- It is recommended to pass a number for the quality parameter of recordAsync (Constants.VideoQuality is a stub on this branch; passing a string throws an error).

## Directory Structure
````
/react-native-camera                    # Project root directory
├── harmony                             # HarmonyOS adaptation code
│   ├── reactNativeCamera.har           # har package
│   └── reactNativeCamera               # Core HarmonyOS adaptation code
│       ├── index.ets                   # Entry file of the HarmonyOS adaptation code
│       ├── ts.ts                    # TypeScript export entry
│       └── src/main
│           ├── ets
│           │   ├── ReactCameraView.ets             # RNCamera component implementation on HarmonyOS
│           │   ├── ReactNativeCameraPackage.ts     # Module registration Package
│           │   ├── ReactNativeCameraTurboModule.ts # RNCCameraModule TurboModule implementation
│           │   ├── FaceDectorPackage.ts            # Face detection Package
│           │   ├── FaceDectorTurboModule.ts        # RNCFaceDector TurboModule implementation
│           │   └── service                         # Core services such as camera session and scanning
│           └── cpp                                 # C++ layer (NativeCameraPackage/RNCCameraModule, etc.)
├── src                                 # RN code
│   ├── index.js                        # Entry file
│   ├── RNCamera.js                     # RNCamera component wrapper
│   ├── FaceDetector.js                 # Face detection wrapper
│   ├── NativeCamera.ts                 # Component Codegen declaration
│   ├── NativeCameraModule.ts           # RNCCameraModule TurboModule declaration
│   └── NativeFaceDetector.ts           # Face detection TurboModule declaration
├── types                               # TS type definitions (index.d.ts)
├── CHANGELOG.md                        # Version change records
├── LICENSE                             # License file
├── README.md                           # Chinese installation and usage instructions
└── README_en.md                        # English installation and usage instructions
````

## How to Contribute

If you find any problem during the use, you can submit an [Issue](https://github.com/react-native-oh-library/react-native-camera/issues). Of course, we also welcome you to submit a [PR](https://github.com/react-native-oh-library/react-native-camera/pulls).

## License

This project is based on [The MIT License (MIT)](https://github.com/react-native-camera/react-native-camera/blob/master/LICENSE). Feel free to enjoy and participate in open source.
