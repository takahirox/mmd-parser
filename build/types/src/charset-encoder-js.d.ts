/** Narrow declaration of the published charset-encoder-js 1.x API. */
declare module 'charset-encoder-js' {
  export class CharsetEncoder {
    s2u(bytes: Uint8Array): string;
    s2uTable: { [code: number]: number | undefined };
  }
}
