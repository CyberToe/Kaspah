const present = globalThis.Buffer;

function StubBuffer() {}
StubBuffer.from = function from() {
  return new Uint8Array();
};
StubBuffer.alloc = function alloc(size) {
  return new Uint8Array(size);
};
StubBuffer.isBuffer = function isBuffer() {
  return false;
};
StubBuffer.constants = {};
StubBuffer.byteLength = function byteLength(value) {
  return typeof value === "string" ? value.length : 0;
};

const BufferImpl = present || StubBuffer;

module.exports = {
  Buffer: BufferImpl,
  constants: BufferImpl.constants || {},
  kMaxLength: BufferImpl.constants && BufferImpl.constants.MAX_LENGTH,
  kStringMaxLength: BufferImpl.constants && BufferImpl.constants.MAX_STRING_LENGTH,
  SlowBuffer: BufferImpl.SlowBuffer || BufferImpl,
};
