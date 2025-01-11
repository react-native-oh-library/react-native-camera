#pragma once

#include "RNOH/generated/BaseReactNativeCameraPackage.h"

namespace rnoh {

class RNCameraPackage : public BaseReactNativeCameraPackage {
    using Super = BaseReactNativeCameraPackage;

public:
    RNCameraPackage(Package::Context ctx) : Super(ctx) {}
};
} // namespace rnoh