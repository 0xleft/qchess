emcc --bind -Oz Engine.cpp -o engine.js -s WASM=1 -s NO_EXIT_RUNTIME=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['addOnPostRun']" -std=c++20