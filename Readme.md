# MMD Parser

mmd-parser parses MMD ArrayBuffer/Strings and generates Object.

## Contributing

See the [development flow](docs/development-flow.md) for Issue authoring, build and
test commands, and PR preparation, and the [review guidelines](docs/review-guidelines.md)
for review, merge, and Issue closure guidance for contributors and AI agents.


## Browser

### How to use
```
<script src="./build/mmdparser.js"></script>
<script>
  var parser = new MMDParser.Parser();

  function load (url, responseType, mimeType, onLoad, onProgress, onError) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.addEventListener('load', function (event) {
      var response = event.target.response;
      if (this.status === 200) {
        onLoad(response);
      } else if (this.status === 0) {
        console.warn('HTTP Status 0 received.');
        onLoad(response);
      } else {
        console.warn('HTTP Status ' + this.status + ' received.');
        onError(event);
      }
    }, false);
    if (onProgress !== undefined) request.addEventListener('progress', onProgress, false);
    if (onError !== undefined) request.addEventListener('error', onError, false);
    request.responseType = responseType;
    if (mimeType !== undefined) request.overrideMimeType(mimeType)
    request.send(null);
    console.log('downloading: ' + url);
  }

  function testPmd () {
    console.log('PMD parse test');
    load(
      'https://raw.githubusercontent.com/mrdoob/three.js/2898f5b1ba10b1e94174c0a62d072f5f7b80442c/examples/models/mmd/miku/miku_v2.pmd',
      'arraybuffer',
      undefined,
      function (buffer) {
        var pmd = parser.parsePmd(buffer);
        console.log(pmd);
      }
    );
  }

  testPmd();
</script>
```

### methods
* MMDParser.Parser
  * parsePmd(buffer, leftToRight)
  * parsePmx(buffer, leftToRight)
  * parseVmd(buffer, leftToRight)
  * parseVpd(text, leftToRight)
  * mergeVmds(vmds)
  * leftToRightModel(model)
  * leftToRightVmd(vmd)
  * leftToRightVpd(vpd)


## NPM

### How to install
```
$ npm install mmd-parser
```

### How to build
```
$ npm install
$ npm run build-uglify
$ npm run typecheck
$ npm run test:offline
```

The maintained source is `index.ts` and `src/*.ts`. TypeScript runs with
`strict` and `noUncheckedIndexedAccess`; `npm run typecheck` checks the source
and compile-only public type contracts. `npm run build` compiles to an ignored
`.typescript-tmp/compiled/` directory, bundles the UMD and ES module outputs, and
writes declarations to `build/types/`. `build-uglify` also regenerates the
minified browser bundle. `npm run dev` watches TypeScript and rebuilds the bundles
and declarations after each successful compilation.

The offline tests use small synthetic PMD, PMX, VMD, and VPD fixtures with
assertions against all three rebuilt bundles and a browser global smoke check.
They cover the parser's currently supported sections; they do not establish
support for additional PMX features. `npm test` retains the original sample
smoke script, which downloads real PMD, VMD, and VPD samples from
`raw.githubusercontent.com`, pinned to Three.js r171 commit
`2898f5b1ba10b1e94174c0a62d072f5f7b80442c`, as in
[three-mmd-loader](https://github.com/takahirox/three-mmd-loader/blob/main/examples/README.md#assets-and-credits).
It requires network access and does not exercise PMX. `npm run all` runs the
build, type checks, offline tests, and this sample script in sequence.

### How to load
```
require('mmd-parser');
```


### TypeScript

The existing exports and runtime methods are unchanged. Declarations are resolved
through the package's `types` entry; parser results and nested records can be
imported as types:

```ts
import { MMDParser, Parser, CharsetEncoder } from 'mmd-parser';
import type { Pmd, Pmx, Vmd, Vpd, Vector3 } from 'mmd-parser';

const parser = new Parser(); // also new MMDParser.Parser()
const model: Pmd = parser.parsePmd(buffer, true); // buffer is an ArrayBuffer
const position: Vector3 | undefined = model.vertices[0]?.position;
```

The types describe existing runtime behavior: English PMD fields are optional,
merged VMD metadata omits `magic`, and coordinate state is `left` or `right`.
PMX skinning and supported morphs use variant records and fixed tuples. SDEF
continues to return type 1 with its extra vectors; unsupported morph types retain
empty element arrays. Existing PMX text decoding and version checks are preserved.


## Copyright

The sample assets have separate terms and are not covered by this package's MIT
license. Consult the pinned Three.js
[asset license summary](https://github.com/mrdoob/three.js/blob/2898f5b1ba10b1e94174c0a62d072f5f7b80442c/examples/models/mmd/Readme.txt)
and each author's original archive and notices before using them. Downloading
these samples does not grant redistribution or commercial-use rights.

- Miku v2 model: bundled MikuMikuDance model (MMD / Yu Higuchi), modeled by
  Animasa; character © Crypton Future Media.
  [Model notice](https://github.com/mrdoob/three.js/blob/2898f5b1ba10b1e94174c0a62d072f5f7b80442c/examples/models/mmd/miku/readme_miku_v2.txt).
- WAVEFILE dance: hino.
  [Motion notice](https://github.com/mrdoob/three.js/blob/2898f5b1ba10b1e94174c0a62d072f5f7b80442c/examples/models/mmd/vmds/readme_wavefile.txt).
- Shooting poses: KEITEL.
  [Pose notice](https://github.com/mrdoob/three.js/blob/2898f5b1ba10b1e94174c0a62d072f5f7b80442c/examples/models/mmd/vpds/readme.txt).

You are allowed to use Crypton's Vocaloid(Hatsune Miku, Kagamine Rin, and so on)
stuffs (MMD models, songs, and so on) only if you follow the guideline set by
Crypton Future Media, INC. for the usage of its characters.

For detail, see http://piapro.net/en_for_creators.html
