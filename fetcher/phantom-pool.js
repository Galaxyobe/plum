'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _phantom = require('phantom');

var _phantom2 = _interopRequireDefault(_phantom);

var _genericPool = require('generic-pool');

var _genericPool2 = _interopRequireDefault(_genericPool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// import initDebug from 'debug'
// const debug = initDebug('phantom-pool')

exports.default = function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _ref$max = _ref.max;

    let max = _ref$max === undefined ? 10 : _ref$max;
    var _ref$min = _ref.min;
    let min = _ref$min === undefined ? 2 : _ref$min;
    var _ref$idleTimeoutMilli = _ref.idleTimeoutMillis;
    let idleTimeoutMillis = _ref$idleTimeoutMilli === undefined ? 30000 : _ref$idleTimeoutMilli;
    var _ref$maxUses = _ref.maxUses;
    let maxUses = _ref$maxUses === undefined ? 50 : _ref$maxUses;
    var _ref$testOnBorrow = _ref.testOnBorrow;
    let testOnBorrow = _ref$testOnBorrow === undefined ? true : _ref$testOnBorrow;
    var _ref$phantomArgs = _ref.phantomArgs;
    let phantomArgs = _ref$phantomArgs === undefined ? [] : _ref$phantomArgs;
    var _ref$validator = _ref.validator;

    let validator = _ref$validator === undefined ? () => Promise.resolve(true) : _ref$validator;
    let otherConfig = _objectWithoutProperties(_ref, ['max', 'min', 'idleTimeoutMillis', 'maxUses', 'testOnBorrow', 'phantomArgs', 'validator']);

    // TODO: randomly destroy old instances to avoid resource leak?
    const factory = {
        create: () => _phantom2.default.create(...phantomArgs).then(instance => {
            instance.useCount = 0;
            return instance;
        }),
        destroy: instance => instance.exit(),
        validate: instance => validator(instance).then(valid => Promise.resolve(valid && (maxUses <= 0 || instance.useCount < maxUses)))
    };
    const config = Object.assign({
        max,
        min,
        idleTimeoutMillis,
        testOnBorrow
    }, otherConfig);
    const pool = _genericPool2.default.createPool(factory, config);
    const genericAcquire = pool.acquire.bind(pool);
    pool.acquire = () => genericAcquire().then(r => {
        r.useCount += 1;
        return r;
    });
    pool.use = fn => {
        let resource;
        return pool.acquire().then(r => {
            resource = r;
            return resource;
        }).then(fn).then(result => {
            pool.release(resource);
            return result;
        }).catch(err => {
            pool.release(resource);
            throw err;
        });
    };

    return pool;
};