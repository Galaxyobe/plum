'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');


class ChromeHeadlessFetcher {
    constructor(options, notifier) {
        this.CDP = require('chrome-remote-interface');
        // options
        this.options = options || {};
    }
}





ChromeHeadlessFetcher.prototype.fetch = function (url, settings, extra) {
    return new Promise(async (resolve, reject) => {
        // 全局对象
        var This = this;
        // 处理参数
        settings = settings || {};
        settings.fetchTimeout = settings.fetchTimeout || 60000;
        settings.executeTimeout = settings.executeTimeout || 30000;
        settings.returnTimeout = settings.returnTimeout || 3000;

        // CDT选项
        let options = _.clone(This.options);

        // 新建tab
        try {
            var target = await This.CDP.New(options);
        } catch (err) {
            return reject(err);
        }

        async function close() {
            try {
                await This.CDP.Close({ 'id': target.id });
            } catch (err) {
                return reject(err);
            }
            if (fetchTimer) clearTimeout(fetchTimer);
            console.log('tab closed');
        }
        // 关闭tab
        let fetchTimer = setTimeout(() => {
            console.log('Timeout');
            close();
            return reject('time out');
        }, settings.fetchTimeout);


        options.target = target.webSocketDebuggerUrl;

        try {
            let client = await This.CDP(options);

            await (async (client) => {
                // ExtractusedDevToolsdomains.
                const { Page, Runtime, DOM, Network, CSS } = client;

                Promise.all([
                    Network.enable(),
                    Page.enable(),
                    CSS.disable()
                ]).then(async () => {
                    let { frameId } = await Page.navigate({ url: url });

                    await Network.clearBrowserCache();
                    await Network.clearBrowserCookies();
                    // await Network.setUserAgentOverride();
                    // await Network.setExtraHTTPHeaders();

                    Network.requestWillBeSent(params => {
                        console.log('Start request id: ' + params.requestId + ' ' + params.request.url);
                    });


                    Network.responseReceived(async parameters => {
                        console.log('-----------responseReceived---------------');
                        // console.log(response);
                        // try {
                        //     const { body, base64Encoded } = await Network.getResponseBody({ requestId: parameters.requestId });
                        //     console.log('-----------getResponseBody---------------');
                        //     console.log(parameters.response.url);
                        //     /* if (parameters.response.url.slice(-3) === '.js') */ {
                        //         console.log(body);
                        //         console.log(base64Encoded);
                        //     }
                        // } catch (err) {
                        //     // console.error(err);
                        // }
                    });

                    // Network.dataReceived(data => {
                    //     console.log('-----------dataReceived---------------');
                    //     console.log(data);
                    // });

                    // Network.loadingFinished(async data => {
                    //     console.log('-----------loadingFinished---------------');
                    //     console.log(data);
                    // });
                    Page.frameNavigated((frame) => {
                        console.log('-----------frameNavigated---------------');
                        console.log(frame);
                    });
                    Page.frameStartedLoading((frameId) => {
                        console.log('-----------frameStartedLoading---------------');
                        console.log(frameId);
                    });
                    Page.frameStoppedLoading((frameId) => {
                        console.log('-----------frameStoppedLoading---------------');
                        console.log(frameId);
                    });
                    Page.frameScheduledNavigation(({ frameId, delay }) => {
                        console.log('-----------frameScheduledNavigation---------------');
                        console.log(frameId);
                    });
                    Page.frameDetached((frameId) => {
                        console.log('-----------frameDetached---------------');
                        console.log(frameId);
                    });
                    Network.loadingFailed(data => {
                        console.log('-----------loadingFailed---------------');
                        console.log(data);
                    });

                    Page.domContentEventFired(async () => {
                        console.log('-----------domContentEventFired---------------');
                        Runtime.evaluate({ expression: 'document.body.outerHTML' }).then((result) => {
                            if (result.result.value.length < 1000) {
                                console.log(result.result.value);
                            }
                            // client.close();
                            // close();
                        });
                    });

                    Page.navigationRequested((isInMainFrame, isRedirect, navigationId, url) => {
                        console.log('-----------navigationRequested---------------');
                        console.log(isInMainFrame);
                    });

                    Page.loadEventFired(async () => {
                        console.log('**********loadEventFired***********');
                        console.log('-----------getResourceContent---------------');

                        const { content, base64Encoded } = await Page.getResourceContent({ frameId: frameId, url: url });
                        console.log(content);

                        let cookies = await Network.getCookies();
                        // console.log(cookies);

                        const { data } = await Page.captureScreenshot();
                        fs.writeFileSync('scrot.png', Buffer.from(data, 'base64'));
                        // DOM.getOuterHTML().then(outerHTML => {
                        //     console.log(outerHTML);
                        // });
                        Runtime.evaluate({ expression: 'document.body.outerHTML' }).then((result) => {
                            console.log(result.result.value.length);
                            // client.close();
                            // close();
                        });
                    });
                });
            })(client);
        } catch (err) {
            close();
            return reject(err);
        }
    });
};


const chromeFetcher = new ChromeHeadlessFetcher();

let settings = {
    images: false
};

let url = 'https://booking.airasia.com/Flight/Select?o1=PEK&d1=AKL&culture=zh-CN&dd1=2017-06-30&dd2=2017-06-30&r=true&ADT=1&CHD=1&inl=1&s=true&mon=true&cc=CNY&c=false';
// url = 'https://www.baidu.com';

const start = Date.now();
chromeFetcher.fetch(url, settings).then((data) => {
    console.log('fetch ' + url + ' use: ' + (Date.now() - start) / 1000 + 's');
}).catch(err => {
    console.error(err);
    console.log('fetch ' + url + ' use: ' + (Date.now() - start) / 1000 + 's');
});
