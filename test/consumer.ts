import { MMDParser, Parser, CharsetEncoder } from 'mmd-parser';
import type { Pmd, Pmx, Vmd, Vpd, PmxVertex, PmxMorph, Vector2, Vector3, Quaternion } from 'mmd-parser';

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

// Bone morph offsets retain their typed, weight-independent payload in the package.
function checkBoneMorph(morph: PmxMorph): void {
  if (morph.type === 2) {
    for (const element of morph.elements) {
      const index: number = element.index;
      const translation: Vector3 = element.position;
      const rotation: Quaternion = element.rotation;
      // @ts-expect-error Bone offsets have no morph weight or group ratio.
      const ratio: number = element.ratio;
    }
  }
}
pmx.morphs.forEach(checkBoneMorph);
const boneMorph: Extract<PmxMorph, { type: 2 }> = { name: 'bone', englishName: '', panel: 1,
  type: 2, elementCount: 1, elements: [{ index: 1, position: [1, 2, 3], rotation: [0.125, -0.25, 0.5, 0.75] }] };
// @ts-expect-error Bone morph offsets require both translation and rotation.
const missingBoneRotation: PmxMorph = { ...boneMorph, elements: [{ index: 0, position: [1, 2, 3] }] };
// @ts-expect-error Bone morph quaternions have exactly four components.
const shortBoneRotation: PmxMorph = { ...boneMorph, elements: [{ index: 0, position: [1, 2, 3], rotation: [1, 2, 3] }] };

// Confirm the installed declarations enforce types rather than resolving to any.
// @ts-expect-error Binary parsers require an ArrayBuffer.
parser.parsePmd('invalid');
// @ts-expect-error Result fields retain their declared types.
const count: string = pmd.metadata.vertexCount;
// @ts-expect-error Coordinate state is a finite union.
pmx.metadata.coordinateSystem = 'other';

// Narrowing the installed discriminated union exposes required SDEF tuples.
function checkSkinning(vertex: PmxVertex): void {
  if (vertex.type === 3) {
    const indices: Vector2 = vertex.skinIndices;
    const weights: Vector2 = vertex.skinWeights;
    const c: Vector3 = vertex.skinC;
    const r0: Vector3 = vertex.skinR0;
    const r1: Vector3 = vertex.skinR1;
  } else if (vertex.type === 1) {
    // @ts-expect-error BDEF2 does not expose an SDEF vector.
    const c: Vector3 = vertex.skinC;
  }
}
pmx.vertices.forEach(checkSkinning);
const sdef: Extract<PmxVertex, { type: 3 }> = { position: [1, 2, 3], normal: [0, 1, 2],
  uv: [0, 0], auvs: [], edgeRatio: 1, type: 3, skinIndices: [0, 1], skinWeights: [0.25, 0.75],
  skinC: [1, 2, 3], skinR0: [4, 5, 6], skinR1: [7, 8, 9] };
// @ts-expect-error The type 1 compatibility fallback is no longer accepted.
const bdef2WithSdef: PmxVertex = { ...sdef, type: 1 };
// @ts-expect-error SDEF vectors have exactly three components.
const shortSdefVector: PmxVertex = { ...sdef, skinC: [1, 2] };
// @ts-expect-error SDEF requires both bone indices.
const shortSdefIndices: PmxVertex = { ...sdef, skinIndices: [0] };
// @ts-expect-error SDEF requires both weights.
const shortSdefWeights: PmxVertex = { ...sdef, skinWeights: [1] };
// @ts-expect-error SDEF requires all three vectors.
const incompleteSdef: PmxVertex = { position: [1, 2, 3], normal: [0, 1, 2], uv: [0, 0], auvs: [],
  edgeRatio: 1, type: 3, skinIndices: [0, 1], skinWeights: [0.25, 0.75] };
