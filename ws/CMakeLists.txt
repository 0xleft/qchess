cmake_minimum_required(VERSION 3.22.1)
project(ws)
set(CMAKE_CXX_STANDARD 20)


add_executable(ws
    src/Utils.cpp
    src/Database.cpp
    src/Game.cpp
    src/main.cpp
)

set(OPENSSL_USE_STATIC_LIBS TRUE)

find_package(OpenSSL REQUIRED)
find_package(PostgreSQL REQUIRED)

include(FetchContent)

FetchContent_Declare(
   taocpp-taopq
   GIT_REPOSITORY https://github.com/taocpp/taopq
   GIT_TAG main
)
FetchContent_MakeAvailable(taocpp-taopq)

target_include_directories(ws PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_include_directories(ws PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)
find_package(Crow)
target_link_libraries(ws taocpp::taopq)
target_link_libraries(ws Crow::Crow OpenSSL::Crypto)
target_link_libraries(ws pq)