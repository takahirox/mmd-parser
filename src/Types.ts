/** Public data shapes for the sections currently read by the parser. */
export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];
export type Quaternion = Vector4;
export type IndexSize = 1 | 2 | 4;
export type CoordinateSystem = 'left' | 'right';
export type FixedTuple<N extends number, T extends number[] = []> =
  T['length'] extends N ? T : FixedTuple<N, [...T, number]>;

export interface ModelMetadata {
  coordinateSystem: CoordinateSystem;
  magic: string;
  version: number;
  modelName: string;
  comment: string;
  vertexCount: number;
  faceCount: number;
  materialCount: number;
  boneCount: number;
  morphCount: number;
  rigidBodyCount: number;
  constraintCount: number;
}
export interface PmdMetadata extends ModelMetadata {
  format: 'pmd';
  ikCount: number;
  morphFrameCount: number;
  boneFrameNameCount: number;
  boneFrameCount: number;
  englishCompatibility: number;
  englishModelName?: string;
  englishComment?: string;
}
export interface PmxMetadata extends ModelMetadata {
  format: 'pmx';
  headerSize: number;
  encoding: number;
  additionalUvNum: number;
  vertexIndexSize: IndexSize;
  textureIndexSize: IndexSize;
  materialIndexSize: IndexSize;
  boneIndexSize: IndexSize;
  morphIndexSize: IndexSize;
  rigidBodyIndexSize: IndexSize;
  englishModelName: string;
  englishComment: string;
  textureCount: number;
  frameCount: number;
}
export type PmxHeader = Pick<PmxMetadata,
  'additionalUvNum' | 'vertexIndexSize' | 'textureIndexSize' | 'materialIndexSize' |
  'boneIndexSize' | 'morphIndexSize' | 'rigidBodyIndexSize'>;
export interface Vertex { position: Vector3; normal: Vector3; uv: Vector2; }
export interface PmdVertex extends Vertex {
  skinIndices: Vector2;
  skinWeights: Vector2;
  edgeFlag: number;
}
/** SDEF keeps the original type 1 fallback while requiring all three vectors. */
export interface PmxSdefData { skinC: Vector3; skinR0: Vector3; skinR1: Vector3; }
type NoSdefData = { skinC?: never; skinR0?: never; skinR1?: never };
export type PmxSkinning =
  | ({ type: 0; skinIndices: [number]; skinWeights: [number] } & NoSdefData)
  | ({ type: 1; skinIndices: Vector2; skinWeights: Vector2 } & (NoSdefData | PmxSdefData))
  | ({ type: 2; skinIndices: Vector4; skinWeights: Vector4 } & NoSdefData);
export type PmxVertex = Vertex & PmxSkinning & { auvs: Vector4[]; edgeRatio: number };
export interface Face { indices: Vector3; }
export interface PmdMaterial {
  diffuse: Vector4; shininess: number; specular: Vector3; ambient: Vector3;
  toonIndex: number; edgeFlag: number; faceCount: number; fileName: string;
}
export interface PmxMaterial {
  name: string; englishName: string; diffuse: Vector4; specular: Vector3;
  shininess: number; ambient: Vector3; flag: number; edgeColor: Vector4;
  edgeSize: number; textureIndex: number; envTextureIndex: number; envFlag: number;
  toonFlag: 0 | 1; toonIndex: number; comment: string; faceCount: number;
}
export interface PmdBone {
  name: string; parentIndex: number; tailIndex: number; type: number;
  ikIndex: number; position: Vector3;
}
export interface PmdIk {
  target: number; effector: number; linkCount: number; iteration: number;
  maxAngle: number; links: { index: number }[];
}
export interface PmxGrant {
  isLocal: boolean; affectRotation: boolean; affectPosition: boolean;
  parentIndex: number; ratio: number;
}
export interface PmxIkLink {
  index: number; angleLimitation: number;
  lowerLimitationAngle?: Vector3; upperLimitationAngle?: Vector3;
}
export interface PmxIk {
  effector: number; target: null; iteration: number; maxAngle: number;
  linkCount: number; links: PmxIkLink[];
}
export interface PmxBone {
  name: string; englishName: string; position: Vector3; parentIndex: number;
  transformationClass: number; flag: number; connectIndex?: number;
  offsetPosition?: Vector3; grant?: PmxGrant; fixAxis?: Vector3;
  localXVector?: Vector3; localZVector?: Vector3; key?: number; ik?: PmxIk;
}
export interface VertexMorphElement { index: number; position: Vector3; }
export interface BoneMorphElement extends VertexMorphElement { rotation: Quaternion; }
export interface MaterialMorphElement {
  index: number; type: number; diffuse: Vector4; specular: Vector3;
  shininess: number; ambient: Vector3; edgeColor: Vector4; edgeSize: number;
  textureColor: Vector4; sphereTextureColor: Vector4; toonColor: Vector4;
}
export interface PmdMorph {
  name: string; elementCount: number; type: number; elements: VertexMorphElement[];
}
export interface PmxMorphBase {
  name: string; englishName: string; panel: number; elementCount: number;
}
export type PmxVertexMorph = PmxMorphBase & { type: 1; elements: VertexMorphElement[] };
export type PmxMorph = PmxMorphBase & (
  | { type: 0; elements: { index: number; ratio: number }[] }
  | { type: 1; elements: VertexMorphElement[] }
  | { type: 2; elements: BoneMorphElement[] }
  | { type: 3; elements: { index: number; uv: Vector4 }[] }
  | { type: 4; elements: { index: number; uv: Vector4 }[] }
  | { type: 5; elements: { index: number; uv: Vector4 }[] }
  | { type: 6; elements: { index: number; uv: Vector4 }[] }
  | { type: 7; elements: { index: number; uv: Vector4 }[] }
  | { type: 8; elements: MaterialMorphElement[] }
  // Unsupported morphs retain their numeric type and produce no elements.
  | { type: number; elements: [] }
);
export interface PmxFrame {
  name: string; englishName: string; type: number; elementCount: number;
  elements: { target: number; index: number }[];
}
export interface RigidBody {
  name: string; boneIndex: number; groupIndex: number; groupTarget: number;
  shapeType: number; width: number; height: number; depth: number;
  position: Vector3; rotation: Vector3; weight: number; positionDamping: number;
  rotationDamping: number; restitution: number; friction: number; type: number;
}
export interface Constraint {
  name: string; rigidBodyIndex1: number; rigidBodyIndex2: number;
  position: Vector3; rotation: Vector3; translationLimitation1: Vector3;
  translationLimitation2: Vector3; rotationLimitation1: Vector3;
  rotationLimitation2: Vector3; springPosition: Vector3; springRotation: Vector3;
}
export interface Pmd {
  metadata: PmdMetadata; vertices: PmdVertex[]; faces: Face[];
  materials: PmdMaterial[]; bones: PmdBone[]; iks: PmdIk[]; morphs: PmdMorph[];
  morphFrames: { index: number }[]; boneFrameNames: { name: string }[];
  boneFrames: { boneIndex: number; frameIndex: number }[];
  englishBoneNames?: { name: string }[]; englishMorphNames?: { name: string }[];
  englishBoneFrameNames?: { name: string }[]; toonTextures: { fileName: string }[];
  rigidBodies: RigidBody[]; constraints: Constraint[];
}
export interface Pmx {
  metadata: PmxMetadata; vertices: PmxVertex[]; faces: Face[]; textures: string[];
  materials: PmxMaterial[]; bones: PmxBone[]; morphs: PmxMorph[]; frames: PmxFrame[];
  rigidBodies: (RigidBody & { englishName: string })[];
  constraints: (Constraint & { englishName: string; type: number })[];
}
export type Model = Pmd | Pmx;
export interface VmdMetadata {
  coordinateSystem: CoordinateSystem; magic?: string; name: string;
  motionCount: number; morphCount: number; cameraCount: number;
}
export interface VmdMotion {
  boneName: string; frameNum: number; position: Vector3; rotation: Quaternion;
  interpolation: FixedTuple<64>;
}
export interface VmdMorph { morphName: string; frameNum: number; weight: number; }
export interface VmdCamera {
  frameNum: number; distance: number; position: Vector3; rotation: Vector3;
  interpolation: FixedTuple<24>; fov: number; perspective: number;
}
export interface Vmd {
  metadata: VmdMetadata; motions: VmdMotion[]; morphs: VmdMorph[]; cameras: VmdCamera[];
}
export interface VpdBone { name: string; translation: Vector3; quaternion: Quaternion; }
export interface Vpd {
  metadata: { coordinateSystem: CoordinateSystem; parentFile: string; boneCount: number };
  bones: VpdBone[];
}
