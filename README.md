# GalvoWeb2.0

GalvoWeb is serverless software for operating Galvo scanner with XY protocol.
Your preparation is only a browser (can call Web Serial API) and a teensy 4.0.

## init

```sh
git submodule update --init
python opencv/platforms/js/build_js.py opencv-build --build_wasm --emscripten_dir ~/emsdk/upstream/emscripten
```

You may resolve it by modify line 72 in `opencv/modules/CMakeLists.txt` into next line if failed
```txt
set(EMSCRIPTEN_LINK_FLAGS "${EMSCRIPTEN_LINK_FLAGS} -s TOTAL_MEMORY=128MB -s WASM_MEM_MAX=1GB -s ALLOW_MEMORY_GROWTH=1")
```


```sh
cd src-wasm
emcmake cmake
cd ..

pnpm i
```

Maybe you should edit `opencv/modules/js/CMakeLists.txt` file to remove `--memory-init-file 0` if running python failed.

## dev

### Build wasm

```sh
cd src-wasm; emmake make; cd -;
```

### Start dev-server

```sh
pnpm run dev
```
