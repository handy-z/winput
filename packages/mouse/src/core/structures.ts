export function buildMouseInputBuffer(
  dx: number,
  dy: number,
  mouseData: number,
  flags: number,
  time: number,
  extraInfo: bigint
): Buffer {
  const buf = Buffer.alloc(24);
  buf.writeInt32LE(dx, 0);
  buf.writeInt32LE(dy, 4);
  buf.writeUInt32LE(mouseData, 8);
  buf.writeUInt32LE(flags, 12);
  buf.writeUInt32LE(time, 16);
  buf.writeBigUInt64LE(extraInfo, 16);
  return buf;
}

export function buildInputBuffer(type: number, inputBuf: Buffer): Buffer {
  const buf = Buffer.alloc(40);
  buf.writeUInt32LE(type, 0);
  inputBuf.copy(buf, 8);
  return buf;
}
