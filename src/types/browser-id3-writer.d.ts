declare module 'browser-id3-writer' {
  export class ID3Writer {
    constructor(buffer: ArrayBuffer);
    setFrame(
      name: string,
      value: string | { description: string; value: string } | unknown
    ): ID3Writer;
    addTag(): void;
    getBlob(): Blob;
    getURL(): string;
  }
}
