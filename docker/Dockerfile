
FROM node:22

RUN apt update && apt upgrade -y
RUN apt install -y python3 clang flex bison cmake sqlite3

RUN git clone https://github.com/souffle-lang/souffle && \
    cd souffle && \
    cmake -S . -B build && \
    cmake --build build -j8
RUN ln -s /souffle/build/src/souffle /usr/bin
RUN ln -s /souffle/src/include/souffle /usr/include

RUN useradd -m user
USER user
WORKDIR /home/user

CMD ["/bin/bash"]