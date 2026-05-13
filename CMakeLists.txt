cmake_minimum_required(VERSION 3.20)
project(AsyncTaskScheduler LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable Coroutines for MSVC
if(MSVC)
    add_compile_options(/await:strict)
endif()

# Find dependencies
find_package(benchmark CONFIG REQUIRED)
find_package(GTest CONFIG REQUIRED)

include_directories(include)

# Main library
add_library(scheduler
    src/scheduler.cpp
    src/worker.cpp
)

# Benchmark
add_executable(scheduler_bench benchmarks/scheduler_bench.cpp)
target_link_libraries(scheduler_bench PRIVATE scheduler benchmark::benchmark)

# Tests
add_executable(scheduler_test tests/scheduler_test.cpp)
target_link_libraries(scheduler_test PRIVATE scheduler GTest::gtest_main)

# Install rules (optional but good practice)
install(TARGETS scheduler DESTINATION lib)
install(DIRECTORY include/ DESTINATION include)
