# GalvoWeb2.0

## init

```
git submodule init
python opencv/platforms/js/build_js.py opencv-build --build_wasm --emscripten_dir ~/emsdk/upstream/emscripten

cd src-wasm
emcmake cmake
cd ..

npm i
```

