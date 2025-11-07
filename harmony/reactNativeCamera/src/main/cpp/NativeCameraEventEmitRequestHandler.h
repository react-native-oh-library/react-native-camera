/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
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

#ifndef HARMONY_BAIDUMAPEVENTEMITREQUESTHANDLER_H
#define HARMONY_BAIDUMAPEVENTEMITREQUESTHANDLER_H

#include "EventEmitters.h"
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "glog/logging.h"
#include <glog/logging.h>

using namespace facebook;
namespace rnoh {

enum NativeCameraEventType {
    BAR_CODE_READ = 0,
    SUBJUECT_AREA_CHANGED = 1,
    GOOGLE_VISION_BAR_CODES_DETECTED = 2,
    CAMERA_READY = 3,
    AUDIO_INTERRUPTED = 4,
    AUDIO_CONNECTED = 5,
    PICTURE_SAVE = 6,
    FACE_DETECTED = 7,
    NATIVE_CAMERA_TOUCH = 8,
    MOUNT_ERROR = 9,
    TASK_PHOTO = 10,
    RECORDING_START = 11,
    RECORDING_END = 12,
    PICTURE_TAKEN = 13,
    STATUS_CHANGE = 14
};

NativeCameraEventType getNativeCameraEventType(ArkJS &arkJs, napi_value eventObject) {
    auto eventType = arkJs.getString(arkJs.getObjectProperty(eventObject, "type"));
    if (eventType == "onBarCodeRead") {
        return NativeCameraEventType::BAR_CODE_READ;
    } else if (eventType == "onSubjectAreaChanged") {
        return NativeCameraEventType::SUBJUECT_AREA_CHANGED;
    } else if (eventType == "onGoogleVisionBarcodesDetected") {
        return NativeCameraEventType::GOOGLE_VISION_BAR_CODES_DETECTED;
    } else if (eventType == "onCameraReady") {
        return NativeCameraEventType::CAMERA_READY;
    } else if (eventType == "onAudioInterrupted") {
        return NativeCameraEventType::AUDIO_INTERRUPTED;
    } else if (eventType == "onAudioConnected") {
        return NativeCameraEventType::AUDIO_CONNECTED;
    } else if (eventType == "onPictureSaved") {
        return NativeCameraEventType::PICTURE_SAVE;
    } else if (eventType == "onFaceDetected") {
        return NativeCameraEventType::FACE_DETECTED;
    } else if (eventType == "onTouch") {
        return NativeCameraEventType::NATIVE_CAMERA_TOUCH;
    } else if (eventType == "onMountError") {
        return NativeCameraEventType::MOUNT_ERROR;
    } else if (eventType == "onRecordingStart") {
        return NativeCameraEventType::RECORDING_START;
    } else if (eventType == "onRecordingEnd") {
        return NativeCameraEventType::RECORDING_END;
    } else if (eventType == "onTaskPhoto") {
        return NativeCameraEventType::TASK_PHOTO;
    } else if (eventType == "onPictureTaken") {
        return NativeCameraEventType::PICTURE_TAKEN;
    } else if (eventType == "onStatusChange") {
        return NativeCameraEventType::STATUS_CHANGE;
    } else {
        throw std::runtime_error("Unknown NativeCamera event type");
    }
}

class NativeCameraEventEmitRequestHandler : public EventEmitRequestHandler {
public:
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        if (ctx.eventName != "NativeCamera") {
            return;
        }
        ArkJS arkJs(ctx.env);
        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::NativeCameraEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }
        switch (getNativeCameraEventType(arkJs, ctx.payload)) {
        case NativeCameraEventType::BAR_CODE_READ: {
            DLOG(INFO) << "handleEvent NativeCameraEventType::BAR_CODE_READ";
            react::NativeCameraEventEmitter::OnBarCodeRead event{};
            RNOHNapiObject naturalSizeObject = arkJs.getObject(arkJs.getObjectProperty(ctx.payload, "data"));
            std::string data = arkJs.getString(naturalSizeObject.getProperty("data"));
            std::string rawData = arkJs.getString(naturalSizeObject.getProperty("rawData"));
            std::string type = arkJs.getString(naturalSizeObject.getProperty("type"));
            std::string image = arkJs.getString(naturalSizeObject.getProperty("image"));
            event.data = data;
            event.rawData = rawData;
            event.type = type;
            event.image = image;
            RNOHNapiObject naturalSizeObject2 = arkJs.getObject(naturalSizeObject.getProperty("bounds"));
            RNOHNapiObject naturalSizeObject3 = arkJs.getObject(naturalSizeObject2.getProperty("origin"));
            std::string x = arkJs.getString(naturalSizeObject3.getProperty("x"));
            std::string y = arkJs.getString(naturalSizeObject3.getProperty("y"));
            event.bounds.origin.x = x;
            event.bounds.origin.y = y;
            RNOHNapiObject naturalSizeObject4 = arkJs.getObject(naturalSizeObject2.getProperty("size"));
            std::string width = arkJs.getString(naturalSizeObject4.getProperty("width"));
            std::string height = arkJs.getString(naturalSizeObject4.getProperty("height"));
            event.bounds.size.width = width;
            event.bounds.size.height = height;
            eventEmitter->onBarCodeRead(event);
            break;
        }
        case NativeCameraEventType::SUBJUECT_AREA_CHANGED: {
            break;
        }
        case NativeCameraEventType::GOOGLE_VISION_BAR_CODES_DETECTED: {
            break;
        }
        case NativeCameraEventType::CAMERA_READY: {
            DLOG(INFO) << "handleEvent NativeCameraEventType::CAMERA_READY";
            react::NativeCameraEventEmitter::OnCameraReady event{};
            eventEmitter->onCameraReady(event);
            break;
        }
        case NativeCameraEventType::RECORDING_START: {
            DLOG(INFO) << "handleEvent NativeCameraEventType::START_RECORDING";
            react::NativeCameraEventEmitter::OnRecordingStart event{};
            RNOHNapiObject naturalSizeObject = arkJs.getObject(arkJs.getObjectProperty(ctx.payload, "data"));
            RNOHNapiObject naturalSizeObject2 = arkJs.getObject(naturalSizeObject.getProperty("nativeEvent"));
            std::string uriData = arkJs.getString(naturalSizeObject2.getProperty("uri"));
            float videoOrientationData = (float)arkJs.getDouble(naturalSizeObject2.getProperty("videoOrientation"));
            float deviceOrientationData = (float)arkJs.getDouble(naturalSizeObject2.getProperty("deviceOrientation"));

            DLOG(INFO) << "handleEvent NativeCameraEventType::START_RECORDING" << videoOrientationData;
            DLOG(INFO) << "handleEvent NativeCameraEventType::START_RECORDING" << deviceOrientationData;
            event.nativeEvent.uri = uriData;
            event.nativeEvent.videoOrientation = videoOrientationData;
            event.nativeEvent.deviceOrientation = deviceOrientationData;
            eventEmitter->onRecordingStart(event);
            break;
        }
        case NativeCameraEventType::RECORDING_END: {
            DLOG(INFO) << "handleEvent NativeCameraEventType::STOP_RECORDING";
            react::NativeCameraEventEmitter::OnStopRecording event{};
            eventEmitter->onRecordingEnd(event);
            break;
        }

        case NativeCameraEventType::PICTURE_TAKEN: {
            DLOG(INFO) << "handleEvent NativeCameraEventType::PICTURE_TAKEN";
            react::NativeCameraEventEmitter::OnPictureTaken event{};
            eventEmitter->onPictureTaken(event);
            break;
        }
        case NativeCameraEventType::AUDIO_INTERRUPTED: {
            DLOG(INFO) << "baiduMap BaiduMapEventEmitRequestHandler MAP_CLICK";
            break;
        }
        case NativeCameraEventType::AUDIO_CONNECTED: {
            DLOG(INFO) << "native AUDIO_CONNECTED";
            react::NativeCameraEventEmitter::OnAudioConnected event{};
            eventEmitter->onAudioConnected(event);
            break;
        }
        case NativeCameraEventType::PICTURE_SAVE: {
            break;
        }
        case NativeCameraEventType::FACE_DETECTED: {
            break;
        }
        case NativeCameraEventType::NATIVE_CAMERA_TOUCH: {
            DLOG(INFO) << "c++ NATIVE_CAMERA_TOUCH";
            react::NativeCameraEventEmitter::TapCallback event{};
            RNOHNapiObject naturalSizeObject = arkJs.getObject(arkJs.getObjectProperty(ctx.payload, "tapCallback"));
            bool isDoubleTap = (float)arkJs.getBoolean(naturalSizeObject.getProperty("isDoubleTap"));
            RNOHNapiObject naturalSizeObject2 = arkJs.getObject(naturalSizeObject.getProperty("touchOrigin"));
            float x = (float)arkJs.getDouble(naturalSizeObject2.getProperty("x"));
            float y = (float)arkJs.getDouble(naturalSizeObject2.getProperty("y"));
            event.isDoubleTap = isDoubleTap;
            event.touchOrigin = {x, y};
            eventEmitter->onTouch(event);
            break;
        }
        case NativeCameraEventType::MOUNT_ERROR: {
            DLOG(INFO) << "c++ MOUNT_ERROR";
            react::NativeCameraEventEmitter::OnMountError event{};
            RNOHNapiObject naturalSizeObject = arkJs.getObject(arkJs.getObjectProperty(ctx.payload, "error"));
            std::string message = arkJs.getString(naturalSizeObject.getProperty("message"));
            DLOG(INFO) << "c++ MOUNT_ERROR" << message;
            event.message = message;
            eventEmitter->onMountError(event);
            break;
        }

        case NativeCameraEventType::TASK_PHOTO: {
            DLOG(INFO) << "c++ TASK_PHOTO";
            react::NativeCameraEventEmitter::OnTaskPhoto event{};
            eventEmitter->onTaskPhoto(event);
            break;
        }
        case NativeCameraEventType::STATUS_CHANGE: {
            DLOG(INFO) << "c++ STATUS_CHANGE";
            react::NativeCameraEventEmitter::OnStatusChange event{};
            RNOHNapiObject naturalSizeObject = arkJs.getObject(arkJs.getObjectProperty(ctx.payload, "statusChange"));
            std::string cameraStatus = arkJs.getString(naturalSizeObject.getProperty("cameraStatus"));
            std::string recordAudioPermissionStatus =
                arkJs.getString(naturalSizeObject.getProperty("recordAudioPermissionStatus"));
            event.cameraStatus = cameraStatus;
            event.recordAudioPermissionStatus = recordAudioPermissionStatus;
            eventEmitter->onStatusChange(event);
            break;
        }
        default:
            break;
        }
    };
};

} // namespace rnoh
#endif // HARMONY_BAIDUMAPEVENTEMITREQUESTHANDLER_H
