import assert from 'node:assert/strict';
import { MMDParser, Parser, CharsetEncoder } from 'mmd-parser';
import * as api from 'mmd-parser';
import fixtures from './fixtures.js';
import checkAdditionalUv from './consumer-pmx.js';

assert(import.meta.resolve('mmd-parser').endsWith('/build/mmdparser.module.mjs'));
assert.deepEqual(Object.keys(api).sort(), ['CharsetEncoder', 'MMDParser', 'Parser']);
assert.equal(MMDParser.Parser, Parser);
assert.equal(MMDParser.CharsetEncoder, CharsetEncoder);
assert.equal(new CharsetEncoder().s2u(new Uint8Array([0x82, 0xa0])), 'あ');
const parser = new Parser();
assert.equal(parser.parsePmd(fixtures.pmd(false)).metadata.format, 'pmd');
assert.equal(parser.parsePmx(fixtures.pmx(1, 2)).metadata.format, 'pmx');
assert.equal(parser.parseVmd(fixtures.vmd()).metadata.motionCount, 1);
assert.equal(parser.parseVpd(fixtures.vpd).bones.length, 1);
checkAdditionalUv(Parser);
console.log('ESM package root: runtime exports and PMD/PMX/VMD/VPD parsing passed');
