#include "opencv2/core/mat.hpp"
#include <cstdint>
#include <cstring>
#include <opencv2/core/types.hpp>
#include <opencv2/imgproc.hpp>
#include <stdio.h>
#include <stdlib.h>

#include <opencv2/opencv.hpp>
#include <opencv2/core.hpp>
#include <vector>

#include <emscripten/emscripten.h>

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif

using namespace std;

// const int CHESS_NUM_X = 9, CHESS_NUM_Y = 6, BLOCK_SIZE = 25;
const int CHESS_NUM_X = 10, CHESS_NUM_Y = 7;
const double BLOCK_SIZE = 1.0f;

int getCanvasImgDataSize (int width, int height) {
  return width * height * 4 * sizeof(uint8_t);
}
cv::Mat readMat32F(const void* pointer, int width, int height) {
  cv::Mat img(height, width, CV_32F);
  memcpy(img.data, pointer, sizeof(float) * width * height);
  return img;
}
cv::Mat readMat64F(const void* pointer, int width, int height) {
  cv::Mat img(height, width, CV_64F);
  memcpy(img.data, pointer, sizeof(double) * width * height);
  return img;
}
int* writeMat (cv::Mat mat) {
  int * dest;
  memcpy(dest, mat.data, mat.total() * mat.elemSize());
  return dest;
}
void writeMat (cv::Mat mat, void * dest) {
  memcpy(dest, mat.data, mat.total() * mat.elemSize());
}
cv::Mat readImg(const void* pointer, int width, int height) {
  cv::Mat img(height, width, CV_8UC4);
  memcpy(img.data, pointer, getCanvasImgDataSize(width, height));
  return img;
}
void* writeImg (cv::Mat mat, int width, int height) {
  void * dest;
  memcpy(dest, mat.data, getCanvasImgDataSize(width, height));
  return dest;
}
void writeImg (cv::Mat mat, int width, int height, void * dest) {
  memcpy(dest, mat.data, getCanvasImgDataSize(width, height));
}

cv::Mat vecPoint3f2Mat (vector<cv::Point3f> vec) {
  cv::Mat mat(vec.size(), 1, CV_32FC3);
  for (size_t i = 0; i < vec.size(); ++i) {
      mat.at<cv::Vec3f>(i, 0) = cv::Vec3f(vec[i].x, vec[i].y, vec[i].z);
  }
  return mat;
};
cv::Mat vecPoint2f2Mat (vector<cv::Point2f> vec) {
  cv::Mat mat(vec.size(), 1, CV_32FC2);
  for (size_t i = 0; i < vec.size(); ++i) {
      mat.at<cv::Vec2f>(i, 0) = cv::Vec2f(vec[i].x, vec[i].y);
  }
  return mat;
};
vector<cv::Point3f> mat2VecPoint3f (cv::Mat mat) {
  std::vector<cv::Point3f> vec;
  for (int i = 0; i < mat.rows; ++i) {
      cv::Vec3f point = mat.at<cv::Vec3f>(i, 0);
      vec.push_back(cv::Point3f(point[0], point[1], point[2]));
  }
  return vec;
}
vector<cv::Point2f> mat2VecPoint2f (cv::Mat mat) {
  std::vector<cv::Point2f> vec;
  for (int i = 0; i < mat.rows; ++i) {
      cv::Vec2f point = mat.at<cv::Vec2f>(i);
      vec.push_back(cv::Point2f(point[0], point[1]));
  }
  return vec;
}

EXTERN EMSCRIPTEN_KEEPALIVE void helloWorld(int argc, char ** argv) {
    printf("hellow world\n");
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getU8Buffer(int size) {
  return (int *)malloc(size * sizeof(uint8_t));
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getI32Buffer(int size) {
  return (int *)malloc(size * sizeof(int32_t));
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getU32Buffer(int size) {
  return (int *)malloc(size * sizeof(uint32_t));
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getFloatBuffer(int size) {
  return (int *)malloc(size * sizeof(float));
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getDoubleBuffer(int size) {
  return (int *)malloc(size * sizeof(double));
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getImgBuffer(int width, int height) {
  return (int *)malloc(getCanvasImgDataSize(width, height));
}

EXTERN EMSCRIPTEN_KEEPALIVE void clearBuffer(int * pointer) {
  free(pointer);
}  

EXTERN EMSCRIPTEN_KEEPALIVE void timesBy2 (const void* pointer, int width, int height, void * dest) {
  const cv::Mat mat = readImg(pointer, width, height);
  mat *= 2;
  writeImg(mat, width, height, dest);
}

EXTERN EMSCRIPTEN_KEEPALIVE bool findChessboardCorners (const void* pointer, int width, int height, void * corners_img_dest) {
  const double BLOCK_SIZE = 1.0f;
  cv::Mat img = readImg(pointer, width, height);
  cv::Mat chess_img = img.clone();
  cv::Size patternsize(CHESS_NUM_X, CHESS_NUM_Y);
  cv::Size image_size = cv::Size(chess_img.cols, chess_img.rows);
  cv::Mat grayImg = cv::Mat(image_size, CV_8UC1);
  cv::cvtColor(chess_img, grayImg, cv::COLOR_RGBA2GRAY);
  // vector<cv::Point3f> corners_local;
  vector<cv::Point2f> image_points;

  // for (int i = 0; i < CHESS_NUM_X * CHESS_NUM_Y; i++) {
  //   corners_local.push_back(cv::Point3f(BLOCK_SIZE * (i % CHESS_NUM_X), BLOCK_SIZE * ((double)i / CHESS_NUM_Y), 0.0f));
  // }

  // チェスボードの内側コーナー位置を求める
  cout << "let's find chess corners" << endl;
  bool found = cv::findChessboardCorners(chess_img, cv::Size(CHESS_NUM_X, CHESS_NUM_Y), image_points, cv::CALIB_CB_ADAPTIVE_THRESH + cv::CALIB_CB_NORMALIZE_IMAGE + cv::CALIB_CB_FAST_CHECK);
  if (found) {
    cout << "chess corners found" << endl;
    writeMat(vecPoint2f2Mat(image_points), corners_img_dest);
    return true;
  } else {
    cout << "chess corners not found" << '\n' << endl;
    return false;
  }
}

EXTERN EMSCRIPTEN_KEEPALIVE bool calcInnerParams(uint32_t* pointersPointer, const int nPointer, const int imgWidth, const int imgHeight, void* intrMatrixDest, void* distCoeffsDest) {
  cv::Mat intr = cv::Mat::zeros(3, 3, CV_64F);
  cv::Mat dist = cv::Mat::zeros(8, 1, CV_64F);
  vector<cv::Mat> rvecs, tvecs;
  intr.at<double>(0,2) = ((double)imgWidth / 2.0);
  intr.at<double>(1,2) = ((double)imgHeight / 2.0);

  cout << "the number of used images is " << nPointer << endl;
  if (nPointer == 0) return false;

  cv::Size imageSize(imgWidth, imgHeight);
  vector<vector<cv::Point3f>> corners_3d = {};
  vector<vector<cv::Point2f>> corners_imgs = {};

  for (int i = 0; i < nPointer; i++) {
    vector<cv::Point3f> corners_local = {};
    for (int j = 0; j < CHESS_NUM_X * CHESS_NUM_Y; j++) {
      corners_local.push_back(cv::Point3f(BLOCK_SIZE * (j % CHESS_NUM_X), BLOCK_SIZE * (j / CHESS_NUM_Y), 0.0f));
    }
    corners_3d.push_back(corners_local);
    corners_imgs.push_back(mat2VecPoint2f(readMat32F((void *)pointersPointer[i], 2, CHESS_NUM_X * CHESS_NUM_Y)));
  }

  // インパラの計算
  cout << "let's calc intr" << endl;
  double rms = cv::calibrateCamera(corners_3d, corners_imgs, imageSize, intr, dist, rvecs, tvecs);
  cout << "intr found" << endl;
  cout << "rms is " << rms << endl;
  intr.convertTo(intr, CV_32F);
  dist.convertTo(dist, CV_32F);
  writeMat(intr, intrMatrixDest);
  writeMat(dist, distCoeffsDest);
  return true;
}

EXTERN EMSCRIPTEN_KEEPALIVE void calcUndistMap(void* intrP, void* distP, int imgWidth, const int imgHeight, void* mapXDest, void* mapYDest) {
  cout << "calcUndistMap" << endl;
  cv::Mat mapX, mapY;
  cv::Mat mapR = cv::Mat::eye(3, 3, CV_64F);

  cv::Mat intr = readMat32F(intrP, 3, 3);
  cv::Mat dist = readMat32F(distP, 1, 8);
  cv::Size imageSize(imgWidth, imgHeight);

  cout << "getOptimalNewCameraMatrix" << endl;
  cv::Mat new_intrinsic = cv::getOptimalNewCameraMatrix(intr, dist, imageSize, 0);
  cout << "initUndistortRectifyMap" << endl;
  cv::initUndistortRectifyMap(intr, dist, mapR, new_intrinsic, imageSize, CV_32FC1, mapX, mapY);

  writeMat(mapX, mapXDest);
  writeMat(mapY, mapYDest);
}

EXTERN EMSCRIPTEN_KEEPALIVE void undistort(void * org, int width, int height, void * mapX, void * mapY, void* dest) {
  cv::Mat img = readImg(org, width, height);
  cv::Mat undistorted;
  cv::Mat mapXMat = readMat32F(mapX, width, height);
  cv::Mat mapYMat = readMat32F(mapY, width, height);
  cv::remap(img, undistorted, mapXMat, mapYMat, cv::INTER_LINEAR);
  writeMat(undistorted, dest);
}

cv::Point2f undistortPoint(cv::Point2f p, cv::Mat cameraMat, cv::Mat  distCoeffs) {
  cv::Mat R;
  cv::Mat mp(1,1,CV_32FC2);
  mp.at<cv::Point2f>(0) = p;
  cv::Mat dest(1,1,CV_32FC2);
  cv::undistortPoints(mp, dest, cameraMat, distCoeffs, R, cameraMat);
  return dest.at<cv::Point2f>(0);
}

EXTERN EMSCRIPTEN_KEEPALIVE void* undistortPoint(int x, int y, void * cameraMat, void * distCoeffs) {
  cv::Point2f p = cv::Point2f((float)x, (float)y);
  cv::Mat intr = readMat32F(cameraMat, 3, 3);
  cv::Mat dist = readMat32F(distCoeffs, 1, 8);

  cv::Point2f up = undistortPoint(p, intr, dist);
  cv::Mat dest(1,1,CV_32FC2);
  dest.at<cv::Point2f>(0) = up;
  return writeMat(dest);
}

EXTERN EMSCRIPTEN_KEEPALIVE void* calcHomography(void * galvoDots, void * cameraDos, int size) {
  vector<cv::Point2f> camera = mat2VecPoint2f(readMat32F(cameraDos, 1, size));
  vector<cv::Point2f> galvo = mat2VecPoint2f(readMat32F(galvoDots, 1, size));
  cv::Mat h = cv::findHomography(camera, galvo, cv::FM_LMEDS);
  return writeMat(h);
}

EXTERN EMSCRIPTEN_KEEPALIVE void* Transform(int x, int y, void * homography, void * cameraMat, void * distCoeffs) {
  cv::Point2f p = cv::Point2f((float)x, (float)y);
  cv::Mat h = readMat32F(homography, 3, 3);
  cv::Mat intr = readMat32F(cameraMat, 3, 3);
  cv::Mat dist = readMat32F(distCoeffs, 1, 8);

  cv::Point2f up = undistortPoint(p, intr, dist);
  cv::Mat upm = (cv::Mat_<float>(3, 1) << up.x, up.y, 1.0f);
  cv::Mat result = h * upm;

  cv::Point3f resultPoint(result.at<float>(0), result.at<float>(1), result.at<float>(2));
  cv::Mat dest(1,1,CV_32FC3);
  dest.at<cv::Point3f>(0) = resultPoint;

  return writeMat(dest);
}
