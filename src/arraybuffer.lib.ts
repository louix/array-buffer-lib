type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigUint64ArrayConstructor;
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;

const calculateBytePadding = (currentBytes: number, elementSize: number) => {
  const modulusRemainder = currentBytes % elementSize
  return (modulusRemainder === 0) ? 0 : elementSize - modulusRemainder;
}

const getByteLength = <T extends TypedArrayConstructor | TypedArray>(typedArrays: Array<T>) => {
  let largestChunkBytes = 0;
  let totalByteLength = 0;
  for (const { BYTES_PER_ELEMENT } of typedArrays) {
    largestChunkBytes = Math.max(largestChunkBytes, BYTES_PER_ELEMENT);
    totalByteLength += BYTES_PER_ELEMENT;
  }

  return totalByteLength + calculateBytePadding(totalByteLength, largestChunkBytes);
}

export const mkBuffer = <T extends TypedArrayConstructor>(typedArrayConstructors: Array<T>, length: number) => {
  const bytesForStructure = getByteLength(typedArrayConstructors);
  return new ArrayBuffer( bytesForStructure * length);
};

  // const mkPutData = <T extends TypedArrayConstructor>(buffer: ArrayBuffer, dataStructure: Array<T>) => {
  //   const dataLength = getBytesForStructure(dataStructure);
  //
  //   return (data: Array<T["prototype"]>, index: number) => {
  //     data.reduce((byteOffset, next) => {
  //       const padding = byteOffset % next.BYTES_PER_ELEMENT;
  //       const bufferView = new next(buffer, byteOffset + padding, 1)[0])
  //       return byteOffset + padding + next.BYTES_PER_ELEMENT;
  //     }, dataLength * index)
  //   };
  // }

export const mkGetData = <T extends TypedArrayConstructor>(buffer: ArrayBuffer, typedArrayConstructors: Array<T>) => {
  const dataByteCount = getByteLength(typedArrayConstructors);
  console.log(`Data length: ${dataByteCount}`);
  return (index: number) => {
    const typedArrayViews: Array<T["prototype"]> = [];
    typedArrayConstructors.reduce((byteOffset, typedArrayConstructor) => {
      const padding = byteOffset % typedArrayConstructor.BYTES_PER_ELEMENT;
      typedArrayViews.push(new typedArrayConstructor(buffer, byteOffset + padding, 1))
      return byteOffset + padding + typedArrayConstructor.BYTES_PER_ELEMENT;
    }, dataByteCount * index)
    return typedArrayViews;
  };
}
