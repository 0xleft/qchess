cmake_minimum_required(VERSION 3.10)
project(ws)
set(CMAKE_CXX_STANDARD 20)


add_executable(ws
    src/Utils.cpp
    src/Game.cpp
    src/main.cpp
)

set(OPENSSL_USE_STATIC_LIBS TRUE)

find_package(OpenSSL REQUIRED)

include(FetchContent)
FetchContent_Declare(cpr GIT_REPOSITORY https://github.com/libcpr/cpr.git
                         GIT_TAG 3b15fa82ea74739b574d705fea44959b58142eb8)
FetchContent_MakeAvailable(cpr)


if (CMAKE_BUILD_TYPE STREQUAL "Release")
    target_compile_options(ws PRIVATE -O3)
    target_compile_definitions(ws PRIVATE WS_PRODUCTION)
endif()

target_include_directories(ws PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_include_directories(ws PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)
find_package(Crow)
target_link_libraries(ws Crow::Crow OpenSSL::Crypto cpr::cpr)