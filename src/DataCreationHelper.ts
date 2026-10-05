/**
 * @author takahiro / https://github.com/takahirox
 */

import type { Vector3, Quaternion } from './Types';

class DataCreationHelper {

	leftToRightVector3 ( v: Vector3 ) {

		v[ 2 ] = -v[ 2 ];

	}

	leftToRightQuaternion ( q: Quaternion ) {

		q[ 0 ] = -q[ 0 ];
		q[ 1 ] = -q[ 1 ];

	}

	leftToRightEuler ( r: Vector3 ) {

		r[ 0 ] = -r[ 0 ];
		r[ 1 ] = -r[ 1 ];

	}

	leftToRightIndexOrder ( p: Vector3 ) {

		var tmp = p[ 2 ];
		p[ 2 ] = p[ 0 ];
		p[ 0 ] = tmp;

	}

	leftToRightVector3Range ( v1: Vector3, v2: Vector3 ) {

		var tmp = -v2[ 2 ];
		v2[ 2 ] = -v1[ 2 ];
		v1[ 2 ] = tmp;

	}

	leftToRightEulerRange ( r1: Vector3, r2: Vector3 ) {

		var tmp1 = -r2[ 0 ];
		var tmp2 = -r2[ 1 ];
		r2[ 0 ] = -r1[ 0 ];
		r2[ 1 ] = -r1[ 1 ];
		r1[ 0 ] = tmp1;
		r1[ 1 ] = tmp2;

	}

}

export { DataCreationHelper }
