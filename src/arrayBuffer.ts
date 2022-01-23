import * as AB from "./index";

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

const isBigIntArray = (t: TypedArray): t is (BigInt64Array | BigUint64Array) =>
  t instanceof BigInt64Array || t instanceof BigUint64Array


// Turn bytes into the offset used in `new TypedArray().set(values, offset)`
export const bytesToTypedArrayOffset = (typedArray: TypedArray | TypedArrayConstructor, bytes: number) => {
  const padding = calculateBytePadding(bytes, typedArray.BYTES_PER_ELEMENT);
  return (bytes + padding) / typedArray.BYTES_PER_ELEMENT;
}

export const debugFillBuffer = (buffer: ArrayBuffer, arrayBufferObject: ArrayBufferParams) => {
  let lastOffset = 0;
  Object.values(arrayBufferObject).forEach(({ kind, length }) => {
    const x = bytesToTypedArrayOffset(kind, lastOffset);
    if (isBigIntConstructor(kind)) {
      const arr = Array.from({ length }).map((_, i) => BigInt(i + 1));
      new kind(buffer).set(arr, x)
    } else {
      const arr = Array.from({ length }).map((_, i) => i + 1);
      new kind(buffer).set(arr, x)
    }
    lastOffset += kind.BYTES_PER_ELEMENT * length
  })
}

export const calculateBytePadding = (currentBytes: number, elementSize: number) => {
  const modulusRemainder = currentBytes % elementSize
  return (modulusRemainder === 0) ? 0 : elementSize - modulusRemainder;
}

export const getBytesPerElement = ({ kind, length }: ArrayBufferParamValue) => length > 0 ? kind.BYTES_PER_ELEMENT : 0

export const getByteLength = (params: ArrayBufferParams): number => {
  let largestByteCount = 1;
  let totalByteLength = 0;
  for (const arrayBuffer of Object.values(params)) {
    largestByteCount = Math.max(largestByteCount, getBytesPerElement(arrayBuffer));
    totalByteLength += arrayBuffer.kind.BYTES_PER_ELEMENT * arrayBuffer.length;
  }
  const padding = calculateBytePadding(totalByteLength, largestByteCount)
  return totalByteLength + padding;
}

export const mkArrayBuffer = <T extends ArrayBufferParams>(params: T, count: number) => {
  const bytes = getByteLength(params) * count;
  return new ArrayBuffer(bytes);
};

export const mkSharedArrayBuffer = <T extends ArrayBufferParams>(params: T, count: number) => {
  const bytes = getByteLength(params) * count;
  return new SharedArrayBuffer(bytes);
};

export const mkAccessData = <T extends ArrayBufferParams>(buffer: ArrayBuffer | SharedArrayBuffer, params: T) => {
  const bytesForObject = getByteLength(params);
  return (index: number): DataAccess<T> => {
    let byteOffset = bytesForObject * index;
    return Object.entries(params).reduce<DataAccess<T>>((acc, [key, arrayBuffer]) => {
      const bytesPerElement = getBytesPerElement(arrayBuffer)
      const padding = calculateBytePadding(byteOffset, bytesPerElement);
      acc[key as keyof T] = new arrayBuffer.kind(buffer, byteOffset + padding, arrayBuffer.length);
      byteOffset += padding + (bytesPerElement * arrayBuffer.length);
      return acc;
    }, {} as DataAccess<T>); // TODO: is it possible not to cast?
  };
}

export const mkProxy = <T extends ArrayBufferParams>(accessData: (index: number) => DataAccess<T>, entityCount: number) => {
  const target: Array<ProxyType<T>> = []
  const handler = {
    get: (_: Array<T>, index: number) => {
      if (index >= 0 && index < entityCount) {
        const data = accessData(index);
        return Object.entries(data).reduce<ProxyType<T>>((acc, [key, value]) => {
          // @ts-ignore // TODO: fix this! bigint !== number
          acc[key as keyof T] = Array.from(value);
          return acc
        }, {} as ProxyType<T>)
      }
    },
    set: (_: Array<T>, index: number, value: ProxyType<T>) => {
      if (index >= 0 && index < entityCount) {
        const data = accessData(index);
        return Object.entries(value).reduce<undefined>((acc, [key, value]) => {
          const arrayBuffer = data[key];
          // TODO: handle this with types?
          // @ts-ignore
          arrayBuffer.set(value);
          return undefined
        }, undefined)
      } else {
        // TODO: nicer error message
        throw "index out of bounds!"
      }
    }
  }
  return new Proxy(target, handler);
}

interface ArrayBufferParamValue {
  kind: TypedArrayConstructor,
  length: number;
}

export type ArrayBufferParams = Record<string, ArrayBufferParamValue>

export type DataAccess<T extends ArrayBufferParams> = {
  [x in keyof T]: T[x]["kind"]["prototype"];
};

type ProxyType<T extends AB.ArrayBufferParams> = {
  [k in keyof T]: Array<number> | Array<bigint>;
};
