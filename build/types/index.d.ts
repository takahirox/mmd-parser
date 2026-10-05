import { CharsetEncoder } from './src/CharsetEncoder';
import { Parser } from './src/Parser';
declare var MMDParser: {
    CharsetEncoder: typeof CharsetEncoder;
    Parser: typeof Parser;
};
export { MMDParser, CharsetEncoder, Parser };
export type * from './src/Types';
