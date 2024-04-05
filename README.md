# GalvoWeb2.0

## init

```
git submodule update --init
python opencv/platforms/js/build_js.py opencv-build --build_wasm --emscripten_dir ~/emsdk/upstream/emscripten

cd src-wasm
emcmake cmake
cd ..

pnpm i
```

Maybe you should edit `opencv/modules/js/CMakeLists.txt` file to remove `--memory-init-file 0` if running python failed.

## dev

### Build wasm

```
cd src-wasm; emmake make; cd -;
```

### Start dev-server

```
pnpm run dev
```
