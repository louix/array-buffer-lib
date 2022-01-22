import * as AB from "./arrayBuffer";

const numberBasedTypedArrays = [Uint8Array, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array] as const;
const bigIntBasedTypedArrays = [BigUint64Array, BigInt64Array] as const;
const typedArrays = [...numberBasedTypedArrays, ...bigIntBasedTypedArrays] as const;

describe("bytesToTypedArrayOffset", () => {
  return typedArrays.forEach((typedArray) => {
    Array.from({ length: typedArray.BYTES_PER_ELEMENT }).map((_, i) => i).forEach((byteOffset) => {
      test(`calculates offset by ${byteOffset} bytes for ${typedArray.name} as required`, () => {
        // when
        const offset = AB.bytesToTypedArrayOffset(typedArray, typedArray.BYTES_PER_ELEMENT - byteOffset)

        // then
        if (typedArray.BYTES_PER_ELEMENT > byteOffset) {
          expect(offset).toEqual(1);
        } else {
          expect(offset).toEqual(0);
        }
      })
    })
  })
})

describe("calculateBytePadding", () => {
  return typedArrays.forEach((typedArray) => {
    test(`default case (${typedArray.name})`, () => {
      // given
      const currentBytes = 1;

      // when
      const padding = AB.calculateBytePadding(currentBytes, typedArray.BYTES_PER_ELEMENT)

      // then
      expect(padding).toEqual(typedArray.BYTES_PER_ELEMENT - currentBytes)
    })
    Array.from({ length: typedArray.BYTES_PER_ELEMENT + 2 }).map((_, i) => i).forEach((currentBytes) => {
      test(`padding is not negative given ${currentBytes} bytes (${typedArray})`, () => {
        // when
        const result = AB.calculateBytePadding(currentBytes, typedArray.BYTES_PER_ELEMENT) > -1;

        // then
        expect(result).toBe(true)
      })
    })
  })
})
