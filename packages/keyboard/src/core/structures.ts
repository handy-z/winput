export function buildKeyboardInputBuffer(
  vk: number,
  scan: number,
  flags: number,
  time: number,
  extraInfo: bigint
): Buffer {
  const buf = Buffer.alloc(24);
  buf.writeUInt16LE(vk, 0);
  buf.writeUInt16LE(scan, 2);
  buf.writeUInt32LE(flags, 4);
  buf.writeUInt32LE(time, 8);
  buf.writeBigUInt64LE(extraInfo, 16);
  return buf;
}

export function buildInputBuffer(type: number, inputBuf: Buffer): Buffer {
  const buf = Buffer.alloc(40);
  buf.writeUInt32LE(type, 0);
  inputBuf.copy(buf, 8);
  return buf;
}
