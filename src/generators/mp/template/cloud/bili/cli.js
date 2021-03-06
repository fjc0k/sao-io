#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('path');
require('module');
require('fs');
var __chunk_1 = require('./chunk-3e94d73e.js');
var __chunk_2 = require('./chunk-46c9fc75.js');
require('events');
var crypto = _interopDefault(require('crypto'));
var vm = _interopDefault(require('vm'));
var os = _interopDefault(require('os'));

var v8CompileCache = __chunk_2.createCommonjsModule(function (module) {








const hasOwnProperty = Object.prototype.hasOwnProperty;

//------------------------------------------------------------------------------
// FileSystemBlobStore
//------------------------------------------------------------------------------

class FileSystemBlobStore {
  constructor(directory, prefix) {
    const name = prefix ? slashEscape(prefix + '.') : '';
    this._blobFilename = __chunk_1.path.join(directory, name + 'BLOB');
    this._mapFilename = __chunk_1.path.join(directory, name + 'MAP');
    this._lockFilename = __chunk_1.path.join(directory, name + 'LOCK');
    this._directory = directory;
    this._load();
  }

  has(key, invalidationKey) {
    if (hasOwnProperty.call(this._memoryBlobs, key)) {
      return this._invalidationKeys[key] === invalidationKey;
    } else if (hasOwnProperty.call(this._storedMap, key)) {
      return this._storedMap[key][0] === invalidationKey;
    }
    return false;
  }

  get(key, invalidationKey) {
    if (hasOwnProperty.call(this._memoryBlobs, key)) {
      if (this._invalidationKeys[key] === invalidationKey) {
        return this._memoryBlobs[key];
      }
    } else if (hasOwnProperty.call(this._storedMap, key)) {
      const mapping = this._storedMap[key];
      if (mapping[0] === invalidationKey) {
        return this._storedBlob.slice(mapping[1], mapping[2]);
      }
    }
  }

  set(key, invalidationKey, buffer) {
    this._invalidationKeys[key] = invalidationKey;
    this._memoryBlobs[key] = buffer;
    this._dirty = true;
  }

  delete(key) {
    if (hasOwnProperty.call(this._memoryBlobs, key)) {
      this._dirty = true;
      delete this._memoryBlobs[key];
    }
    if (hasOwnProperty.call(this._invalidationKeys, key)) {
      this._dirty = true;
      delete this._invalidationKeys[key];
    }
    if (hasOwnProperty.call(this._storedMap, key)) {
      this._dirty = true;
      delete this._storedMap[key];
    }
  }

  isDirty() {
    return this._dirty;
  }

  save() {
    const dump = this._getDump();
    const blobToStore = Buffer.concat(dump[0]);
    const mapToStore = JSON.stringify(dump[1]);

    try {
      mkdirpSync(this._directory);
      __chunk_2.fs.writeFileSync(this._lockFilename, 'LOCK', {flag: 'wx'});
    } catch (error) {
      // Swallow the exception if we fail to acquire the lock.
      return false;
    }

    try {
      __chunk_2.fs.writeFileSync(this._blobFilename, blobToStore);
      __chunk_2.fs.writeFileSync(this._mapFilename, mapToStore);
    } catch (error) {
      throw error;
    } finally {
      __chunk_2.fs.unlinkSync(this._lockFilename);
    }

    return true;
  }

  _load() {
    try {
      this._storedBlob = __chunk_2.fs.readFileSync(this._blobFilename);
      this._storedMap = JSON.parse(__chunk_2.fs.readFileSync(this._mapFilename));
    } catch (e) {
      this._storedBlob = Buffer.alloc(0);
      this._storedMap = {};
    }
    this._dirty = false;
    this._memoryBlobs = {};
    this._invalidationKeys = {};
  }

  _getDump() {
    const buffers = [];
    const newMap = {};
    let offset = 0;

    function push(key, invalidationKey, buffer) {
      buffers.push(buffer);
      newMap[key] = [invalidationKey, offset, offset + buffer.length];
      offset += buffer.length;
    }

    for (const key of Object.keys(this._memoryBlobs)) {
      const buffer = this._memoryBlobs[key];
      const invalidationKey = this._invalidationKeys[key];
      push(key, invalidationKey, buffer);
    }

    for (const key of Object.keys(this._storedMap)) {
      if (hasOwnProperty.call(newMap, key)) continue;
      const mapping = this._storedMap[key];
      const buffer = this._storedBlob.slice(mapping[1], mapping[2]);
      push(key, mapping[0], buffer);
    }

    return [buffers, newMap];
  }
}

//------------------------------------------------------------------------------
// NativeCompileCache
//------------------------------------------------------------------------------

class NativeCompileCache {
  constructor() {
    this._cacheStore = null;
    this._previousModuleCompile = null;
  }

  setCacheStore(cacheStore) {
    this._cacheStore = cacheStore;
  }

  install() {
    const self = this;
    this._previousModuleCompile = __chunk_1.require$$0.prototype._compile;
    __chunk_1.require$$0.prototype._compile = function(content, filename) {
      const mod = this;
      function require(id) {
        return mod.require(id);
      }
      require.resolve = function(request, options) {
        return __chunk_1.require$$0._resolveFilename(request, mod, false, options);
      };
      require.main = process.mainModule;

      // Enable support to add extra extension types
      require.extensions = __chunk_1.require$$0._extensions;
      require.cache = __chunk_1.require$$0._cache;

      const dirname = __chunk_1.path.dirname(filename);

      const compiledWrapper = self._moduleCompile(filename, content);

      // We skip the debugger setup because by the time we run, node has already
      // done that itself.

      const args = [mod.exports, require, mod, filename, dirname, process, __chunk_2.commonjsGlobal];
      return compiledWrapper.apply(mod.exports, args);
    };
  }

  uninstall() {
    __chunk_1.require$$0.prototype._compile = this._previousModuleCompile;
  }

  _moduleCompile(filename, content) {
    // https://github.com/nodejs/node/blob/v7.5.0/lib/module.js#L511

    // Remove shebang
    var contLen = content.length;
    if (contLen >= 2) {
      if (content.charCodeAt(0) === 35/*#*/ &&
          content.charCodeAt(1) === 33/*!*/) {
        if (contLen === 2) {
          // Exact match
          content = '';
        } else {
          // Find end of shebang line and slice it off
          var i = 2;
          for (; i < contLen; ++i) {
            var code = content.charCodeAt(i);
            if (code === 10/*\n*/ || code === 13/*\r*/) break;
          }
          if (i === contLen) {
            content = '';
          } else {
            // Note that this actually includes the newline character(s) in the
            // new output. This duplicates the behavior of the regular
            // expression that was previously used to replace the shebang line
            content = content.slice(i);
          }
        }
      }
    }

    // create wrapper function
    var wrapper = __chunk_1.require$$0.wrap(content);

    var invalidationKey = crypto
      .createHash('sha1')
      .update(content, 'utf8')
      .digest('hex');

    var buffer = this._cacheStore.get(filename, invalidationKey);

    var script = new vm.Script(wrapper, {
      filename: filename,
      lineOffset: 0,
      displayErrors: true,
      cachedData: buffer,
      produceCachedData: true,
    });

    if (script.cachedDataProduced) {
      this._cacheStore.set(filename, invalidationKey, script.cachedData);
    } else if (script.cachedDataRejected) {
      this._cacheStore.delete(filename);
    }

    var compiledWrapper = script.runInThisContext({
      filename: filename,
      lineOffset: 0,
      columnOffset: 0,
      displayErrors: true,
    });

    return compiledWrapper;
  }
}

//------------------------------------------------------------------------------
// utilities
//
// https://github.com/substack/node-mkdirp/blob/f2003bb/index.js#L55-L98
// https://github.com/zertosh/slash-escape/blob/e7ebb99/slash-escape.js
//------------------------------------------------------------------------------

function mkdirpSync(p_) {
  _mkdirpSync(__chunk_1.path.resolve(p_), parseInt('0777', 8) & ~process.umask());
}

function _mkdirpSync(p, mode) {
  try {
    __chunk_2.fs.mkdirSync(p, mode);
  } catch (err0) {
    if (err0.code === 'ENOENT') {
      _mkdirpSync(__chunk_1.path.dirname(p));
      _mkdirpSync(p);
    } else {
      try {
        const stat = __chunk_2.fs.statSync(p);
        if (!stat.isDirectory()) { throw err0; }
      } catch (err1) {
        throw err0;
      }
    }
  }
}

function slashEscape(str) {
  const ESCAPE_LOOKUP = {
    '\\': 'zB',
    ':': 'zC',
    '/': 'zS',
    '\x00': 'z0',
    'z': 'zZ',
  };
  return str.replace(/[\\:\/\x00z]/g, match => (ESCAPE_LOOKUP[match]));
}

function supportsCachedData() {
  const script = new vm.Script('""', {produceCachedData: true});
  // chakracore, as of v1.7.1.0, returns `false`.
  return script.cachedDataProduced === true;
}

function getCacheDir() {
  // Avoid cache ownership issues on POSIX systems.
  const dirname = typeof process.getuid === 'function'
    ? 'v8-compile-cache-' + process.getuid()
    : 'v8-compile-cache';
  const version = typeof process.versions.v8 === 'string'
    ? process.versions.v8
    : typeof process.versions.chakracore === 'string'
      ? 'chakracore-' + process.versions.chakracore
      : 'node-' + process.version;
  const cacheDir = __chunk_1.path.join(os.tmpdir(), dirname, version);
  return cacheDir;
}

function getParentName() {
  // `module.parent.filename` is undefined or null when:
  //    * node -e 'require("v8-compile-cache")'
  //    * node -r 'v8-compile-cache'
  //    * Or, requiring from the REPL.
  const parentName = module.parent && typeof module.parent.filename === 'string'
    ? module.parent.filename
    : process.cwd();
  return parentName;
}

//------------------------------------------------------------------------------
// main
//------------------------------------------------------------------------------

if (!process.env.DISABLE_V8_COMPILE_CACHE && supportsCachedData()) {
  const cacheDir = getCacheDir();
  const prefix = getParentName();
  const blobStore = new FileSystemBlobStore(cacheDir, prefix);

  const nativeCompileCache = new NativeCompileCache();
  nativeCompileCache.setCacheStore(blobStore);
  nativeCompileCache.install();

  process.once('exit', code => {
    if (blobStore.isDirty()) {
      blobStore.save();
    }
    nativeCompileCache.uninstall();
  });
}

module.exports.__TEST__ = {
  FileSystemBlobStore,
  NativeCompileCache,
  mkdirpSync,
  slashEscape,
  supportsCachedData,
  getCacheDir,
  getParentName,
};
});
var v8CompileCache_1 = v8CompileCache.__TEST__;

var dist = __chunk_2.createCommonjsModule(function (module) {

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var events$$1 = _interopDefault(__chunk_1.require$$1);
var path$$1 = _interopDefault(__chunk_1.path);

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof __chunk_2.commonjsGlobal !== 'undefined' ? __chunk_2.commonjsGlobal : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

const EQQ = /\s|=/;
const FLAG = /^-{1,2}/;
const PREFIX = /^--no-/i;

function isBool(any) {
	return typeof any === 'boolean';
}

function toArr(any) {
	return Array.isArray(any) ? any : any == null ? [] : [any];
}

function toString(any) {
	return any == null || any === true ? '' : String(any);
}

function toBool(any) {
	return any === 'false' ? false : Boolean(any);
}

function toNum(any) {
	let x = Number(any);
	return !isBool(any) && (x * 0 === 0) ? x : any;
}

function getAlibi(names, arr) {
	if (arr.length === 0) return arr;
	let k, i = 0, len = arr.length, vals = [];
	for (; i < len; i++) {
		k = arr[i];
		vals.push(k);
		if (names[k] !== void 0) {
			vals = vals.concat(names[k]);
		}
	}
	return vals;
}

function typecast(key, val, strings, booleans) {
	if (strings.indexOf(key) !== -1) return toString(val);
	if (booleans.indexOf(key) !== -1) return toBool(val);
	return toNum(val);
}

var lib = function(args, opts) {
	args = args || [];
	opts = opts || {};

	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	const aliases = {};
	let k, i, j, x, y, len, type;

	if (opts.alias !== void 0) {
		for (k in opts.alias) {
			aliases[k] = toArr(opts.alias[k]);
			len = aliases[k].length; // save length
			for (i = 0; i < len; i++) {
				x = aliases[k][i]; // alias's key name
				aliases[x] = [k]; // set initial array
				for (j = 0; j < len; j++) {
					if (x !== aliases[k][j]) {
						aliases[x].push(aliases[k][j]);
					}
				}
			}
		}
	}

	if (opts.default !== void 0) {
		for (k in opts.default) {
			type = typeof opts.default[k];
			opts[type] = (opts[type] || []).concat(k);
		}
	}

	// apply to all aliases
	opts.string = getAlibi(aliases, opts.string);
	opts.boolean = getAlibi(aliases, opts.boolean);

	let idx = 0;
	const out = { _: [] };

	while (args[idx] !== void 0) {
		let incr = 1;
		const val = args[idx];

		if (val === '--') {
			out._ = out._.concat(args.slice(idx + 1));
			break;
		} else if (!FLAG.test(val)) {
			out._.push(val);
		} else if (PREFIX.test(val)) {
			out[val.replace(PREFIX, '')] = false;
		} else {
			let tmp;
			const segs = val.split(EQQ);
			const isGroup = segs[0].charCodeAt(1) !== 45; // '-'

			const flag = segs[0].substr(isGroup ? 1 : 2);
			len = flag.length;
			const key = isGroup ? flag[len - 1] : flag;

			if (opts.unknown !== void 0 && aliases[key] === void 0) {
				return opts.unknown(segs[0]);
			}

			if (segs.length > 1) {
				tmp = segs[1];
			} else {
				tmp = args[idx + 1] || true;
				FLAG.test(tmp) ? (tmp = true) : (incr = 2);
			}

			if (isGroup && len > 1) {
				for (i = len - 1; i--; ) {
					k = flag[i]; // all but last key
					out[k] = typecast(k, true, opts.string, opts.boolean);
				}
			}

			const value = typecast(key, tmp, opts.string, opts.boolean);
			out[key] = out[key] !== void 0 ? toArr(out[key]).concat(value) : value;

			// handle discarded args when dealing with booleans
			if (isBool(value) && !isBool(tmp) && tmp !== 'true' && tmp !== 'false') {
				out._.push(tmp);
			}
		}

		idx += incr;
	}

	if (opts.default !== void 0) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	for (k in out) {
		if (aliases[k] === void 0) continue;
		y = out[k];
		len = aliases[k].length;
		for (i = 0; i < len; i++) {
			out[aliases[k][i]] = y; // assign value
		}
	}

	return out;
};

var utils = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBrackets = (v) => v.replace(/[<[].+/, '').trim();
exports.findAllBrackets = (v) => {
    const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
    const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
    const res = [];
    const parse = (match) => {
        let variadic = false;
        let value = match[1];
        if (value.startsWith('...')) {
            value = value.slice(3);
            variadic = true;
        }
        return {
            required: match[0].startsWith('<'),
            value,
            variadic
        };
    };
    let angledMatch;
    while ((angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v))) {
        res.push(parse(angledMatch));
    }
    let squareMatch;
    while ((squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v))) {
        res.push(parse(squareMatch));
    }
    return res;
};
exports.getMriOptions = (options) => {
    const result = { alias: {}, boolean: [] };
    for (const [index, option] of options.entries()) {
        // We do not set default values in mri options
        // Since its type (typeof) will be used to cast parsed arguments.
        // Which mean `--foo foo` will be parsed as `{foo: true}` if we have `{default:{foo: true}}`
        // Set alias
        if (option.names.length > 1) {
            result.alias[option.names[0]] = option.names.slice(1);
        }
        // Set boolean
        if (option.isBoolean) {
            if (option.negated) {
                // For negated option
                // We only set it to `boolean` type when there's no string-type option with the same name
                const hasStringTypeOption = options.some((o, i) => {
                    return (i !== index &&
                        o.names.some(name => option.names.includes(name)) &&
                        typeof o.required === 'boolean');
                });
                if (!hasStringTypeOption) {
                    result.boolean.push(option.names[0]);
                }
            }
            else {
                result.boolean.push(option.names[0]);
            }
        }
    }
    return result;
};
exports.findLongest = (arr) => {
    return arr.sort((a, b) => {
        return a.length > b.length ? -1 : 1;
    })[0];
};
exports.padRight = (str, length) => {
    return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`;
};
exports.camelcase = (input) => {
    return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
        return p1 + p2.toUpperCase();
    });
};
exports.setDotProp = (obj, keys, val) => {
    let i = 0;
    let length = keys.length;
    let t = obj;
    let x;
    for (; i < length; ++i) {
        x = t[keys[i]];
        t = t[keys[i]] =
            i === length - 1
                ? val
                : x != null
                    ? x
                    : !!~keys[i + 1].indexOf('.') || !(+keys[i + 1] > -1)
                        ? {}
                        : [];
    }
};
exports.setByType = (obj, transforms) => {
    for (const key of Object.keys(transforms)) {
        const transform = transforms[key];
        if (transform.shouldTransform) {
            obj[key] = Array.prototype.concat.call([], obj[key]);
            if (typeof transform.transformFunction === 'function') {
                obj[key] = obj[key].map(transform.transformFunction);
            }
        }
    }
};
});

unwrapExports(utils);
var utils_1 = utils.removeBrackets;
var utils_2 = utils.findAllBrackets;
var utils_3 = utils.getMriOptions;
var utils_4 = utils.findLongest;
var utils_5 = utils.padRight;
var utils_6 = utils.camelcase;
var utils_7 = utils.setDotProp;
var utils_8 = utils.setByType;

var Option_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class Option {
    constructor(rawName, description, config) {
        this.rawName = rawName;
        this.description = description;
        this.config = Object.assign({}, config);
        // You may use cli.option('--env.* [value]', 'desc') to denote a dot-nested option
        rawName = rawName.replace(/\.\*/g, '');
        this.negated = false;
        this.names = utils.removeBrackets(rawName)
            .split(',')
            .map((v) => {
            let name = v.trim().replace(/^-{1,2}/, '');
            if (name.startsWith('no-')) {
                this.negated = true;
                name = name.replace(/^no-/, '');
            }
            return name;
        })
            .sort((a, b) => (a.length > b.length ? 1 : -1)); // Sort names
        // Use the longese name (last one) as actual option name
        this.name = this.names[this.names.length - 1];
        if (this.negated) {
            this.config.default = true;
        }
        if (rawName.includes('<')) {
            this.required = true;
        }
        else if (rawName.includes('[')) {
            this.required = false;
        }
        else {
            // No arg needed, it's boolean flag
            this.isBoolean = true;
        }
    }
}
exports.default = Option;
});

unwrapExports(Option_1);

var Command_1 = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Option_1$$1 = __importDefault(Option_1);

class Command {
    constructor(rawName, description, config = {}, cli) {
        this.rawName = rawName;
        this.description = description;
        this.config = config;
        this.cli = cli;
        this.options = [];
        this.aliasNames = [];
        this.name = utils.removeBrackets(rawName);
        this.args = utils.findAllBrackets(rawName);
        this.examples = [];
    }
    usage(text) {
        this.usageText = text;
        return this;
    }
    allowUnknownOptions() {
        this.config.allowUnknownOptions = true;
        return this;
    }
    ignoreOptionDefaultValue() {
        this.config.ignoreOptionDefaultValue = true;
        return this;
    }
    version(version, customFlags = '-v, --version') {
        this.versionNumber = version;
        this.option(customFlags, 'Display version number');
        return this;
    }
    example(example) {
        this.examples.push(example);
        return this;
    }
    /**
     * Add a option for this command
     * @param rawName Raw option name(s)
     * @param description Option description
     * @param config Option config
     */
    option(rawName, description, config) {
        const option = new Option_1$$1.default(rawName, description, config);
        this.options.push(option);
        return this;
    }
    alias(name) {
        this.aliasNames.push(name);
        return this;
    }
    action(callback) {
        this.commandAction = callback;
        return this;
    }
    /**
     * Check if a command name is matched by this command
     * @param name Command name
     */
    isMatched(name) {
        return this.name === name || this.aliasNames.includes(name);
    }
    get isDefaultCommand() {
        return this.name === '' || this.aliasNames.includes('!');
    }
    get isGlobalCommand() {
        return this instanceof GlobalCommand;
    }
    /**
     * Check if an option is registered in this command
     * @param name Option name
     */
    hasOption(name) {
        name = name.split('.')[0];
        return this.options.find(option => {
            return option.names.includes(name);
        });
    }
    outputHelp() {
        const { name, commands } = this.cli;
        const { versionNumber, options: globalOptions, helpCallback } = this.cli.globalCommand;
        const sections = [
            {
                body: `${name}${versionNumber ? ` v${versionNumber}` : ''}`
            }
        ];
        sections.push({
            title: 'Usage',
            body: `  $ ${name} ${this.usageText || this.rawName}`
        });
        const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
        if (showCommands) {
            const longestCommandName = utils.findLongest(commands.map(command => command.rawName));
            sections.push({
                title: 'Commands',
                body: commands
                    .map(command => {
                    return `  ${utils.padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
                })
                    .join('\n')
            });
            sections.push({
                title: `For more info, run any command with the \`--help\` flag`,
                body: commands
                    .map(command => `  $ ${name}${command.name === '' ? '' : ` ${command.name}`} --help`)
                    .join('\n')
            });
        }
        const options = this.isGlobalCommand
            ? globalOptions
            : [...this.options, ...(globalOptions || [])];
        if (options.length > 0) {
            const longestOptionName = utils.findLongest(options.map(option => option.rawName));
            sections.push({
                title: 'Options',
                body: options
                    .map(option => {
                    return `  ${utils.padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === undefined
                        ? ''
                        : `(default: ${option.config.default})`}`;
                })
                    .join('\n')
            });
        }
        if (this.examples.length > 0) {
            sections.push({
                title: 'Examples',
                body: this.examples
                    .map(example => {
                    if (typeof example === 'function') {
                        return example(name);
                    }
                    return example;
                })
                    .join('\n')
            });
        }
        if (helpCallback) {
            helpCallback(sections);
        }
        console.log(sections
            .map(section => {
            return section.title
                ? `${section.title}:\n${section.body}`
                : section.body;
        })
            .join('\n\n'));
        process.exit(0);
    }
    outputVersion() {
        const { name } = this.cli;
        const { versionNumber } = this.cli.globalCommand;
        if (versionNumber) {
            console.log(`${name}/${versionNumber} ${process.platform}-${process.arch} node-${process.version}`);
        }
        process.exit(0);
    }
    checkRequiredArgs() {
        const minimalArgsCount = this.args.filter(arg => arg.required).length;
        if (this.cli.args.length < minimalArgsCount) {
            console.error(`error: missing required args for command \`${this.rawName}\``);
            process.exit(1);
        }
    }
    /**
     * Check if the parsed options contain any unknown options
     *
     * Exit and output error when true
     */
    checkUnknownOptions() {
        const { rawOptions, globalCommand } = this.cli;
        if (!this.config.allowUnknownOptions) {
            for (const name of Object.keys(rawOptions)) {
                if (name !== '--' &&
                    !this.hasOption(name) &&
                    !globalCommand.hasOption(name)) {
                    console.error(`error: Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
                    process.exit(1);
                }
            }
        }
    }
    /**
     * Check if the required string-type options exist
     */
    checkOptionValue() {
        const { rawOptions, globalCommand } = this.cli;
        const options = [...globalCommand.options, ...this.options];
        for (const option of options) {
            const value = rawOptions[option.name.split('.')[0]];
            // Check required option value
            if (option.required) {
                const hasNegated = options.some(o => o.negated && o.names.includes(option.name));
                if (value === true || (value === false && !hasNegated)) {
                    console.error(`error: option \`${option.rawName}\` value is missing`);
                    process.exit(1);
                }
            }
        }
    }
}
class GlobalCommand extends Command {
    constructor(cli) {
        super('@@global@@', '', {}, cli);
    }
}
exports.GlobalCommand = GlobalCommand;
exports.default = Command;
});

unwrapExports(Command_1);
var Command_2 = Command_1.GlobalCommand;

var CAC_1 = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });

const path_1 = __importDefault(path$$1);
const mri_1 = __importDefault(lib);
const Command_1$$1 = __importStar(Command_1);

class CAC extends events$$1.EventEmitter {
    /**
     * @param name The program name to display in help and version message
     */
    constructor(name = '') {
        super();
        this.name = name;
        this.commands = [];
        this.globalCommand = new Command_1$$1.GlobalCommand(this);
        this.globalCommand.usage('<command> [options]');
    }
    /**
     * Add a global usage text.
     *
     * This is not used by sub-commands.
     */
    usage(text) {
        this.globalCommand.usage(text);
        return this;
    }
    /**
     * Add a sub-command
     */
    command(rawName, description, config) {
        const command = new Command_1$$1.default(rawName, description || '', config, this);
        command.globalCommand = this.globalCommand;
        this.commands.push(command);
        return command;
    }
    /**
     * Add a global CLI option.
     *
     * Which is also applied to sub-commands.
     */
    option(rawName, description, config) {
        this.globalCommand.option(rawName, description, config);
        return this;
    }
    /**
     * Show help message when `-h, --help` flags appear.
     *
     */
    help(callback) {
        this.globalCommand.option('-h, --help', 'Display this message');
        this.globalCommand.helpCallback = callback;
        this.showHelpOnExit = true;
        return this;
    }
    /**
     * Show version number when `-v, --version` flags appear.
     *
     */
    version(version, customFlags = '-v, --version') {
        this.globalCommand.version(version, customFlags);
        this.showVersionOnExit = true;
        return this;
    }
    /**
     * Add a global example.
     *
     * This example added here will not be used by sub-commands.
     */
    example(example) {
        this.globalCommand.example(example);
        return this;
    }
    /**
     * Output the corresponding help message
     * When a sub-command is matched, output the help message for the command
     * Otherwise output the global one.
     *
     * This will also call `process.exit(0)` to quit the process.
     */
    outputHelp() {
        if (this.matchedCommand) {
            this.matchedCommand.outputHelp();
        }
        else {
            this.globalCommand.outputHelp();
        }
    }
    /**
     * Output the version number.
     *
     * This will also call `process.exit(0)` to quit the process.
     */
    outputVersion() {
        this.globalCommand.outputVersion();
    }
    setParsedInfo({ args, options, rawOptions }, matchedCommand) {
        this.args = args;
        this.options = options;
        this.rawOptions = rawOptions;
        if (matchedCommand) {
            this.matchedCommand = matchedCommand;
        }
        return this;
    }
    /**
     * Parse argv
     */
    parse(argv = process.argv, { 
    /** Whether to run the action for matched command */
    run = true } = {}) {
        this.rawArgs = argv;
        if (!this.name) {
            this.name = argv[1] ? path_1.default.basename(argv[1]) : 'cli';
        }
        let shouldParse = true;
        // Search sub-commands
        for (const command of this.commands) {
            const mriResult = this.mri(argv.slice(2), command);
            const commandName = mriResult.args[0];
            if (command.isMatched(commandName)) {
                shouldParse = false;
                const parsedInfo = Object.assign({}, mriResult, { args: mriResult.args.slice(1) });
                this.setParsedInfo(parsedInfo, command);
                this.emit(`command:${commandName}`, command);
            }
        }
        if (shouldParse) {
            // Search the default command
            for (const command of this.commands) {
                if (command.name === '') {
                    shouldParse = false;
                    const mriResult = this.mri(argv.slice(2), command);
                    this.setParsedInfo(mriResult, command);
                    this.emit(`command:!`, command);
                }
            }
        }
        if (shouldParse) {
            const mriResult = this.mri(argv.slice(2));
            this.setParsedInfo(mriResult);
        }
        if (this.options.help && this.showHelpOnExit) {
            this.outputHelp();
        }
        if (this.options.version && this.showVersionOnExit) {
            this.outputVersion();
        }
        const parsedArgv = { args: this.args, options: this.options };
        if (run) {
            this.runMatchedCommand();
        }
        if (!this.matchedCommand && this.args[0]) {
            this.emit('command:*');
        }
        return parsedArgv;
    }
    mri(argv, 
    /** Matched command */ command) {
        // All added options
        const cliOptions = [
            ...this.globalCommand.options,
            ...(command ? command.options : [])
        ];
        const mriOptions = utils.getMriOptions(cliOptions);
        // Extract everything after `--` since mri doesn't support it
        let argsAfterDoubleDashes = [];
        const doubleDashesIndex = argv.indexOf('--');
        if (doubleDashesIndex > -1) {
            argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
            argv = argv.slice(0, doubleDashesIndex);
        }
        const parsed = mri_1.default(argv, mriOptions);
        const args = parsed._;
        delete parsed._;
        const options = {
            '--': argsAfterDoubleDashes
        };
        // Set option default value
        const ignoreDefault = command && command.config.ignoreOptionDefaultValue
            ? command.config.ignoreOptionDefaultValue
            : this.globalCommand.config.ignoreOptionDefaultValue;
        let transforms = Object.create(null);
        for (const cliOption of cliOptions) {
            if (!ignoreDefault && cliOption.config.default !== undefined) {
                for (const name of cliOption.names) {
                    options[name] = cliOption.config.default;
                }
            }
            // If options type is defined
            if (Array.isArray(cliOption.config.type)) {
                if (transforms[cliOption.name] === undefined) {
                    transforms[cliOption.name] = Object.create(null);
                    transforms[cliOption.name]['shouldTransform'] = true;
                    transforms[cliOption.name]['transformFunction'] =
                        cliOption.config.type[0];
                }
            }
        }
        // Camelcase option names and set dot nested option values
        for (const key of Object.keys(parsed)) {
            const keys = key.split('.').map((v, i) => {
                return i === 0 ? utils.camelcase(v) : v;
            });
            utils.setDotProp(options, keys, parsed[key]);
            utils.setByType(options, transforms);
        }
        return {
            args,
            options,
            rawOptions: parsed
        };
    }
    runMatchedCommand() {
        const { args, options, matchedCommand: command } = this;
        if (!command || !command.commandAction)
            return;
        command.checkUnknownOptions();
        command.checkOptionValue();
        command.checkRequiredArgs();
        const actionArgs = [];
        command.args.forEach((arg, index) => {
            if (arg.variadic) {
                actionArgs.push(args.slice(index));
            }
            else {
                actionArgs.push(args[index]);
            }
        });
        actionArgs.push(options);
        return command.commandAction.apply(this, actionArgs);
    }
}
exports.default = CAC;
});

unwrapExports(CAC_1);

var lib$1 = createCommonjsModule(function (module) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const CAC_1$$1 = __importDefault(CAC_1);
/**
 * @param name The program name to display in help and version message
 */
const cac = (name = '') => new CAC_1$$1.default(name);
module.exports = cac;
});

var index = unwrapExports(lib$1);

module.exports = index;
});

var cac = __chunk_2.unwrapExports(dist);

var version = "4.7.2";

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}

function _empty() {}

if (process.env.BILI_LOCAL_PROFILE) {
  const requireSoSlow = require('require-so-slow');

  process.on('exit', () => {
    requireSoSlow.write('require-trace.trace');
  });
}

const cli = cac('bili');
cli.command('[...input]', 'Bundle input files', {
  ignoreOptionDefaultValue: true
}).option('-w, --watch', 'Watch files').option('--format <format>', 'Output format (cjs | umd | es  | iife), can be used multiple times').option('--input.* [file]', 'An object mapping names to entry points').option('-d, --out-dir <outDir>', 'Output directory', {
  default: 'dist'
}).option('--root-dir <rootDir>', 'The root directory to resolve files from').option('--file-name <name>', 'Set the file name for output files').option('--module-name <name>', 'Set the module name for umd bundle').option('--env.* [value]', 'Replace env variables').option('--plugin, --plugins.* [options]', 'Use a plugin').option('--global.* [path]', 'id:moduleName pair for external imports in umd/iife bundles').option('--no-extract-css', 'Do not extract CSS files').option('--bundle-node-modules', 'Include node modules in your bundle').option('--minify', 'Minify output files').option('--external <id>', 'Mark a module id as external', {
  type: []
}).option('-t, --target <target>', 'Output target', {
  default: 'node'
}).option('-c, --config <file>', 'Use a custom config file').option('--minimal', 'Generate minimal output whenever possible').option('--banner', 'Add banner with pkg info to the bundle').option('--no-map', 'Disable source maps, enabled by default for minified bundles').option('--map-exclude-sources', 'Exclude source code in source maps').option('--no-async-pro, --no-async-to-promises', 'Leave async/await as is').option('--concurrent', 'Build concurrently').option('--verbose', 'Show verbose logs').option('--quiet', 'Show minimal logs').option('--stack-trace', 'Show stack trace for bundle errors').example(bin$$1 => `  ${bin$$1} --format cjs --format esm`).example(bin$$1 => `  ${bin$$1} src/index.js,src/cli.ts`).example(bin$$1 => `  ${bin$$1} --input.index src/foo.ts`).action(_async(function (input, options) {
  return _await(Promise.resolve(require('./index.js')), function ({
    Bundler
  }) {
    const bundler = new Bundler({
      input: options.input || (input.length === 0 ? undefined : input),
      output: {
        format: options.format,
        dir: options.outDir,
        moduleName: options.moduleName,
        fileName: options.fileName,
        minify: options.minify,
        extractCSS: options.extractCss,
        sourceMap: options.map,
        sourceMapExcludeSources: options.mapExcludeSources,
        target: options.target
      },
      bundleNodeModules: options.bundleNodeModules,
      env: options.env,
      plugins: options.plugins,
      externals: options.external,
      globals: options.global,
      banner: options.banner,
      babel: {
        asyncToPromises: options.asyncToPromises,
        minimal: options.minimal
      }
    }, {
      logLevel: options.verbose ? 'verbose' : options.quiet ? 'quiet' : undefined,
      stackTrace: options.stackTrace,
      configFile: options.config
    });
    return _awaitIgnored(bundler.run({
      write: true,
      watch: options.watch,
      concurrent: options.concurrent
    }).catch(err => {
      bundler.handleError(err);
      process.exit(1);
    }));
  });
}));
cli.version(version);
cli.help();
cli.parse();
process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
});
