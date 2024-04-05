import { WriteSerialPort } from "@/store/ctx";

type Coordinate = {
  x: number;
  y: number;
};

class TeencyCommunicator {
  private send: WriteSerialPort;
  constructor(writeSerialPort: WriteSerialPort) {
    this.send = writeSerialPort;
  }
  public setLaserOutput(output: number) {
    this.send(`A${Math.floor(output)}`);
  }
  public setGalvoPos(coordinate: Coordinate) {
    this.send(`B${Math.floor(coordinate.x)},${Math.floor(coordinate.y)}`);
  }
}

export default TeencyCommunicator;
