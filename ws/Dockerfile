# c++ to build and run ./ws
FROM ubuntu:22.04 AS builder

RUN apt-get update -y && apt-get install -y \
    build-essential \
    cmake \
    git \
    python3 \
    curl

WORKDIR /app

RUN git clone https://github.com/CrowCpp/Crow.git
RUN cd Crow && mkdir build && cd build && cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF && make install

COPY . .

RUN cmake .
RUN cmake --build . -j 4

FROM ubuntu:22.04

WORKDIR /app

COPY --from=builder /app/ws .

CMD ["./ws"]