cmake_minimum_required(VERSION 3.22.1)
project(ws)
set(CMAKE_CXX_STANDARD 17)

add_executable(ws
    src/main.cpp
    
)

target_include_directories(ws PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_include_directories(ws PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)
find_package(Crow)
target_link_libraries(ws PUBLIC Crow::Crow)