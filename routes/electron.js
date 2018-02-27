const _ = require('lodash');
const ElectronFetcher = require('../fetcher/electron');
const DefaultSettings = require('../fetcher/settings').electron;

var fetcher = ElectronFetcher();

/**
 * @description
 * 请求数据应放入body中
 * body数据格式: json
 * {
 *  url:'', // 字符串
 *  headers:{ // json
 *    'user-agent':'', // 字符串
 *          },
 *  proxy: '', // 字符串
 *  cookies:{},
 *  extra:'' // 任意类型 原样返回
 * }
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns
 */
async function fetch(req, res, next) {
    // console.log(req.body);
    let data = req.body;
    if (!data.url) {
        res.send('ERROR: url is expect');
        return next();
    } else {
        if (data.url.indexOf('http') === -1) {
            res.send('ERROR: url need schema');
            return next();
        }
    }
    data.extra = data.extra || undefined;
    let settings = _.clone(DefaultSettings);
    // 参数处理
    // 代理
    if (data.proxy) {
        settings.proxy = data.proxy;
    }
    // 请求头
    if (data.headers) {
        let _headers = [];
        for (let key in data.headers) {
            // 浏览器代理
            if (key.toLocaleLowerCase() === 'user-agent') {
                settings.contents.userAgent = data.headers[key];
            } else {
                // 其他选项
                _headers.push(key + ':' + data.headers[key]);
            }
        }
        // 组成fetcher的请求头格式
        settings.contents.extraHeaders = _headers.join('\n');
    }
    // cookies
    // if (data.cookies) {

    // }
    let statusCode = 0;
    const start = Date.now();
    console.log('start fetch ' + data.url);
    try {
        var datas = await fetcher.fetch(data.url, settings, data.extra);
        statusCode = datas.httpResponseCode;
        res.send(datas);
    } catch (error) {
        // console.error(error);
        statusCode = error.httpResponseCode;
        res.send(error);
    }

    console.log('fetch ' + data.url + ' <' + statusCode + '> use: ' + (Date.now() - start) / 1000 + 's');
    return next();
}


module.exports = {
    fetch: fetch
};
