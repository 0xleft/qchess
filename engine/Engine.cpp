#include "../ws/include/chess.hpp"
#include "Engine.h"
#include <math.h>

#include <emscripten.h>
#include <emscripten/bind.h>

#ifdef __cplusplus
extern "C" {
#endif

Engine::Engine() {
}

Engine::~Engine() {
}

int Engine::test() {
	return 42;
}

#ifdef __cplusplus
}
#endif

EMSCRIPTEN_BINDINGS (c) {
	emscripten::class_<Engine>("Engine")
		.constructor()
		.function("test", &Engine::test);
};