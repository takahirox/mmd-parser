// Compile-only contracts: each expected error must actually be rejected by tsc.
import { MMDParser, Parser, CharsetEncoder } from '..';
import type { Pmd, Pmx, Vmd, Vpd, PmxVertex, PmxMorph, Vector2, Vector3, Quaternion, IndexSize } from '..';
import { DataViewEx } from '../build/types/src/DataViewEx';

const parser: Parser = new MMDParser.Parser();
const buffer = new ArrayBuffer(0);
const pmd: Pmd = parser.parsePmd(buffer);
const pmx: Pmx = parser.parsePmx(buffer, true);
const vmd: Vmd = parser.parseVmd(buffer);
const vpd: Vpd = parser.parseVpd('');
const merged: Vmd = parser.mergeVmds([vmd]);
parser.leftToRightModel(pmd);
parser.leftToRightModel(pmx);
parser.leftToRightVmd(merged);
parser.leftToRightVpd(vpd);
new CharsetEncoder().s2u(new Uint8Array(0));
const dv = new DataViewEx(buffer);
const indexSize: IndexSize = dv.getIndexSize();
const position: Vector3 = dv.getFloat32Array(3);
const uv: Vector2 = dv.getFloat32Array(2);
const quaternion: Quaternion = dv.getFloat32Array(4);
const indices: Vector3 = dv.getIndexArray(indexSize, 3, true);
const single: [number] = dv.getIndexArray(1, 1);
const interpolation: { length: 64 } = dv.getUint8Array(64);
const dynamic: number[] = dv.getFloat32Array(pmd.metadata.vertexCount);

const vertex: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1,
  type: 0, skinIndices: [1], skinWeights: [1] };
if (vertex.type === 0) {
  const oneIndex: [number] = vertex.skinIndices;
  // @ts-expect-error BDEF1 indices cannot be read as a pair.
  const twoIndices: Vector2 = vertex.skinIndices;
}
function morphPosition(morph: PmxMorph): Vector3 | undefined {
  if (morph.type === 1) {
    for (const element of morph.elements) return element.position;
  }
  return undefined;
}
const morph: PmxMorph = { name: '', englishName: '', panel: 0, elementCount: 1,
  type: 1, elements: [{ index: 0, position }] };
morphPosition(morph);

// @ts-expect-error A model result must include all of its sections.
const incomplete: Pmd = { metadata: pmd.metadata, vertices: [] };
// @ts-expect-error Vector3 has exactly three components.
const shortPosition: Vector3 = [1, 2];
// @ts-expect-error Quaternion has exactly four components.
const longQuaternion: Quaternion = [1, 2, 3, 4, 5];
// @ts-expect-error Binary indices use only 1, 2, or 4 bytes.
dv.getIndex(3);
// @ts-expect-error Ordinary binary data requires no tuple assertions.
const wrongTuple: Vector2 = dv.getFloat32Array(3);
// @ts-expect-error Skinning discriminator and tuple length must agree.
const wrongSkin: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1, type: 2, skinIndices: [0], skinWeights: [1] };
// @ts-expect-error Group morph elements require a ratio, not a position.
const wrongMorph: PmxMorph = { name: '', englishName: '', panel: 0, elementCount: 1, type: 0, elements: [{ index: 0, position }] };
// @ts-expect-error Coordinate state is a finite union.
pmd.metadata.coordinateSystem = 'other';
// @ts-expect-error The charset boundary accepts bytes, not text.
new CharsetEncoder().s2u('text');
// @ts-expect-error A merged VMD may lack magic; parsed fields remain optional here.
const magic: string = merged.metadata.magic;

// @ts-expect-error SDEF's retained vectors must be present together.
const partialSdef: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1, type: 1, skinIndices: [0, 1], skinWeights: [0.5, 0.5], skinC: position };
// @ts-expect-error SDEF fields only belong to the existing type 1 fallback.
const wrongSdefType: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1, type: 0, skinIndices: [0], skinWeights: [1], skinC: position, skinR0: position, skinR1: position };
