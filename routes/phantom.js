const _ = require('lodash');
const PhantomFetcher = require('../fetcher/phantom');
const DefaultSettings = require('../fetcher/settings').phantom;

const fetcher = PhantomFetcher;

const pool = PhantomFetcher.newPool({
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    maxUses: 50,
    validator: () => Promise.resolve(true),
    testOnBorrow: true
}, [['--ignore-ssl-errors=true',
    '--disk-cache=false',
    '--load-images=true'],
{ logLevel: 'info' }]
);


// PhantomFetcher.freePool(pool);

/**
 * @description
 * 请求数据应放入body中
 * body数据格式: json
 * {
 *  url:'', // 字符串
 *  headers:{ // json
 *    'User-Agent':'', // 字符串
 *  },
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
    // settings.fetchTimeout = 90000;
    // 代理
    if (data.proxy) {
        settings.proxy = data.proxy;
    }
    // 请求头
    if (data.headers) {
        if ('User-Agent' in data.headers) {
            settings.contents.userAgent = data.headers['User-Agent'];
        }
        settings.contents.headers = data.headers;
    }
    // cookies
    // if (data.cookies) {

    // }
    let statusCode = 0;
    console.log('start fetch ' + data.url);
    const start = Date.now();
    try {
        var datas = await fetcher.fetch(pool, data.url, settings, data.extra);
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
