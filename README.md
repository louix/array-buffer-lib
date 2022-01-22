A library to make working with `ArrayBuffer`/`SharedArrayBuffer` and complex types slightly easier. 
These can be useful when working with [WebWorkers][3] and creating game engines.

If you want to use `SharedArrayBuffer`, be sure to set the [required headers][4].

If you'd like to know more about this stuff, check out the MDN pages for [TypedArray][0], [ArrayBuffer][1] and
[SharedArrayBuffer][2].

# Example

```javascript
import * as AB from "./arrayBuffer";

// Setup your "type"
const myType = {
  health: {
    kind: Uint8Array, // 0-255
    length: 1
  },
  coordinates: {
    kind: Uint16Array, // 0-65535
    length: 2
  }
}

// Choose how many elements can be saved
const entityCount = 10;

// Create the array buffer and a way to access it
const buffer = AB.mkArrayBuffer(myType, entityCount);
const accessData = AB.mkAccessData(buffer, myType);

// Now you can get/set data!
const entity0 = accessData(0);

console.log(entity0.health);
console.log(entity0.coordinates);

entity0.health.set([255]); // set to full health
entity0.coordinates.set([127, 431]) // set initial position

```

# Usage

This is the above example explained.

First construct the "type" of your object using the name you want as a key,
and the TypedArray constructor and length as a value.

For example if you want health `[0-255]` and coordinates `[0-65535, 0-65535]` states:

```javascript
import * as AB from "./arrayBuffer";

const myType = {
  health: {
    kind: Uint8Array, // 0-255
    length: 1
  },
  coordinates: {
    kind: Uint16Array, // 0-65535
    length: 2
  }
}
```

We choose 2 as the length for coordinates because we're using a 2D plane (so: x and y).

Next we want to create our `ArrayBuffer`. The `ArrayBuffer` is where all the data will be saved.
You choose how many elements will be stored in the buffer, and `mkArrayBuffer()` will
automatically create you an `ArrayBuffer` of the correct size to fit it all your data.

You can also create a `SharedArrayBuffer` with `mkSharedArrayBuffer()`.

```javascript
const entityCount = 10;

const buffer = AB.mkArrayBuffer(myType, entityCount);
```

We can then pass our buffer and our "type" to the `mkAccessData` function,
which will in turn generate us a nice helper function which we can use to access (get or set)
our data at specific indexes.

```javascript
const accessData = AB.mkAccessData(buffer, myType);
```

Now you have an easy way to access the data for each element! Simply:
```javascript
const entity0 = accessData(0);

console.log(entity0.health);
console.log(entity0.coordinates);

entity0.health.set([255]); // set to full health
entity0.coordinates.set([127, 431]) // set initial position
```

[0]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/Planned_changes
