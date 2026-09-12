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

#pragma once
#include "ComponentDescriptors.h"
#include "FaceNativeTurboModule.h"
#include "NativeCameraEventEmitRequestHandler.h"
#include "NativeCameraJSIBinder.h"
#include "RNCCameraModule.h"
#include "RNOH/Package.h"
using namespace rnoh;
using namespace facebook;

class NativeCameraFactoryTurboModuleDelegate : public TurboModuleFactoryDelegate {
public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        if (name == "RNCFaceDector") {
            return std::make_shared<FaceNativeTurboModule>(ctx, name);
        }
        if (name == "RNCCameraModule") {
            return std::make_shared<RNCCameraModule>(ctx, name);
        }
        return nullptr;
    };
};

namespace rnoh {

class NativeCameraPackage : public Package {
public:
    NativeCameraPackage(Package::Context ctx) : Package(ctx) {}

    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
        return std::make_unique<NativeCameraFactoryTurboModuleDelegate>();
    }

    std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override {
        return {
            facebook::react::concreteComponentDescriptorProvider<facebook::react::NativeCameraComponentDescriptor>(),
        };
    }
    ComponentJSIBinderByString createComponentJSIBinderByName() override {
        return {
            {"NativeCamera", std::make_shared<NativeCameraJSIBinder>()},
        };
    };

    EventEmitRequestHandlers createEventEmitRequestHandlers() override {
        return {std::make_shared<NativeCameraEventEmitRequestHandler>()};
    }
};
} // namespace rnoh
