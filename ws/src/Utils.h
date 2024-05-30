#ifndef UTILS_HPP
#define UTILS_HPP

#include <openssl/sha.h>
#include <sstream>
#include <iomanip>

namespace utils {

std::string sha256(const std::string str);

} // namespace utils

bool isAlphanumeric(const std::string& str);

#endif