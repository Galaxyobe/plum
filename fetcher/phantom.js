const createPhantomPool = require('phantom-pool').default;
const moment = require('moment');
const Promise = require('bluebird');
const _ = require('lodash');


/**
 * 新建连接池
 *
 * @description
 * poolParams see https://github.com/coopernurse/node-pool
 * phantomArgs see https://github.com/amir20/phantomjs-node
 * createPhantomPool see https://github.com/binded/phantom-pool
 * @param {Object} poolParams 连接池参数
 * @param {Array} phantomArgs phantom参数
 * @returns {Object} pool 连接池对象
 */
function newPool(poolParams, phantomArgs) {
    let params = poolParams;
    params.phantomArgs = phantomArgs;
    return createPhantomPool(params);
}

/**
 * 释放连接池
 *
 * @param {Object} pool 连接池对象
 */
function freePool(pool) {
    pool.drain().then(() => pool.clear());
}

function getCookies(headers) {
    let cookies = {};
    for (let item of headers) {
        if (item.name === 'Set-Cookie') {
            let _cookies = item.value.replace(/\s+/g, '').split(';');
            for (let cookie of _cookies) {
                if (cookie.indexOf('=') > -1) {
                    let _cookie = cookie.split('=');
                    cookies[_cookie[0]] = _cookie[1];
                } else {
                    cookies[cookie] = true;
                }
            }
        }
    }
    return cookies;
}

/**
 * 获取
 *
 * @description
 * settings see http://phantomjs.org/api/webpage/method/open.html
 *          see http://phantomjs.org/api/webpage/property/settings.html
 * @param {pool} pool 连接池对象
 * @param {String} url
 * @param {Object} settings fetch的设置
 * @param {Object} extra extra数据原样返回
 */
function fetch(pool, url, settings, extra) {
    // Automatically acquires a phantom instance and releases it back to the
    // pool when the function resolves or throws
    return pool.use(async (instance) => {
        // 新建page对象
        const page = await instance.createPage();

        let _settings = {};

        if (settings) {
            _settings = _.cloneDeep(settings);
        }

        delete _settings.timeout;
        // 分析settings

        // page settings
        if (_settings.settings) {
            for (let setting in _settings.settings) {
                await page.setting(setting, _settings.settings[setting]);
            }
            delete _settings.settings;
        }
        // 代理
        if (_settings.proxy) {
            page.setProxy(_settings.proxy);
            delete _settings.proxy;
        }
        // headers
        if (_settings.headers) {
            // User-Agent
            if (_settings.headers['User-Agent']) {
                await page.setting('userAgent', _settings.headers['User-Agent']);
            }
            page.customHeaders = _settings.headers;
            delete _settings.headers;
        }

        let firstResponse = null;
        let responseError = null;

        // page.on('onInitialized', function () {
        //     console.log('Start fetch: ' + url);
        // });

        // page.on('onLoadStarted', async function () {
        //     var currentUrl = await page.evaluate(function () {
        //         return window.location.href;
        //     });
        //     console.log('Current page ' + currentUrl + ' will be gone...');
        //     console.log('Now loading a new page...');
        // });

        // page.on('onResourceRequested', function (requestData, networkRequest) {
        //     console.log('Starting request: #' + requestData.id + ' [' + requestData.method + '] ' + requestData.url);
        // });

        page.on('onResourceReceived', function (response) {
            if (!response.status) {
                return;
            }
            // console.log('Request finished: #' + response.id + ' [' + response.status + ']' + response.url);
            if (firstResponse === null && response.status !== 301 && response.status !== 302) {
                firstResponse = response;
            }
            let cookies = getCookies(response.headers);
            page.addCookie(cookies);
            // console.log(response);
        });

        // page.on('onLoadFinished', function (status) {
        //     console.log('Finished fetch: ' + url + ' status:' + status);
        // });

        // 不判断js执行超时
        // page.on('onResourceTimeout', function (request) {
        //     console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
        // });

        page.on('onResourceError', function (resourceError) {
            // console.log('Unable to load resource (#' + resourceError.id + ' ' + resourceError.url + ')');
            // console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
            responseError = resourceError;
        });


        function open(url, _settings) {
            return new Promise(async function (resolve, reject) {
                let status = await page.open(url, _settings);

                if (_settings.render) {
                    let file = 'render/' + url.split('://')[1] + ' ' + moment().format('YYYY-MM-DD HH:mm:ss') + '.pdf';
                    page.render(file);
                }

                let result = {};

                if (extra) {
                    result.extra = extra;
                }

                result.status = status;

                if (firstResponse) {
                    result.url = firstResponse.url;
                    result.title = await page.property('title');
                    result.time = firstResponse.time;
                    result.headers = firstResponse.headers;
                    result.contentType = firstResponse.contentType;
                    result.statusCode = firstResponse.status;
                    result.statusText = firstResponse.statusText;
                    result.body = await page.property('content');
                    result.cookies = await page.property('cookies');
                    if (firstResponse.redirectURL) {
                        result.redirectURL = firstResponse.redirectURL;
                    }
                } else {
                    result.url = url;
                }

                if (responseError) {
                    result.errorCode = responseError.errorCode;
                    result.errorString = responseError.errorString;
                }

                return resolve(result);
            });
        }

        return open(url, _settings).timeout(settings.timeout, 'Open ' + url + ' took too long').then(result => {
            return Promise.resolve(result);
        }).catch(err => {
            page.stop();
            page.close();
            return Promise.reject(err);
        });
    });
}


module.exports = {
    newPool: newPool,
    freePool: freePool,
    fetch: fetch
};
