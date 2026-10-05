import { MMDParser, Parser, CharsetEncoder } from 'mmd-parser';
import type { Pmd, Pmx, Vmd, Vpd, Vector3 } from 'mmd-parser';

const parser: Parser = new MMDParser.Parser();
const buffer = new ArrayBuffer(0);
const pmd: Pmd = parser.parsePmd(buffer);
const pmx: Pmx = parser.parsePmx(buffer, true);
const vmd: Vmd = parser.parseVmd(buffer);
const vpd: Vpd = parser.parseVpd('');
const position: Vector3 | undefined = pmd.vertices[0]?.position;
parser.leftToRightModel(pmx);
parser.leftToRightVmd(parser.mergeVmds([vmd]));
parser.leftToRightVpd(vpd);
new Parser();
const decoded: string = new CharsetEncoder().s2u(new Uint8Array(0));

// Confirm the installed declarations enforce types rather than resolving to any.
// @ts-expect-error Binary parsers require an ArrayBuffer.
parser.parsePmd('invalid');
// @ts-expect-error Result fields retain their declared types.
const count: string = pmd.metadata.vertexCount;
// @ts-expect-error Coordinate state is a finite union.
pmx.metadata.coordinateSystem = 'other';
