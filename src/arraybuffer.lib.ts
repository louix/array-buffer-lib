type TypedArrayConstructor =
  Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | BigInt64ArrayConstructor
  | BigUint64ArrayConstructor;
type TypedArray =
  Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

const calculateBytePadding = (currentBytes: number, elementSize: number) => {
  const modulusRemainder = currentBytes % elementSize
  return (modulusRemainder === 0) ? 0 : elementSize - modulusRemainder;
}

const getBytesPerElement = ({ kind, length }: ArrayBufferParamValue) => length > 0 ? kind.BYTES_PER_ELEMENT : 0

const getByteLength = (params: ArrayBufferParams): number => {
  let largestByteCount = 0;
  let totalByteLength = 0;
  for (const arrayBuffer of Object.values(params)) {
    largestByteCount = Math.max(largestByteCount, getBytesPerElement(arrayBuffer));
    totalByteLength += arrayBuffer.kind.BYTES_PER_ELEMENT * arrayBuffer.length;
  }
  return totalByteLength + calculateBytePadding(totalByteLength, largestByteCount);
}

export const mkArrayBuffer = <T extends ArrayBufferParams>(params: T, count: number) =>
  new ArrayBuffer(getByteLength(params) * count);

export const mkGetData = <T extends ArrayBufferParams>(buffer: ArrayBuffer | SharedArrayBuffer, params: T) => {
  const bytesForObject = getByteLength(params);
  return (index: number): Response<T> => {
    let byteOffset = bytesForObject * index;
    return Object.entries(params).reduce<Response<T>>((acc, [key, arrayBuffer]) => {
      const bytesPerElement = getBytesPerElement(arrayBuffer)
      const padding = byteOffset % bytesPerElement;
      console.log(`${key}: ${bytesPerElement} bytes per element, ${arrayBuffer.length} elements, ${padding} padding, total: ${bytesPerElement * arrayBuffer.length + padding}. current byte offset: ${byteOffset}`);
      acc[key as keyof T] = new arrayBuffer.kind(buffer, byteOffset + padding, arrayBuffer.length);
      // TODO: this offset is too low, it's ${previousBuffer.BytesPerElement} too short?
      byteOffset += padding + (bytesPerElement * arrayBuffer.length);
      return acc;
    }, {} as Response<T>); // TODO: is it possible not to cast?
  };
}

interface ArrayBufferParamValue {
  kind: TypedArrayConstructor,
  length: number;
}

export type ArrayBufferParams = Record<string, ArrayBufferParamValue>

type Response<T extends ArrayBufferParams> = {
  [x in keyof T]: TypedArray;
};
