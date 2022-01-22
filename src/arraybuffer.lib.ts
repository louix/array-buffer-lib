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

const isBigIntConstructor = (t: TypedArrayConstructor): t is (BigInt64ArrayConstructor | BigUint64ArrayConstructor) =>
  t.prototype instanceof BigInt64Array || t.prototype instanceof BigUint64Array
const isNumberConstructor = (t: TypedArrayConstructor): t is (Exclude<TypedArrayConstructor, BigInt64ArrayConstructor | BigUint64ArrayConstructor>) =>
  !isBigIntConstructor(t)

// Turn bytes into the offset used in `new TypedArray().set(values, offset)`
const bytesToBufferOffset = (buffer: TypedArray | TypedArrayConstructor, bytes: number) => {
  const padding = calculateBytePadding(bytes, buffer.BYTES_PER_ELEMENT);
  return (bytes + padding) / buffer.BYTES_PER_ELEMENT;
}

export const debugFillBuffer = (buffer: ArrayBuffer, arrayBufferObject: ArrayBufferParams) => {
  let lastOffset = 0;
  Object.values(arrayBufferObject).forEach(({ kind, length }) => {
    const x = bytesToBufferOffset(kind, lastOffset);
    if (isBigIntConstructor(kind)) {
      const arr = Array.from({ length }).map((_, i) => BigInt(i + 1));
      new kind(buffer).set(arr, x)
    } else {
      console.log(lastOffset, x);
      const arr = Array.from({ length }).map((_, i) => i + 1);
      new kind(buffer).set(arr, x)
    }
    lastOffset += kind.BYTES_PER_ELEMENT * length
  })
}

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

export const mkArrayBuffer = <T extends ArrayBufferParams>(params: T, count: number) => {
  const bytes = getByteLength(params) * count;
  console.log("[mkArrayBuffer] bytes");
  return new ArrayBuffer(bytes);
};

export const mkAccessData = <T extends ArrayBufferParams>(buffer: ArrayBuffer | SharedArrayBuffer, params: T) => {
  const bytesForObject = getByteLength(params);
  return (index: number): Response<T> => {
    let byteOffset = bytesForObject * index;
    return Object.entries(params).reduce<Response<T>>((acc, [key, arrayBuffer]) => {
      const bytesPerElement = getBytesPerElement(arrayBuffer)
      const padding = calculateBytePadding(byteOffset, bytesPerElement);
      acc[key as keyof T] = new arrayBuffer.kind(buffer, byteOffset + padding, arrayBuffer.length);
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
  [x in keyof T]: T[x]["kind"]["prototype"];
};
