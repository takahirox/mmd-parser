/**
 * @author takahiro / https://github.com/takahirox
 */
import type { Vector3, Quaternion } from './Types';
declare class DataCreationHelper {
    leftToRightVector3(v: Vector3): void;
    leftToRightQuaternion(q: Quaternion): void;
    leftToRightEuler(r: Vector3): void;
    leftToRightIndexOrder(p: Vector3): void;
    leftToRightVector3Range(v1: Vector3, v2: Vector3): void;
    leftToRightEulerRange(r1: Vector3, r2: Vector3): void;
}
export { DataCreationHelper };
