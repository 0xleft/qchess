cmake_minimum_required(VERSION 3.22.1)
project(backend)
set(CMAKE_CXX_STANDARD 17)

add_executable(backend main.cpp)

target_include_directories(backend PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
find_package(Crow)
target_link_libraries(backend PUBLIC Crow::Crow)