#include "opencv2/core/mat.hpp"
#include <cstdint>
#include <cstring>
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

EXTERN EMSCRIPTEN_KEEPALIVE void helloWorld(int argc, char ** argv) {
    printf("hellow world\n");
}

int getCanvasImgDataSize (int width, int height) {
  return width * height * 4 * sizeof(uint8_t);
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getBufferU8(int size) {
  return (int *)malloc(size * sizeof(uint8_t));
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getBufferU32(int size) {
  return (int *)malloc(size * sizeof(uint32_t));
}

EXTERN EMSCRIPTEN_KEEPALIVE int * getImgBuffer(int width, int height) {
  return (int *)malloc(getCanvasImgDataSize(width, height));
}

EXTERN EMSCRIPTEN_KEEPALIVE void clearBuffer(int * pointer) {
  free(pointer);
}  

cv::Mat readImg(const void* pointer, int width, int height) {
  cv::Mat img(height, width, CV_8UC4);
  memcpy(img.data, pointer, getCanvasImgDataSize(width, height));
  return img;
}

void writeImg (cv::Mat mat, int width, int height, void * dest) {
  int size = getCanvasImgDataSize(width, height);
  void* dest = (int *)malloc(size * sizeof(uint8_t));
  memcpy(dest, mat.data, size);
  return dest;
}

EXTERN EMSCRIPTEN_KEEPALIVE int * timesBy2 (const void* pointer, int width, int height) {
  const cv::Mat mat = readImg(pointer, width, height);
  mat *= 2;
  cout << mat << endl;

  int size = getCanvasImgDataSize(width, height);
  void* dest = (int *)malloc(size * sizeof(uint8_t));
  memcpy(dest, mat.data, getCanvasImgDataSize(width, height));
  return dest;
}

const vector<double > defaultVec = { 0.0f };
const vector<vector<double> > defaultMat = { { 0.0f } };
const string matrixSizeErrMessage = "number of columns in the first matrix should be the same as the number of rows in the second";

void logMat (vector<double> vec) {
  string my_str = "my mat :";

  for(int i=0; i<vec.size(); i++) {
     my_str += to_string(vec[i]) + ", ";
  }

  cout << my_str << endl;
}
void logMat (vector<vector<double>> vec) {
  string my_str = "my mat :";

  for(int i=0; i<vec[0].size(); i++) {
     for(int j=0; j<vec.size(); j++) {
         my_str += to_string(vec[j][i]) + ", ";
     }
  }

  cout << my_str << endl;
}
void logMat (cv::Mat mat) {
  string my_str = "my mat :";

  for(int i=0; i<mat.rows; i++) {
     for(int j=0; j<mat.cols; j++) {
         my_str += to_string(mat.at<double>(i,j)) + ", ";
     }
  }

  cout << my_str << endl;
}

vector<vector<double> > multiplyMatrices (vector<vector<double> > a, vector<vector<double> > b) {
  const int x = a.size();
  const int z = a[0].size();
  const int y = b[0].size();
  if (b.size() != z) {
    // XxZ & ZxY => XxY
    cout << matrixSizeErrMessage << endl;
  }

  vector<vector<double>> product(x, vector<double>(y, 0.0));
  for (int i = 0; i < x; i++) {
    for (int j = 0; j < y; j++) {
      for (int k = 0; k < z; k++) {
        product[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return product;
};

cv::Mat createImageMat (const int width, const int height, vector<uchar> buffer) {
  cv::Mat image(height, width, CV_8UC3);
  for (int i = 0; i < width; i++) {
    for (int j = 0; j < height; j++) {
      int start = (width * j + i) * 3;
      image.at<cv::Vec3b>(j,i)[0] = (int)buffer[start + 2];
      image.at<cv::Vec3b>(j,i)[1] = (int)buffer[start + 1];
      image.at<cv::Vec3b>(j,i)[2] = (int)buffer[start];
    }
  }
  return image;
};

cv::Mat vec2Mat (vector<vector<double>> vec, const int width, const int height) {
  cv::Mat mat(height, width, CV_64F, cv::Scalar(0.0f));
  for (int i = 0; i < width; i++) {
    for (int j = 0; j < height; j++) {
      mat.at<double>(j,i) = (double)vec[j][i];
    }
  }
  return mat;
};
cv::Mat vec2Mat (vector<double> vec, const int height) {
  cv::Mat mat(height, 1, CV_64F, cv::Scalar(0.0f));
  for (int i = 0; i < height; i++) {
      mat.at<double>(i,0) = (double)vec[i];
  }
  return mat;
};
vector<vector<double>> mat2Vec (cv::Mat mat, const int width, const int height) {
  vector<vector<double>> vec = { };
  for (int i = 0; i < height; i++) {
    vector<double> vectmp;
    for (int j = 0; j < width; j++) {
      vectmp.push_back(mat.at<double>(i,j));
    }
    vec.push_back(vectmp);
  }
  return vec;
};
vector<double> mat2Vec (cv::Mat mat, const int height) {
  vector<double> vec = { };
  for (int i = 0; i < height; i++) {
    vec.push_back(mat.at<double>(i,0));
  }
  return vec;
};

class Transformer {
  private:
    vector<vector<double>> vectorIntr;
    vector<double> vectorDist;
    cv::Mat matIntr = cv::Mat::zeros(3, 3, CV_64F);
    cv::Mat matDist = cv::Mat::zeros(8, 1, CV_64F);

    vector<vector<double>> homography;

    vector<vector<cv::Point2f>> corners_imgs;
    vector<vector<cv::Point3f>> corners_3d;
    cv::Size image_size;

    vector<cv::Point2f> galvoCordinates;
    vector<cv::Point2f> cameraCordinates;

  public:
    Transformer(const vector<vector<double>> intr, const vector<double> dist, const vector<vector<double>> _homography) {
      vectorIntr = intr;
      vectorDist = dist;
      homography = _homography;
    }
    Transformer() {
      vectorIntr = defaultMat;
      vectorDist = defaultVec;
      homography = defaultMat;
    }

    // void distortionTest() {
    //   cv::Mat img = cv::imread("chess.png");
    //   cv::Mat undistorted;
    //   cv::undistort(img, undistorted, matIntr, matDist);
    //   cv::imwrite("undistorted_chess.png", undistorted);
    // }

    void setHomography(const vector<vector<double>> _homography) {
      homography = _homography;
    }
    void setInnerParameters(const vector<vector<double>> _intr, vector<double> _dist) {
      vectorIntr = _intr;
      vectorDist = _dist;
      matIntr = vec2Mat(_intr, 3, 3);
      matDist = vec2Mat(_dist, _dist.size());

      logMat(matIntr);
      logMat(matDist);

      // distortionTest();
    }
    vector<vector<double>> getVectorIntr() {
      return vectorIntr;
    }
    vector<double> getVectorDist() {
      return vectorDist;
    }

    void findAndSetChessboardCorners(cv::Mat img) {
      // const int CHESS_NUM_X = 9, CHESS_NUM_Y = 6, BLOCK_SIZE = 25;
      const int CHESS_NUM_X = 10, CHESS_NUM_Y = 7;
      const double BLOCK_SIZE = 1.0f;
      cv::Mat chess_img = img.clone();
      cv::Size patternsize(CHESS_NUM_X, CHESS_NUM_Y);
      image_size = cv::Size(chess_img.cols, chess_img.rows);
      cout << "image size is (" << image_size.width << ", " << image_size.height << ")"<< endl;
      // cv::imwrite("chess.png", chess_img);
      cv::Mat grayImg = cv::Mat(image_size, CV_8UC1);
      cv::cvtColor(chess_img, grayImg, cv::COLOR_BGR2GRAY);
      // cv::imwrite("gray_chess.png", grayImg);
      vector<cv::Point3f> corners_local;
      vector<cv::Point2f> image_points;

      for (int i = 0; i < CHESS_NUM_X * CHESS_NUM_Y; i++) {
        corners_local.push_back(cv::Point3f(BLOCK_SIZE * (i % CHESS_NUM_X), BLOCK_SIZE * (i / CHESS_NUM_Y), 0.0f));
      }

      // チェスボードの内側コーナー位置を求める
      cout << "let's find chess corners" << endl;
      bool found = cv::findChessboardCorners(chess_img, cv::Size(CHESS_NUM_X, CHESS_NUM_Y), image_points, cv::CALIB_CB_ADAPTIVE_THRESH + cv::CALIB_CB_NORMALIZE_IMAGE + cv::CALIB_CB_FAST_CHECK);
      if (found) {
        cout << "chess corners found" << endl;
        corners_3d.push_back(corners_local);
        corners_imgs.push_back(image_points);
        cout << "chessboard no" << corners_3d.size() << endl;
        cout << image_points[0].x << "," << image_points[0].y << '\n' << endl;
        cv::drawChessboardCorners(chess_img, cv::Size2i(CHESS_NUM_X, CHESS_NUM_Y), image_points, found);
        // cv::imwrite("chess_with_cornsers.png", chess_img);

      } else {
        cout << "chess corners not found" << '\n' << endl;
      }
    }

    void calcInnerParams() {

      vector<cv::Mat> rvecs, tvecs;
      matIntr.at<double>(0,2) = (double)(image_size.width / 2);
      matIntr.at<double>(1,2) = (double)(image_size.height / 2);

      cout << "the number of used images is " << corners_3d.size() << endl;
      if (corners_3d.size() == 0) return;

      // インパラの計算
      cout << "let's calc intr" << endl;
      double rms = cv::calibrateCamera(corners_3d, corners_imgs, image_size, matIntr, matDist, rvecs, tvecs);
      cout << "intr found" << endl;
      cout << "rms is " << rms << endl;
      cout << "calculated intr" << endl;
      logMat(matIntr);
      logMat(matDist);

      // distortionTest();
      
      corners_imgs = {};
      corners_3d = {};

      vectorIntr = mat2Vec(matIntr, 3, 3);
      vectorDist = mat2Vec(matDist, matDist.rows);
    }

    void setHomographyCordinates(const vector<double> galvo, const vector<double> camera) {
      galvoCordinates.push_back(cv::Point2f(galvo[0], galvo[1]));
      cameraCordinates.push_back(cv::Point2f(camera[0], camera[1]));
    }

    cv::Point2f undistortPoint(cv::Point2f p) {
      cv::Mat R;
      cv::Mat mp(1,1,CV_32FC2);
      mp.at<cv::Point2f>(0) = cv::Point2f(p.x, p.y);
      cv::Mat mh(1,1,CV_32FC2);
      cv::undistortPoints(mp, mh, matIntr, matDist, R, matIntr);
      return mh.at<cv::Point2f>(0);
    }

    vector<vector<double>> calcHomography() {
      vector<vector<double>> vectorHomography(3, vector<double>(3));
      if (cameraCordinates.size() == 0) return vectorHomography;
      cv::Mat h = cv::findHomography(cameraCordinates, galvoCordinates, cv::FM_LMEDS);
      for(int i = 0; i < 3; ++i) {
        for (int j = 0; j < 3; ++j) {
          vectorHomography[j][i] = h.at<double>(j,i);
        }
      }
      cameraCordinates = {};
      galvoCordinates = {};
      return vectorHomography;
    }

    vector<vector<double>> calc(const cv::Point2f p) {
      vector<vector<double>> h(3, vector<double>(1, 0.0));
      if (vectorIntr == defaultMat) {
        cout << "Please set vectorIntr" << endl;
        return h;
      }
      if (vectorDist == defaultVec) {
        cout << "Please set vectorDist" << endl;
        return h;
      }
      if (homography == defaultMat) {
        cout << "Please set homography" << endl;
        return h;
      }

      cv::Point2f up = undistortPoint(cv::Point2f(p.x, p.y));
      cout << up << endl;
      vector<vector<double>> vp = { { static_cast<double>(up.x) }, { static_cast<double>(up.y) }, { 1.0f } };
      logMat(vp);
      h = multiplyMatrices(homography, vp);
      logMat(h);
      for (int i= 0; i < 3; i++) {
        h[i][0] /= h[2][0];
      }
      logMat(h);

      return h;
    }

};
