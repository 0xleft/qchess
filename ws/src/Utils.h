#pragma once

#ifndef UTILS_HPP
#define UTILS_HPP

#include <openssl/sha.h>
#include <sstream>
#include <iomanip>
#include <string>
#include <vector>
#include <chrono>

namespace utils {

std::string sha256(const std::string str);
bool isAlphanumeric(const std::string& str);
std::vector<std::string> split(std::string str, std::string delimiter);
std::string timeToString(std::chrono::system_clock::time_point time);
std::chrono::system_clock::time_point stringToTime(std::string time);

} // namespace utils

#endif