import type { Pmd, Pmx, Model, Vmd, Vpd } from './Types';
export declare class Parser {
    parsePmd(buffer: ArrayBuffer, leftToRight?: boolean): Pmd;
    parsePmx(buffer: ArrayBuffer, leftToRight?: boolean): Pmx;
    parseVmd(buffer: ArrayBuffer, leftToRight?: boolean): Vmd;
    parseVpd(text: string, leftToRight?: boolean): Vpd;
    mergeVmds(vmds: readonly Vmd[]): Vmd;
    leftToRightModel(model: Model): void;
    leftToRightVmd(vmd: Vmd): void;
    leftToRightVpd(vpd: Vpd): void;
}
