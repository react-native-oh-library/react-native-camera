
cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)
set(rnoh_camera_generated_dir "${CMAKE_CURRENT_SOURCE_DIR}/generated")

file(GLOB rnoh_camera_SRC CONFIGURE_DEPENDS *.cpp)
file(GLOB_RECURSE rnoh_camera_generated_SRC "${rnoh_camera_generated_dir}/**/*.cpp")

add_library(rnoh_camera SHARED ${rnoh_camera_SRC} ${rnoh_camera_generated_SRC})
target_include_directories(rnoh_camera PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${rnoh_camera_generated_dir}
    ${CMAKE_CURRENT_SOURCE_DIR}/generated/react/render/components/react_native_camera
)

target_link_libraries(rnoh_camera PUBLIC rnoh)