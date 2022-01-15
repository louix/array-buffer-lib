import { useEffect } from "react";
import { mkArrayBuffer } from "./arraybuffer.lib";
import * as AB from "./arraybuffer.lib";

const fillBufferRandomly = (buffer: ArrayBuffer, arrayBufferObject: AB.ArrayBufferParams) => {
  let lastOffset = 0;
  Object.values(arrayBufferObject).forEach(({ kind, length }) => {
    const arr = Array.from({ length }).map((_, i) => i + 1);
    new kind(buffer).set(arr as any, lastOffset)
    lastOffset += kind.BYTES_PER_ELEMENT * length
  })
}

export const App = () => {
  useEffect(() => {
    const arrayBufferObject = {
      one: {
        kind: Uint8Array,
        length: 2
      }, two: {
        kind: Uint16Array,
        length: 2
      }, three: {
        kind: Uint32Array,
        length: 2
      }
    };
    const buffer = AB.mkArrayBuffer(arrayBufferObject, 3);
    fillBufferRandomly(buffer, arrayBufferObject);

    const getData = AB.mkGetData(buffer, arrayBufferObject);
    const data = getData(0)
    console.log(data.one, data.two, data.three);

  }, [])
  return <h1>Hi</h1>
}
