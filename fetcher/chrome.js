'use strict';

const Promise = require('bluebird');
const _ = require('lodash');


module.exports = ChromeHeadlessFetcher;

function ChromeHeadlessFetcher(options) {
    if (!(this instanceof ChromeHeadlessFetcher)) {
        return new ChromeHeadlessFetcher(options);
    }
    var self = this;

    self.CDP = require('chrome-remote-interface');
    // options
    self.options = options || {};
}

/**
 * 获取
 *
 * @param {String} url
 * @param {Object} settings fetch的设置
 * @param {Object} extra extra数据原样返回
 */
ChromeHeadlessFetcher.prototype.fetch = function (url, settings, extra) {
    return new Promise(async (resolve, reject) => {
        // 全局对象
        var self = this;
        // 处理参数
        settings = settings || {};
        settings.fetchTimeout = settings.fetchTimeout || 60000;
        settings.executeTimeout = settings.executeTimeout || 30000;
        settings.returnTimeout = settings.returnTimeout || 5000;

        // CDT选项
        let options = _.clone(self.options);

        // 全局变量
        var clientCDP = null;
        var httpResponseHeaders = null;
        var httpResponseCode = 506; // 自定义
        var cookies = null;
        var body = '';
        var resourceContent = '';
        // 新建tab
        try {
            var target = await self.CDP.New(options);
        } catch (err) {
            return reject(err);
        }
        // 关闭
        async function close() {
            try {
                if (clientCDP) clientCDP.close();
                await self.CDP.Close({ 'id': target.id });
            } catch (err) {
                return reject(err);
            }
            if (fetchTimer) clearTimeout(fetchTimer);
        }
        // 加载成功
        async function loadSucceed(datas) {
            close();
            if (extra) {
                datas.extra = extra;
            }
            if (cookies) {
                datas.cookies = cookies.cookies;
            } else {
                datas.cookies = [];
            }
            datas.headers = httpResponseHeaders || {};
            datas.httpResponseCode = httpResponseCode;

            return resolve(datas);
        }
        // 加载失败
        async function loadFailed(error) {
            close();
            if (cookies) {
                error.cookies = cookies.cookies;
            } else {
                error.cookies = [];
            }
            error.body = body;
            error.content = resourceContent;
            error.headers = httpResponseHeaders || {};
            return reject(error);
        }
        // fetch超时
        let fetchTimer = setTimeout(() => {
            const error = {
                errorType: 'fetch-timeout',
                url: url,
                timeout: settings.fetchTimeout,
                httpResponseCode: 504
            };
            loadFailed(error);
        }, settings.fetchTimeout);
        // return超时
        let returnTimer = null;

        options.target = target.webSocketDebuggerUrl;

        self.CDP(options, (client) => {
            // Extract used DevTools domains.
            const { Page, Runtime, Network } = client;
            clientCDP = client;
            Promise.all([
                Network.enable(),
                Page.enable(),
                Runtime.enable()
            ]).then(async () => {
                // 隐身模式
                if (settings.stealth) {
                    await Network.clearBrowserCache();
                    await Network.clearBrowserCookies();
                }
                // 设置UserAgent和HTTPHeaders
                settings.contents = settings.contents || {};
                if (typeof (settings.contents.userAgent) === 'string') {
                    await Network.setUserAgentOverride(settings.contents);
                }
                if (settings.contents.extraHeaders instanceof Object) {
                    await Network.setExtraHTTPHeaders(settings.contents);
                }
                // 开始
                let { frameId } = await Page.navigate({ url: url });
                // Network事件: requestWillBeSent
                Network.requestWillBeSent(params => {
                    // console.log('\t#' + params.requestId + ' <Request ' + params.request.url + '>');
                });
                // Network事件: responseReceived
                Network.responseReceived(async params => {
                    // console.log('\t#' + params.requestId + ' <Response ' + params.response.url + '> <' + params.response.status + '>');
                    if (params.response.url === url) {
                        httpResponseHeaders = params.response.headers;
                        httpResponseCode = params.response.status;
                        settings.policy.handlerHttpCode = settings.policy.handlerHttpCode || [];
                        if (settings.policy.handlerHttpCode.indexOf(httpResponseCode) > -1) {
                            if (settings.policy.handlerReturn) {
                                client.close();
                                clientCDP = null;
                                const error = {
                                    errorType: 'handler-return',
                                    originalURL: url,
                                    httpResponseCode: params.response.status
                                };
                                return loadFailed(error);
                            }
                        }
                    }
                });
                // Page事件: frameScheduledNavigation
                Page.frameScheduledNavigation(({ frameId, delay }) => {
                    if (returnTimer) {
                        clearTimeout(returnTimer);
                    }
                });
                // Page事件: domContentEventFired
                Page.domContentEventFired(async () => {
                    // console.log('domContentEventFired');
                    cookies = await Network.getCookies();
                    // return超时
                    returnTimer = setTimeout(async () => {
                        clearTimeout(fetchTimer);
                        var { result } = await Runtime.evaluate({ expression: 'document.body.innerHTML' });
                        body = result.value;
                        const { content } = await Page.getResourceContent({ frameId: frameId, url: url });
                        resourceContent = content;
                        client.close();
                        clientCDP = null;
                        if (httpResponseCode === 506) {
                            const error = {
                                errorType: 'gateway-error',
                                originalURL: url,
                                httpResponseCode: 502
                            };
                            return loadFailed(error);
                        }
                        return loadSucceed({ body: result.value, content: content });
                    }, settings.returnTimeout);
                });
            });
        }).on('error', (err) => {
            close();
            return reject(err);
        });
    });
};
