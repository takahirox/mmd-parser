/** @author takahiro / https://github.com/takahirox */
import { DataViewEx } from './DataViewEx';
import { DataCreationHelper } from './DataCreationHelper';
import type {
  Pmd, PmdMetadata, PmdVertex, PmdMaterial, PmdBone, PmdIk, PmdMorph,
  Pmx, PmxHeader, PmxVertex, PmxSkinning, PmxMaterial, PmxBone, PmxIk,
  PmxIkLink, PmxMorph, PmxFrame, Face, RigidBody, Constraint,
  Model, Vmd, VmdMotion, VmdMorph, VmdCamera, Vpd, VpdBone, Vector3, Quaternion
} from './Types';

/** Keep the original count-driven loops, including fractional face counts. */
function readRecords<T> ( count: number, read: () => T ): T[] {
  const records: T[] = [];
  for ( let i = 0; i < count; i++ ) records.push( read() );
  return records;
}

/** A checked boundary for arrays/text; noUncheckedIndexedAccess stays enabled. */
function at<T> ( values: readonly T[], index: number ): T {
  const value = values[index];
  if ( value === undefined ) throw new RangeError( 'Missing value at index ' + index );
  return value;
}

function readPmdFace ( dv: DataViewEx ): Face {
	return {
		indices: dv.getUint16Array( 3 ),
	};
}

function readPmdMaterial ( dv: DataViewEx ): PmdMaterial {
	return {
		diffuse: dv.getFloat32Array( 4 ),
		shininess: dv.getFloat32(),
		specular: dv.getFloat32Array( 3 ),
		ambient: dv.getFloat32Array( 3 ),
		toonIndex: dv.getInt8(),
		edgeFlag: dv.getUint8(),
		faceCount: dv.getUint32() / 3,
		fileName: dv.getSjisStringsAsUnicode( 20 ),
	};
}

function readPmdBone ( dv: DataViewEx ): PmdBone {
	return {
		name: dv.getSjisStringsAsUnicode( 20 ),
		parentIndex: dv.getInt16(),
		tailIndex: dv.getInt16(),
		type: dv.getUint8(),
		ikIndex: dv.getInt16(),
		position: dv.getFloat32Array( 3 ),
	};
}

function readPmdRigidBody ( dv: DataViewEx ): RigidBody {
	return {
		name: dv.getSjisStringsAsUnicode( 20 ),
		boneIndex: dv.getInt16(),
		groupIndex: dv.getUint8(),
		groupTarget: dv.getUint16(),
		shapeType: dv.getUint8(),
		width: dv.getFloat32(),
		height: dv.getFloat32(),
		depth: dv.getFloat32(),
		position: dv.getFloat32Array( 3 ),
		rotation: dv.getFloat32Array( 3 ),
		weight: dv.getFloat32(),
		positionDamping: dv.getFloat32(),
		rotationDamping: dv.getFloat32(),
		restitution: dv.getFloat32(),
		friction: dv.getFloat32(),
		type: dv.getUint8(),
	};
}

function readPmdConstraint ( dv: DataViewEx ): Constraint {
	return {
		name: dv.getSjisStringsAsUnicode( 20 ),
		rigidBodyIndex1: dv.getUint32(),
		rigidBodyIndex2: dv.getUint32(),
		position: dv.getFloat32Array( 3 ),
		rotation: dv.getFloat32Array( 3 ),
		translationLimitation1: dv.getFloat32Array( 3 ),
		translationLimitation2: dv.getFloat32Array( 3 ),
		rotationLimitation1: dv.getFloat32Array( 3 ),
		rotationLimitation2: dv.getFloat32Array( 3 ),
		springPosition: dv.getFloat32Array( 3 ),
		springRotation: dv.getFloat32Array( 3 ),
	};
}

function readPmxFace ( dv: DataViewEx, metadata: PmxHeader ): Face {
	return {
		indices: dv.getIndexArray( metadata.vertexIndexSize, 3, true ),
	};
}

function readPmxRigidBody ( dv: DataViewEx, metadata: PmxHeader ): RigidBody & { englishName: string } {
	return {
		name: dv.getTextBuffer(),
		englishName: dv.getTextBuffer(),
		boneIndex: dv.getIndex( metadata.boneIndexSize ),
		groupIndex: dv.getUint8(),
		groupTarget: dv.getUint16(),
		shapeType: dv.getUint8(),
		width: dv.getFloat32(),
		height: dv.getFloat32(),
		depth: dv.getFloat32(),
		position: dv.getFloat32Array( 3 ),
		rotation: dv.getFloat32Array( 3 ),
		weight: dv.getFloat32(),
		positionDamping: dv.getFloat32(),
		rotationDamping: dv.getFloat32(),
		restitution: dv.getFloat32(),
		friction: dv.getFloat32(),
		type: dv.getUint8(),
	};
}

function readPmxConstraint ( dv: DataViewEx, metadata: PmxHeader ): Constraint & { englishName: string; type: number } {
	return {
		name: dv.getTextBuffer(),
		englishName: dv.getTextBuffer(),
		type: dv.getUint8(),
		rigidBodyIndex1: dv.getIndex( metadata.rigidBodyIndexSize ),
		rigidBodyIndex2: dv.getIndex( metadata.rigidBodyIndexSize ),
		position: dv.getFloat32Array( 3 ),
		rotation: dv.getFloat32Array( 3 ),
		translationLimitation1: dv.getFloat32Array( 3 ),
		translationLimitation2: dv.getFloat32Array( 3 ),
		rotationLimitation1: dv.getFloat32Array( 3 ),
		rotationLimitation2: dv.getFloat32Array( 3 ),
		springPosition: dv.getFloat32Array( 3 ),
		springRotation: dv.getFloat32Array( 3 ),
	};
}

function readVmdMotion ( dv: DataViewEx ): VmdMotion {
	return {
		boneName: dv.getSjisStringsAsUnicode( 15 ),
		frameNum: dv.getUint32(),
		position: dv.getFloat32Array( 3 ),
		rotation: dv.getFloat32Array( 4 ),
		interpolation: dv.getUint8Array( 64 ),
	};
}

function readVmdMorph ( dv: DataViewEx ): VmdMorph {
	return {
		morphName: dv.getSjisStringsAsUnicode( 15 ),
		frameNum: dv.getUint32(),
		weight: dv.getFloat32(),
	};
}

function readVmdCamera ( dv: DataViewEx ): VmdCamera {
	return {
		frameNum: dv.getUint32(),
		distance: dv.getFloat32(),
		position: dv.getFloat32Array( 3 ),
		rotation: dv.getFloat32Array( 3 ),
		interpolation: dv.getUint8Array( 24 ),
		fov: dv.getUint32(),
		perspective: dv.getUint8(),
	};
}

function readPmdVertex ( dv: DataViewEx ): PmdVertex {
  const position = dv.getFloat32Array( 3 );
  const normal = dv.getFloat32Array( 3 );
  const uv = dv.getFloat32Array( 2 );
  const skinIndices = dv.getUint16Array( 2 );
  const weight = dv.getUint8() / 100;
  return { position, normal, uv, skinIndices, skinWeights: [weight, 1 - weight], edgeFlag: dv.getUint8() };
}

function readPmdIk ( dv: DataViewEx ): PmdIk {
  const target = dv.getUint16();
  const effector = dv.getUint16();
  const linkCount = dv.getUint8();
  const iteration = dv.getUint16();
  const maxAngle = dv.getFloat32();
  const links = readRecords( linkCount, () => ({ index: dv.getUint16() }) );
  return { target, effector, linkCount, iteration, maxAngle, links };
}

function readPmdMorph ( dv: DataViewEx ): PmdMorph {
  const name = dv.getSjisStringsAsUnicode( 20 );
  const elementCount = dv.getUint32();
  const type = dv.getUint8();
  const elements = readRecords( elementCount, () => ({ index: dv.getUint32(), position: dv.getFloat32Array( 3 ) }) );
  return { name, elementCount, type, elements };
}

function readPmxVertex ( dv: DataViewEx, metadata: PmxHeader ): PmxVertex {
  const position = dv.getFloat32Array( 3 );
  const normal = dv.getFloat32Array( 3 );
  const uv = dv.getFloat32Array( 2 );
  const auvs = readRecords( metadata.additionalUvNum, () => dv.getFloat32Array( 4 ) );
  const type = dv.getUint8();
  const indexSize = metadata.boneIndexSize;
  const base = { position, normal, uv, auvs };
  let skinning: PmxSkinning;
  switch ( type ) {
    case 0:
      skinning = { type, skinIndices: dv.getIndexArray( indexSize, 1 ), skinWeights: [1] };
      break;
    case 1: {
      const skinIndices = dv.getIndexArray( indexSize, 2 );
      const weight = dv.getFloat32();
      skinning = { type, skinIndices, skinWeights: [weight, 1 - weight] };
      break;
    }
    case 2:
      skinning = { type, skinIndices: dv.getIndexArray( indexSize, 4 ), skinWeights: dv.getFloat32Array( 4 ) };
      break;
    case 3: {
      const skinIndices = dv.getIndexArray( indexSize, 2 );
      const weight = dv.getFloat32();
      // Preserve SDEF's existing BDEF2 fallback and the extra vectors.
      const skinC = dv.getFloat32Array( 3 );
      const skinR0 = dv.getFloat32Array( 3 );
      const skinR1 = dv.getFloat32Array( 3 );
      return { ...base, type: 1, skinIndices, skinWeights: [weight, 1 - weight],
        skinC, skinR0, skinR1, edgeRatio: dv.getFloat32() };
    }
    default:
      throw 'unsupport bone type ' + type + ' exception.';
  }
  return { ...base, ...skinning, edgeRatio: dv.getFloat32() };
}

function readPmxMaterial ( dv: DataViewEx, metadata: PmxHeader ): PmxMaterial {
  const base = {
    name: dv.getTextBuffer(), englishName: dv.getTextBuffer(),
    diffuse: dv.getFloat32Array( 4 ), specular: dv.getFloat32Array( 3 ),
    shininess: dv.getFloat32(), ambient: dv.getFloat32Array( 3 ),
    flag: dv.getUint8(), edgeColor: dv.getFloat32Array( 4 ), edgeSize: dv.getFloat32(),
    textureIndex: dv.getIndex( metadata.textureIndexSize ),
    envTextureIndex: dv.getIndex( metadata.textureIndexSize ), envFlag: dv.getUint8()
  };
  const toonFlag = dv.getUint8();
  let toonIndex: number;
  if ( toonFlag === 0 ) toonIndex = dv.getIndex( metadata.textureIndexSize );
  else if ( toonFlag === 1 ) toonIndex = dv.getInt8();
  else throw 'unknown toon flag ' + toonFlag + ' exception.';
  return { ...base, toonFlag, toonIndex, comment: dv.getTextBuffer(), faceCount: dv.getUint32() / 3 };
}

function readPmxIkLink ( dv: DataViewEx, metadata: PmxHeader ): PmxIkLink {
  const index = dv.getIndex( metadata.boneIndexSize );
  const angleLimitation = dv.getUint8();
  if ( angleLimitation === 1 ) {
    return { index, angleLimitation, lowerLimitationAngle: dv.getFloat32Array( 3 ),
      upperLimitationAngle: dv.getFloat32Array( 3 ) };
  }
  return { index, angleLimitation };
}

function readPmxIk ( dv: DataViewEx, metadata: PmxHeader ): PmxIk {
  const effector = dv.getIndex( metadata.boneIndexSize );
  const iteration = dv.getUint32();
  const maxAngle = dv.getFloat32();
  const linkCount = dv.getUint32();
  const links = readRecords( linkCount, () => readPmxIkLink( dv, metadata ) );
  return { effector, target: null, iteration, maxAngle, linkCount, links };
}

function readPmxBone ( dv: DataViewEx, metadata: PmxHeader ): PmxBone {
  const base = {
    name: dv.getTextBuffer(), englishName: dv.getTextBuffer(), position: dv.getFloat32Array( 3 ),
    parentIndex: dv.getIndex( metadata.boneIndexSize ), transformationClass: dv.getUint32(), flag: dv.getUint16()
  };
  const flag = base.flag;
  const connection = ( flag & 0x1 )
    ? { connectIndex: dv.getIndex( metadata.boneIndexSize ) }
    : { offsetPosition: dv.getFloat32Array( 3 ) };
  const grant = ( flag & 0x100 || flag & 0x200 ) ? {
    grant: {
      isLocal: ( flag & 0x80 ) !== 0, affectRotation: ( flag & 0x100 ) !== 0,
      affectPosition: ( flag & 0x200 ) !== 0,
      parentIndex: dv.getIndex( metadata.boneIndexSize ), ratio: dv.getFloat32()
    }
  } : {};
  const axis = ( flag & 0x400 ) ? { fixAxis: dv.getFloat32Array( 3 ) } : {};
  const local = ( flag & 0x800 ) ? { localXVector: dv.getFloat32Array( 3 ), localZVector: dv.getFloat32Array( 3 ) } : {};
  const key = ( flag & 0x2000 ) ? { key: dv.getUint32() } : {};
  const ik = ( flag & 0x20 ) ? { ik: readPmxIk( dv, metadata ) } : {};
  return { ...base, ...connection, ...grant, ...axis, ...local, ...key, ...ik };
}

function readPmxMorph ( dv: DataViewEx, metadata: PmxHeader ): PmxMorph {
  const name = dv.getTextBuffer();
  const englishName = dv.getTextBuffer();
  const panel = dv.getUint8();
  const type = dv.getUint8();
  const elementCount = dv.getUint32();
  const base = { name, englishName, panel, elementCount };
  switch ( type ) {
    case 0:
      return { ...base, type, elements: readRecords( elementCount, () => ({
        index: dv.getIndex( metadata.morphIndexSize ), ratio: dv.getFloat32()
      }) ) };
    case 1:
      return { ...base, type, elements: readRecords( elementCount, () => ({
        index: dv.getIndex( metadata.vertexIndexSize, true ), position: dv.getFloat32Array( 3 )
      }) ) };
    case 2:
      return { ...base, type, elements: readRecords( elementCount, () => ({
        index: dv.getIndex( metadata.boneIndexSize ), position: dv.getFloat32Array( 3 ), rotation: dv.getFloat32Array( 4 )
      }) ) };
    case 3:
      return { ...base, type, elements: readRecords( elementCount, () => ({
        index: dv.getIndex( metadata.vertexIndexSize, true ), uv: dv.getFloat32Array( 4 )
      }) ) };
    case 8:
      return { ...base, type, elements: readRecords( elementCount, () => ({
        index: dv.getIndex( metadata.materialIndexSize ), type: dv.getUint8(),
        diffuse: dv.getFloat32Array( 4 ), specular: dv.getFloat32Array( 3 ),
        shininess: dv.getFloat32(), ambient: dv.getFloat32Array( 3 ),
        edgeColor: dv.getFloat32Array( 4 ), edgeSize: dv.getFloat32(),
        textureColor: dv.getFloat32Array( 4 ), sphereTextureColor: dv.getFloat32Array( 4 ),
        toonColor: dv.getFloat32Array( 4 )
      }) ) };
    default:
      // Additional UV and other unsupported morphs consume no element bytes,
      // matching the existing parser; this migration does not add support.
      return { ...base, type, elements: [] };
  }
}

function readPmxFrame ( dv: DataViewEx, metadata: PmxHeader ): PmxFrame {
  const name = dv.getTextBuffer();
  const englishName = dv.getTextBuffer();
  const type = dv.getUint8();
  const elementCount = dv.getUint32();
  const elements = readRecords( elementCount, () => {
    const target = dv.getUint8();
    const index = dv.getIndex( target === 0 ? metadata.boneIndexSize : metadata.morphIndexSize );
    return { target, index };
  } );
  return { name, englishName, type, elementCount, elements };
}

export class Parser {
  parsePmd ( buffer: ArrayBuffer, leftToRight?: boolean ): Pmd {
    const dv = new DataViewEx( buffer );
    const magic = dv.getChars( 3 );
    if ( magic !== 'Pmd' ) throw 'PMD file magic is not Pmd, but ' + magic;
    const version = dv.getFloat32();
    const modelName = dv.getSjisStringsAsUnicode( 20 );
    const comment = dv.getSjisStringsAsUnicode( 256 );
    const vertexCount = dv.getUint32();
    const vertices = readRecords( vertexCount, () => readPmdVertex( dv ) );
    const faceCount = dv.getUint32() / 3;
    const faces = readRecords( faceCount, () => readPmdFace( dv ) );
    const materialCount = dv.getUint32();
    const materials = readRecords( materialCount, () => readPmdMaterial( dv ) );
    const boneCount = dv.getUint16();
    const bones = readRecords( boneCount, () => readPmdBone( dv ) );
    const ikCount = dv.getUint16();
    const iks = readRecords( ikCount, () => readPmdIk( dv ) );
    const morphCount = dv.getUint16();
    const morphs = readRecords( morphCount, () => readPmdMorph( dv ) );
    const morphFrameCount = dv.getUint8();
    const morphFrames = readRecords( morphFrameCount, () => ({ index: dv.getUint16() }) );
    const boneFrameNameCount = dv.getUint8();
    const boneFrameNames = readRecords( boneFrameNameCount, () => ({ name: dv.getSjisStringsAsUnicode( 50 ) }) );
    const boneFrameCount = dv.getUint32();
    const boneFrames = readRecords( boneFrameCount, () => ({ boneIndex: dv.getInt16(), frameIndex: dv.getUint8() }) );
    const englishCompatibility = dv.getUint8();
    const englishHeader = englishCompatibility > 0
      ? { englishModelName: dv.getSjisStringsAsUnicode( 20 ), englishComment: dv.getSjisStringsAsUnicode( 256 ) } : {};
    const englishNames = englishCompatibility === 0 ? {} : {
      englishBoneNames: readRecords( boneCount, () => ({ name: dv.getSjisStringsAsUnicode( 20 ) }) ),
      englishMorphNames: readRecords( morphCount - 1, () => ({ name: dv.getSjisStringsAsUnicode( 20 ) }) ),
      englishBoneFrameNames: readRecords( boneFrameNameCount, () => ({ name: dv.getSjisStringsAsUnicode( 50 ) }) )
    };
    const toonTextures = readRecords( 10, () => ({ fileName: dv.getSjisStringsAsUnicode( 100 ) }) );
    const rigidBodyCount = dv.getUint32();
    const rigidBodies = readRecords( rigidBodyCount, () => readPmdRigidBody( dv ) );
    const constraintCount = dv.getUint32();
    const constraints = readRecords( constraintCount, () => readPmdConstraint( dv ) );
    const metadata: PmdMetadata = { format: 'pmd', coordinateSystem: 'left', magic, version,
      modelName, comment, vertexCount, faceCount, materialCount, boneCount, ikCount,
      morphCount, morphFrameCount, boneFrameNameCount, boneFrameCount, englishCompatibility,
      ...englishHeader, rigidBodyCount, constraintCount };
    const pmd: Pmd = { metadata, vertices, faces, materials, bones, iks, morphs, morphFrames,
      boneFrameNames, boneFrames, ...englishNames, toonTextures, rigidBodies, constraints };
    if ( leftToRight === true ) this.leftToRightModel( pmd );
    return pmd;
  }

  parsePmx ( buffer: ArrayBuffer, leftToRight?: boolean ): Pmx {
    const dv = new DataViewEx( buffer );
    const magic = dv.getChars( 4 );
    if ( magic !== 'PMX ' ) throw 'PMX file magic is not PMX , but ' + magic;
    const version = dv.getFloat32();
    if ( version !== 2.0 && version !== 2.1 ) throw 'PMX version ' + version + ' is not supported.';
    const header = {
      magic, version, headerSize: dv.getUint8(), encoding: dv.getUint8(), additionalUvNum: dv.getUint8(),
      vertexIndexSize: dv.getIndexSize(), textureIndexSize: dv.getIndexSize(),
      materialIndexSize: dv.getIndexSize(), boneIndexSize: dv.getIndexSize(),
      morphIndexSize: dv.getIndexSize(), rigidBodyIndexSize: dv.getIndexSize(),
      modelName: dv.getTextBuffer(), englishModelName: dv.getTextBuffer(),
      comment: dv.getTextBuffer(), englishComment: dv.getTextBuffer()
    };
    // Readers need only the header. Counts are collected as sections are read,
    // then the complete metadata/result are constructed below.
    const vertexCount = dv.getUint32();
    const vertices = readRecords( vertexCount, () => readPmxVertex( dv, header ) );
    const faceCount = dv.getUint32() / 3;
    const faces = readRecords( faceCount, () => readPmxFace( dv, header ) );
    const textureCount = dv.getUint32();
    const textures = readRecords( textureCount, () => dv.getTextBuffer() );
    const materialCount = dv.getUint32();
    const materials = readRecords( materialCount, () => readPmxMaterial( dv, header ) );
    const boneCount = dv.getUint32();
    const bones = readRecords( boneCount, () => readPmxBone( dv, header ) );
    const morphCount = dv.getUint32();
    const morphs = readRecords( morphCount, () => readPmxMorph( dv, header ) );
    const frameCount = dv.getUint32();
    const frames = readRecords( frameCount, () => readPmxFrame( dv, header ) );
    const rigidBodyCount = dv.getUint32();
    const rigidBodies = readRecords( rigidBodyCount, () => readPmxRigidBody( dv, header ) );
    const constraintCount = dv.getUint32();
    const constraints = readRecords( constraintCount, () => readPmxConstraint( dv, header ) );
    const pmx: Pmx = { metadata: { format: 'pmx', coordinateSystem: 'left', ...header,
      vertexCount, faceCount, textureCount, materialCount, boneCount, morphCount,
      frameCount, rigidBodyCount, constraintCount }, vertices, faces, textures,
      materials, bones, morphs, frames, rigidBodies, constraints };
    if ( leftToRight === true ) this.leftToRightModel( pmx );
    return pmx;
  }

  parseVmd ( buffer: ArrayBuffer, leftToRight?: boolean ): Vmd {
    const dv = new DataViewEx( buffer );
    const magic = dv.getChars( 30 );
    if ( magic !== 'Vocaloid Motion Data 0002' ) throw 'VMD file magic is not Vocaloid Motion Data 0002, but ' + magic;
    const name = dv.getSjisStringsAsUnicode( 20 );
    const motionCount = dv.getUint32();
    const motions = readRecords( motionCount, () => readVmdMotion( dv ) );
    const morphCount = dv.getUint32();
    const morphs = readRecords( morphCount, () => readVmdMorph( dv ) );
    const cameraCount = dv.getUint32();
    const cameras = readRecords( cameraCount, () => readVmdCamera( dv ) );
    const vmd: Vmd = { metadata: { coordinateSystem: 'left', magic, name, motionCount, morphCount, cameraCount },
      motions, morphs, cameras };
    if ( leftToRight === true ) this.leftToRightVmd( vmd );
    return vmd;
  }

  parseVpd ( text: string, leftToRight?: boolean ): Vpd {
    const commentPatternG = /\/\/\w*(\r|\n|\r\n)/g;
    const lines = text.replace( commentPatternG, '' ).split( /\r|\n|\r\n/ );
    function throwError (): never { throw 'the file seems not vpd file.'; }
    if ( lines[0] !== 'Vocaloid Pose Data file' || lines.length < 4 ) throwError();
    const parentFile = at( lines, 2 );
    const boneCount = parseInt( at( lines, 3 ) );
    const boneHeaderPattern = /^\s*(Bone[0-9]+)\s*\{\s*(.*)$/;
    const boneVectorPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
    const boneQuaternionPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
    const boneFooterPattern = /^\s*}/;
    const bones: VpdBone[] = [];
    let name: string | null = null;
    let translation: Vector3 | null = null;
    let quaternion: Quaternion | null = null;
    for ( let i = 4; i < lines.length; i++ ) {
      const line = at( lines, i );
      const header = line.match( boneHeaderPattern );
      if ( header !== null ) {
        if ( name !== null ) throwError();
        name = at( header, 2 );
      }
      const vector = line.match( boneVectorPattern );
      if ( vector !== null ) {
        if ( translation !== null ) throwError();
        translation = [parseFloat( at( vector, 1 ) ), parseFloat( at( vector, 2 ) ), parseFloat( at( vector, 3 ) )];
      }
      const rotation = line.match( boneQuaternionPattern );
      if ( rotation !== null ) {
        if ( quaternion !== null ) throwError();
        quaternion = [parseFloat( at( rotation, 1 ) ), parseFloat( at( rotation, 2 ) ),
          parseFloat( at( rotation, 3 ) ), parseFloat( at( rotation, 4 ) )];
      }
      if ( line.match( boneFooterPattern ) !== null ) {
        if ( name === null || translation === null || quaternion === null ) throwError();
        bones.push( { name, translation, quaternion } );
        name = null;
        translation = null;
        quaternion = null;
      }
    }
    if ( name !== null || translation !== null || quaternion !== null ) throwError();
    const vpd: Vpd = { metadata: { coordinateSystem: 'left', parentFile, boneCount }, bones };
    if ( leftToRight === true ) this.leftToRightVpd( vpd );
    return vpd;
  }

  mergeVmds ( vmds: readonly Vmd[] ): Vmd {
    const first = at( vmds, 0 );
    const v: Vmd = { metadata: { name: first.metadata.name,
      coordinateSystem: first.metadata.coordinateSystem, motionCount: 0, morphCount: 0, cameraCount: 0 },
      motions: [], morphs: [], cameras: [] };
    for ( const v2 of vmds ) {
      v.metadata.motionCount += v2.metadata.motionCount;
      v.metadata.morphCount += v2.metadata.morphCount;
      v.metadata.cameraCount += v2.metadata.cameraCount;
      for ( let j = 0; j < v2.metadata.motionCount; j++ ) v.motions.push( at( v2.motions, j ) );
      for ( let j = 0; j < v2.metadata.morphCount; j++ ) v.morphs.push( at( v2.morphs, j ) );
      for ( let j = 0; j < v2.metadata.cameraCount; j++ ) v.cameras.push( at( v2.cameras, j ) );
    }
    return v;
  }

  leftToRightModel ( model: Model ): void {
    if ( model.metadata.coordinateSystem === 'right' ) return;
    model.metadata.coordinateSystem = 'right';
    const helper = new DataCreationHelper();
    for ( let i = 0; i < model.metadata.vertexCount; i++ ) {
      const vertex = at<PmdVertex | PmxVertex>( model.vertices, i );
      helper.leftToRightVector3( vertex.position );
      helper.leftToRightVector3( vertex.normal );
    }
    for ( let i = 0; i < model.metadata.faceCount; i++ ) helper.leftToRightIndexOrder( at( model.faces, i ).indices );
    for ( let i = 0; i < model.metadata.boneCount; i++ ) helper.leftToRightVector3( at<PmdBone | PmxBone>( model.bones, i ).position );
    // Preserve the existing conversion of only vertex morphs for PMX.
    if ( isPmxModel( model ) ) {
      for ( let i = 0; i < model.metadata.morphCount; i++ ) {
        const morph = at( model.morphs, i );
        if ( morph.type === 1 ) {
          for ( const element of morph.elements ) helper.leftToRightVector3( element.position );
        }
      }
    } else {
      for ( let i = 0; i < model.metadata.morphCount; i++ ) {
        for ( const element of at( model.morphs, i ).elements ) helper.leftToRightVector3( element.position );
      }
    }
    for ( let i = 0; i < model.metadata.rigidBodyCount; i++ ) {
      const body = at( model.rigidBodies, i );
      helper.leftToRightVector3( body.position );
      helper.leftToRightEuler( body.rotation );
    }
    for ( let i = 0; i < model.metadata.constraintCount; i++ ) {
      const constraint = at( model.constraints, i );
      helper.leftToRightVector3( constraint.position );
      helper.leftToRightEuler( constraint.rotation );
      helper.leftToRightVector3Range( constraint.translationLimitation1, constraint.translationLimitation2 );
      helper.leftToRightEulerRange( constraint.rotationLimitation1, constraint.rotationLimitation2 );
    }
  }

  leftToRightVmd ( vmd: Vmd ): void {
    if ( vmd.metadata.coordinateSystem === 'right' ) return;
    vmd.metadata.coordinateSystem = 'right';
    const helper = new DataCreationHelper();
    for ( let i = 0; i < vmd.metadata.motionCount; i++ ) {
      const motion = at( vmd.motions, i );
      helper.leftToRightVector3( motion.position );
      helper.leftToRightQuaternion( motion.rotation );
    }
    for ( let i = 0; i < vmd.metadata.cameraCount; i++ ) {
      const camera = at( vmd.cameras, i );
      helper.leftToRightVector3( camera.position );
      helper.leftToRightEuler( camera.rotation );
    }
  }

  leftToRightVpd ( vpd: Vpd ): void {
    if ( vpd.metadata.coordinateSystem === 'right' ) return;
    vpd.metadata.coordinateSystem = 'right';
    const helper = new DataCreationHelper();
    for ( const bone of vpd.bones ) {
      helper.leftToRightVector3( bone.translation );
      helper.leftToRightQuaternion( bone.quaternion );
    }
  }
}

function isPmxModel ( model: Model ): model is Pmx {
  return model.metadata.format === 'pmx';
}
