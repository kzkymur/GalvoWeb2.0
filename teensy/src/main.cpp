#include <Arduino.h>
#include <Wire.h>
#include "XY2_100.h"

#define PWM_OUT_PIN (5)
#define GALVO_ENABLE_PIN (3)
#define ADJ1_IN_PIN (20)
#define ADJ2_IN_PIN (21)
#define I2C_DAC_ADDR (0x60) // 0b1100000 (7bit address)

//! ガルバノスキャナ
XY2_100* galvo;

String buffer = "";
char mode;
uint16_t x, y, vol;

void setup() {
    // USBシリアル（On board）
    Serial.begin(9600);

    // USBシリアル（Extra）
    // Serial2.begin(115200);

    // レーザー制御用PWM出力
    pinMode(PWM_OUT_PIN, OUTPUT);
    analogWriteResolution(12);

    // デバッグ調整用ボリューム
    pinMode(ADJ1_IN_PIN, INPUT);
    pinMode(ADJ2_IN_PIN, INPUT);

    // I2C（DAC用）
    Wire.begin();
    Wire.beginTransmission(I2C_DAC_ADDR);
    Wire.write(B01100000); // 全メモリ書き込み, VREF1/0=0 PD1/0=0 G=0
    Wire.write(B00000000); // 0x00
    Wire.write(B00000000); // 0x00
    Wire.endTransmission();

    // ガルバノスキャナ初期化
    pinMode(GALVO_ENABLE_PIN, OUTPUT);
    galvo = new XY2_100();
    galvo->begin();

    Serial.printf("Teensy 4 Galvo Control\n");
    // Serial2.printf("Teensy 4 Galvo Control\n");
}

void loop() {

    if (Serial.available()) {
        buffer = Serial.readString();
        mode = buffer.charAt(0);
        buffer = buffer.substring(1);
    }

    if (mode == 'A') {
        // レーザー制御関連
        int result = sscanf(buffer.c_str(), "%d", &vol);
        float val = (float)vol / 100.0;
        val *= 4005.0;
        uint16_t duty = static_cast<uint16_t>(val);

        // PWM出力
        analogWrite(PWM_OUT_PIN, duty);

        // DAC出力
        Wire.beginTransmission(I2C_DAC_ADDR);
        Wire.write((duty >> 8) & 0x0F);
        Wire.write(duty);
        Wire.endTransmission();

    } else if (mode == 'B') {
        // ガルバノスキャナ制御
        digitalWrite(GALVO_ENABLE_PIN, 1);
        int result = sscanf(buffer.c_str(), "%d,%d", &x, &y);
        galvo->setPos(x, y);
    }
}