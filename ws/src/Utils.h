#ifndef UTILS_HPP
#define UTILS_HPP

#include <openssl/sha.h>
#include <sstream>
#include <iomanip>
#include <string>
#include <vector>

namespace utils {

std::string sha256(const std::string str);
bool isAlphanumeric(const std::string& str);
std::vector<std::string> split(std::string str, std::string delimiter);

} // namespace utils

#endif