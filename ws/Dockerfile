FROM ubuntu:22.04

RUN apt-get update -y && apt-get install -y \
    build-essential \
    cmake \
    git \
    python3 \
    libasio-dev \
    curl

WORKDIR /app

ADD https://github.com/CrowCpp/Crow.git /app/Crow
RUN cd Crow && mkdir build && cd build && cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF && make install

COPY . .

RUN cmake .
RUN cmake --build . -j 4

CMD ["./ws"]