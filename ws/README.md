
```bash
sudo apt install libpq-dev

https://github.com/jtv/libpqxx.git
cd libpqxx
cmake .
sudo cmake --build . --target install
sudo mv /usr/local/lib/libpqxx.a /usr/local/lib/liblibpqxx.a
```