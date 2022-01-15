import { useEffect } from "react";
import * as AB from "./arraybuffer.lib";

export const App = () => {
  useEffect(() => {
    const dataStructure = [Uint8Array, Uint16Array, Uint32Array];
    const buffer = AB.mkBuffer(dataStructure, 3);
    new Uint8Array(buffer).set(Array.from({length: buffer.byteLength}).map((_, i) => i));
    const getData = AB.mkGetData(buffer, dataStructure);
    const data = getData(0);
    console.log(data);
    data[0][0] = 12;
    data[1][0] = 13;
    data[2][0] = 14;
    const data2 = getData(0);
    console.log(data2);

  }, [])
  return <h1>Hi</h1>
}
