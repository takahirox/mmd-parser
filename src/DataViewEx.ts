/**
 * @author takahiro / https://github.com/takahirox
 */

import { CharsetEncoder } from './CharsetEncoder';

import type { IndexSize, FixedTuple, Vector2, Vector3, Vector4 } from './Types';

class DataViewEx {
	dv: DataView;
	offset: number;
	littleEndian: boolean;
	encoder: CharsetEncoder;

	constructor ( buffer: ArrayBuffer, littleEndian = true ) {
		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = littleEndian;
		this.encoder = new CharsetEncoder();
	}

	getInt8 () {

		var value = this.dv.getInt8( this.offset );
		this.offset += 1;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getInt8Array ( size: 1 ): [number];
	getInt8Array ( size: 2 ): Vector2;
	getInt8Array ( size: 3 ): Vector3;
	getInt8Array ( size: 4 ): Vector4;
	getInt8Array ( size: 24 ): FixedTuple<24>;
	getInt8Array ( size: 64 ): FixedTuple<64>;
	getInt8Array ( size: number ): number[];
	getInt8Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getInt8() );

		}

		return a;

	}

	getUint8 () {

		var value = this.dv.getUint8( this.offset );
		this.offset += 1;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getUint8Array ( size: 1 ): [number];
	getUint8Array ( size: 2 ): Vector2;
	getUint8Array ( size: 3 ): Vector3;
	getUint8Array ( size: 4 ): Vector4;
	getUint8Array ( size: 24 ): FixedTuple<24>;
	getUint8Array ( size: 64 ): FixedTuple<64>;
	getUint8Array ( size: number ): number[];
	getUint8Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getUint8() );

		}

		return a;

	}


	getInt16 () {

		var value = this.dv.getInt16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getInt16Array ( size: 1 ): [number];
	getInt16Array ( size: 2 ): Vector2;
	getInt16Array ( size: 3 ): Vector3;
	getInt16Array ( size: 4 ): Vector4;
	getInt16Array ( size: 24 ): FixedTuple<24>;
	getInt16Array ( size: 64 ): FixedTuple<64>;
	getInt16Array ( size: number ): number[];
	getInt16Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getInt16() );

		}

		return a;

	}

	getUint16 () {

		var value = this.dv.getUint16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getUint16Array ( size: 1 ): [number];
	getUint16Array ( size: 2 ): Vector2;
	getUint16Array ( size: 3 ): Vector3;
	getUint16Array ( size: 4 ): Vector4;
	getUint16Array ( size: 24 ): FixedTuple<24>;
	getUint16Array ( size: 64 ): FixedTuple<64>;
	getUint16Array ( size: number ): number[];
	getUint16Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getUint16() );

		}

		return a;

	}

	getInt32 () {

		var value = this.dv.getInt32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getInt32Array ( size: 1 ): [number];
	getInt32Array ( size: 2 ): Vector2;
	getInt32Array ( size: 3 ): Vector3;
	getInt32Array ( size: 4 ): Vector4;
	getInt32Array ( size: 24 ): FixedTuple<24>;
	getInt32Array ( size: 64 ): FixedTuple<64>;
	getInt32Array ( size: number ): number[];
	getInt32Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getInt32() );

		}

		return a;

	}

	getUint32 () {

		var value = this.dv.getUint32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getUint32Array ( size: 1 ): [number];
	getUint32Array ( size: 2 ): Vector2;
	getUint32Array ( size: 3 ): Vector3;
	getUint32Array ( size: 4 ): Vector4;
	getUint32Array ( size: 24 ): FixedTuple<24>;
	getUint32Array ( size: 64 ): FixedTuple<64>;
	getUint32Array ( size: number ): number[];
	getUint32Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getUint32() );

		}

		return a;

	}

	getFloat32 () {

		var value = this.dv.getFloat32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getFloat32Array ( size: 1 ): [number];
	getFloat32Array ( size: 2 ): Vector2;
	getFloat32Array ( size: 3 ): Vector3;
	getFloat32Array ( size: 4 ): Vector4;
	getFloat32Array ( size: 24 ): FixedTuple<24>;
	getFloat32Array ( size: 64 ): FixedTuple<64>;
	getFloat32Array ( size: number ): number[];
	getFloat32Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getFloat32() );

		}

		return a;

	}

	getFloat64 () {

		var value = this.dv.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getFloat64Array ( size: 1 ): [number];
	getFloat64Array ( size: 2 ): Vector2;
	getFloat64Array ( size: 3 ): Vector3;
	getFloat64Array ( size: 4 ): Vector4;
	getFloat64Array ( size: 24 ): FixedTuple<24>;
	getFloat64Array ( size: 64 ): FixedTuple<64>;
	getFloat64Array ( size: number ): number[];
	getFloat64Array ( size: number ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getFloat64() );

		}

		return a;

	}

	getIndexSize (): IndexSize {
		const size = this.getUint8();
		if ( size === 1 || size === 2 || size === 4 ) return size;
		throw 'unknown number type ' + size + ' exception.';
	}

	getIndex ( type: IndexSize, isUnsigned = false ) {

		switch ( type ) {

			case 1:
				return ( isUnsigned === true ) ? this.getUint8() : this.getInt8();

			case 2:
				return ( isUnsigned === true ) ? this.getUint16() : this.getInt16();

			case 4:
				return this.getInt32(); // No Uint32

			default:
				throw 'unknown number type ' + type + ' exception.';

		}

	}

	// The loop below reads exactly size values; literal sizes expose fixed tuples.
	getIndexArray ( type: IndexSize, size: 1, isUnsigned?: boolean ): [number];
	getIndexArray ( type: IndexSize, size: 2, isUnsigned?: boolean ): Vector2;
	getIndexArray ( type: IndexSize, size: 3, isUnsigned?: boolean ): Vector3;
	getIndexArray ( type: IndexSize, size: 4, isUnsigned?: boolean ): Vector4;
	getIndexArray ( type: IndexSize, size: 24, isUnsigned?: boolean ): FixedTuple<24>;
	getIndexArray ( type: IndexSize, size: 64, isUnsigned?: boolean ): FixedTuple<64>;
	getIndexArray ( type: IndexSize, size: number, isUnsigned?: boolean ): number[];
	getIndexArray ( type: IndexSize, size: number, isUnsigned = false ) {

		var a = [];

		for ( var i = 0; i < size; i++ ) {

			a.push( this.getIndex( type, isUnsigned ) );

		}

		return a;

	}

	getChars ( size: number ) {

		var str = '';

		while ( size > 0 ) {

			var value = this.getUint8();
			size--;

			if ( value === 0 ) {

				break;

			}

			str += String.fromCharCode( value );

		}

		while ( size > 0 ) {

			this.getUint8();
			size--;

		}

		return str;

	}

	getSjisStringsAsUnicode ( size: number ) {

		var a = [];

		while ( size > 0 ) {

			var value = this.getUint8();
			size--;

			if ( value === 0 ) {

				break;

			}

			a.push( value );

		}

		while ( size > 0 ) {

			this.getUint8();
			size--;

		}

		return this.encoder.s2u( new Uint8Array( a ) );

	}

	getUnicodeStrings ( size: number ) {

		var str = '';

		while ( size > 0 ) {

			var value = this.getUint16();
			size -= 2;

			if ( value === 0 ) {

				break;

			}

			str += String.fromCharCode( value );

		}

		while ( size > 0 ) {

			this.getUint8();
			size--;

		}

		return str;

	}

	getTextBuffer () {

		var size = this.getUint32();
		return this.getUnicodeStrings( size );

	}

}

export { DataViewEx };
