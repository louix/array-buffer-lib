import { useEffect } from "react";
import * as AB from "./arraybuffer.lib";

export const App = () => {
  useEffect(() => {
    const arrayBufferObject = {
      one: {
        kind: Uint8Array,
        length: 5
      }, two: {
        kind: Uint16Array,
        length: 2
      }, three: {
        kind: Uint32Array,
        length: 3
      }
    };
    const buffer = AB.mkArrayBuffer(arrayBufferObject, 1);
    console.log(buffer.byteLength);
    AB.debugFillBuffer(buffer, arrayBufferObject);

    const accessData = AB.mkAccessData(buffer, arrayBufferObject);
    const data = accessData(0)
    console.log(data.one, data.two, data.three);

  }, [])
  return <h1>Hi</h1>
}
