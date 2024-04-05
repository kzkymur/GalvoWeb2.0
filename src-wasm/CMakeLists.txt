cmake_minimum_required(VERSION 3.11)
set(CMAKE_CXX_COMPILER /usr/bin/g++)
enable_language(CXX)

project(galvoWebjCXX)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(OpenCV_DIR ../opencv-build)
set(BUILD_SHARED_LIBS OFF)
include_directories(${CMAKE_INSTALL_PREFIX}/include)

find_package(OpenCV REQUIRED)
include_directories( ${OpenCV_INCLUDE_DIRS} )

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s MODULARIZE=1")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s ENVIRONMENT='web'")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s NO_DISABLE_EXCEPTION_CATCHING")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s \"EXPORTED_RUNTIME_METHODS=[\'ccall\', \'cwrap\']\"")
# set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s \"INITIAL_MEMORY=16777216")
# set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s \"INITIAL_MEMORY=67108864\"")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s \"INITIAL_MEMORY=83886080\"")

add_executable(index index.cpp)
target_link_libraries(index ${OpenCV_LIBS})
