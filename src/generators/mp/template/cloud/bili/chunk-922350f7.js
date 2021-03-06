'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('fs');
var __chunk_2 = require('./chunk-46c9fc75.js');
require('stream');
var __chunk_3 = require('./chunk-a4170a86.js');
var zlib = _interopDefault(require('zlib'));

var writeMethods = ["write", "end", "destroy"];
var readMethods = ["resume", "pause"];
var readEvents = ["data", "close"];
var slice = Array.prototype.slice;

var duplexer = duplex;

function forEach (arr, fn) {
    if (arr.forEach) {
        return arr.forEach(fn)
    }

    for (var i = 0; i < arr.length; i++) {
        fn(arr[i], i);
    }
}

function duplex(writer, reader) {
    var stream$$1 = new __chunk_3.require$$0();
    var ended = false;

    forEach(writeMethods, proxyWriter);

    forEach(readMethods, proxyReader);

    forEach(readEvents, proxyStream);

    reader.on("end", handleEnd);

    writer.on("drain", function() {
      stream$$1.emit("drain");
    });

    writer.on("error", reemit);
    reader.on("error", reemit);

    stream$$1.writable = writer.writable;
    stream$$1.readable = reader.readable;

    return stream$$1

    function proxyWriter(methodName) {
        stream$$1[methodName] = method;

        function method() {
            return writer[methodName].apply(writer, arguments)
        }
    }

    function proxyReader(methodName) {
        stream$$1[methodName] = method;

        function method() {
            stream$$1.emit(methodName);
            var func = reader[methodName];
            if (func) {
                return func.apply(reader, arguments)
            }
            reader.emit(methodName);
        }
    }

    function proxyStream(methodName) {
        reader.on(methodName, reemit);

        function reemit() {
            var args = slice.call(arguments);
            args.unshift(methodName);
            stream$$1.emit.apply(stream$$1, args);
        }
    }

    function handleEnd() {
        if (ended) {
            return
        }
        ended = true;
        var args = slice.call(arguments);
        args.unshift("end");
        stream$$1.emit.apply(stream$$1, args);
    }

    function reemit(err) {
        stream$$1.emit("error", err);
    }
}

const processFn = (fn, opts) => function () {
	const P = opts.promiseModule;
	const args = new Array(arguments.length);

	for (let i = 0; i < arguments.length; i++) {
		args[i] = arguments[i];
	}

	return new P((resolve, reject) => {
		if (opts.errorFirst) {
			args.push(function (err, result) {
				if (opts.multiArgs) {
					const results = new Array(arguments.length - 1);

					for (let i = 1; i < arguments.length; i++) {
						results[i - 1] = arguments[i];
					}

					if (err) {
						results.unshift(err);
						reject(results);
					} else {
						resolve(results);
					}
				} else if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		} else {
			args.push(function (result) {
				if (opts.multiArgs) {
					const results = new Array(arguments.length - 1);

					for (let i = 0; i < arguments.length; i++) {
						results[i] = arguments[i];
					}

					resolve(results);
				} else {
					resolve(result);
				}
			});
		}

		fn.apply(this, args);
	});
};

var pify = (obj, opts) => {
	opts = Object.assign({
		exclude: [/.+(Sync|Stream)$/],
		errorFirst: true,
		promiseModule: Promise
	}, opts);

	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);
		return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
	};

	let ret;
	if (typeof obj === 'function') {
		ret = function () {
			if (opts.excludeMain) {
				return obj.apply(this, arguments);
			}

			return processFn(obj, opts).apply(this, arguments);
		};
	} else {
		ret = Object.create(Object.getPrototypeOf(obj));
	}

	for (const key in obj) { // eslint-disable-line guard-for-in
		const x = obj[key];
		ret[key] = typeof x === 'function' && filter(key) ? processFn(x, opts) : x;
	}

	return ret;
};

var gzipSize = __chunk_2.createCommonjsModule(function (module) {






const getOptions = options => Object.assign({level: 9}, options);

module.exports = (input, options) => {
	if (!input) {
		return Promise.resolve(0);
	}

	return pify(zlib.gzip)(input, getOptions(options)).then(data => data.length).catch(_ => 0);
};

module.exports.sync = (input, options) => zlib.gzipSync(input, getOptions(options)).length;

module.exports.stream = options => {
	const input = new __chunk_3.require$$0.PassThrough();
	const output = new __chunk_3.require$$0.PassThrough();
	const wrapper = duplexer(input, output);

	let gzipSize = 0;
	const gzip = zlib.createGzip(getOptions(options))
		.on('data', buf => {
			gzipSize += buf.length;
		})
		.on('error', () => {
			wrapper.gzipSize = 0;
		})
		.on('end', () => {
			wrapper.gzipSize = gzipSize;
			wrapper.emit('gzip-size', gzipSize);
			output.end();
		});

	input.pipe(gzip);
	input.pipe(output, {end: false});

	return wrapper;
};

module.exports.file = (path, options) => {
	return new Promise((resolve, reject) => {
		const stream$$1 = __chunk_2.fs.createReadStream(path);
		stream$$1.on('error', reject);

		const gzipStream = stream$$1.pipe(module.exports.stream(options));
		gzipStream.on('error', reject);
		gzipStream.on('gzip-size', resolve);
	});
};

module.exports.fileSync = (path, options) => module.exports.sync(__chunk_2.fs.readFileSync(path), options);
});
var gzipSize_1 = gzipSize.sync;
var gzipSize_2 = gzipSize.stream;
var gzipSize_3 = gzipSize.file;
var gzipSize_4 = gzipSize.fileSync;

exports.default = gzipSize;
exports.__moduleExports = gzipSize;
exports.sync = gzipSize_1;
exports.stream = gzipSize_2;
exports.file = gzipSize_3;
exports.fileSync = gzipSize_4;
