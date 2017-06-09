const Electron = require('../fetcher/electron');
const _ = require('lodash');
const DefaultSettings = require('../fetcher/settings');

var electron = Electron();

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
 *  meta:'' // 任意类型 原样返回
 * }
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns
 */
async function fetch(req, res, next) {
    let data = req.body;
    data.meta = data.meta || undefined;
    let settings = _.clone(DefaultSettings);
    // 参数处理
    // 代理
    if (data.proxy) {
        settings.proxy = data.proxy;
    }
    // 请求头
    if (data.headers) {
        const headers = JSON.parse(data.headers);
        let _headers = [];
        for (let key in headers) {
            // 浏览器代理
            if (key.toLocaleLowerCase() === 'user-agent') {
                settings.contents.userAgent = headers[key];
            } else {
                // 其他选项
                _headers.push(key + ':' + headers[key]);
            }
        }
        // 组成electron的请求头格式
        settings.contents.extraHeaders = _headers.join('\n');
    }
    // cookies
    // if (data.cookies) {

    // }
    const start = Date.now();
    try {
        let datas = await electron.fetcher(data.url, settings, data.meta);
        res.send(datas);
    } catch (err) {
        res.send(err);
    }
    console.log('fetch ' + data.url + ' use: ' + (Date.now() - start) / 1000 + 's');
    return next();
}


module.exports = {
    fetch: fetch
};
