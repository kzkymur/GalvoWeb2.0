# GalvoWeb2.0

GalvoWeb is a serverless software for operating Galvo Scanner with XY protocol.

Your preparation is only a browser (can call Web Serial API) and a Teensy 4.0.

## init

Assume [emsdk](https://github.com/emscripten-core/emsdk) is already installed on your PC

```sh
git clone git@github.com:kzkymur/GalvoWeb2.0.git
cd GalvoWeb2.0
git submodule update --init
python opencv/platforms/js/build_js.py opencv-build --build_wasm --emscripten_dir ~/emsdk/upstream/emscripten
```

Maybe you should edit line 72 in `opencv/modules/js/CMakeLists.txt` file to remove `--memory-init-file 0` if running python failed.

```txt
set(EMSCRIPTEN_LINK_FLAGS "${EMSCRIPTEN_LINK_FLAGS} -s TOTAL_MEMORY=128MB -s WASM_MEM_MAX=1GB -s ALLOW_MEMORY_GROWTH=1")
```

```sh
cd src-wasm
emcmake cmake
cd ..

pnpm i
```

Then, you have to write the program on your Teensy 4.0 .
Please go [teensy directory](https://github.com/kzkymur/GalvoWeb2.0/tree/main/teensy).

## dev

### Build wasm

```sh
cd src-wasm; emmake make; cd -;
```

### Start dev-server

```sh
pnpm run dev
```

Access your localhost:8080

## Author

[kzkymur](https://twitter.com/kzkymur)

## LICENSE

MIT
