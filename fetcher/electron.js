
const { BrowserWindow } = require('electron');
const fs = require('fs');
const moment = require('moment');
const Promise = require('bluebird');

var App = null;

module.exports = Electron;

function Electron(options) {
    if (!(this instanceof Electron)) {
        return new Electron(options);
    }
    if (!App) {
        App = require('electron').app;
    }
    var self = this;

    self.windowCount = 0;

    App.on('window-all-closed', () => {

    });

    App.on('browser-window-created', (event, window) => {
        self.windowCount++;
    });

    App.on('quit', function (event, exitCode) {
        console.log('quit: ' + exitCode);
    });

    self.isReady = App.isReady()
        ? Promise.resolve()
        : new Promise(resolve => App.once('ready', resolve));

    self.options = options || {};
    // setInterval(() => {
    //     console.log('running fetch: ' + self.windowCount);
    // }, 60000);
}


/**
 * 获取
 *
 * @description
 * settings see http://phantomjs.org/api/webpage/method/open.html
 *          see http://phantomjs.org/api/webpage/property/settings.html
 * @param {pool} pool 连接池对象
 * @param {String} url
 * @param {Object} settings fetcher的设置
 * @param {Object} extra extra数据原样返回
 */
Electron.prototype.fetcher = function fetcher(url, settings, extra) {
    var self = this;
    return self.isReady.then(() => new Promise((resolve, reject) => {
        // 处理参数
        settings = settings || {};
        settings.window = settings.window || {};
        settings.contents = settings.contents || {};
        settings.fetchTimeout = settings.fetchTimeout || 30000;
        settings.executeTimeout = settings.executeTimeout || 30000;
        settings.returnTimeout = settings.returnTimeout || 3000;
        settings.stealth = settings.stealth || false;
        settings.openDevTools = settings.openDevTools || false;
        settings.policy = settings.policy || {};

        if (settings.stealth) {
            settings.window.webPreferences = settings.window.webPreferences || {};
            settings.window.webPreferences.partition = String(this.windowCount);
        }
        // 内部变量
        var fetchTimer = null;
        var returnTimer = null;
        var urlResponseHeaders = null;
        // 新建窗口对象
        let win = new BrowserWindow(settings.window);

        if (settings.openDevTools) {
            win.show();
            win.openDevTools();
        }
        // 监听BrowserWindow事件
        win.on('closed', () => {
            self.windowCount--;
            console.log('closed');
            win = null;
        });

        // 获取webContents对象
        const webContents = win.webContents;


        // 自定义
        async function loadSucceed(datas) {
            // console.log('load-succeed');
            clearTimeout(fetchTimer);
            if (extra) {
                datas.extra = extra;
            }
            if (settings.save) {
                let fileName = url.split('://')[1].replace(/\//g, '-') + ' ' + moment().format('YYYY-MM-DD HH:mm:ss');
                // 保存到pdf
                if (settings.save.saveToPdf) {
                    webContents.printToPDF({}, function (error, data) {
                        if (error) console.error(error);
                        if (!settings.save.saveToPdfPath) {
                            settings.save.saveToPdfPath = './';
                        } else {
                            if (settings.save.saveToPdfPath.slice(-settings.save.saveToPdfPath.length) !== '/') {
                                settings.save.saveToPdfPath += '/';
                            }
                        }
                        let saveToPdfName = settings.save.saveToPdfName || fileName + '.pdf';
                        fs.writeFile(settings.save.saveToPdfPath + saveToPdfName, data, function (error) {
                            if (error) console.error(error);
                        });
                    });
                }
                // 保存到html
                if (settings.save.saveToHtml) {
                    if (!settings.save.saveToHtmlPath) {
                        settings.save.saveToHtmlPath = './';
                    } else {
                        if (settings.save.saveToHtmlPath.slice(-settings.save.saveToHtmlPath.length) !== '/') {
                            settings.save.saveToHtmlPath += '/';
                        }
                    }
                    settings.save.saveToHtmlName = settings.save.saveToHtmlName || fileName + '.html';
                    settings.save.saveToHtmlType = settings.save.saveToHtmlType || 'HTMLComplete';
                    const saveType = ['HTMLOnly', 'HTMLComplete', 'MHTML'];
                    if (saveType.indexOf(settings.save.saveToHtmlType) === -1) {
                        settings.save.saveToHtmlType = 'HTMLComplete';
                    }
                    webContents.savePage(settings.save.saveToHtmlPath + settings.save.saveToHtmlName, settings.save.saveToHtmlType, function (error) {
                        if (error) console.error(error);
                    });
                }
            }
            try {
                datas.cookies = await getCookies();
            } catch (err) {
                console.error(err);
            }
            if (!settings.openDevTools) {
                if (win) win.close();
            }
            datas.headers = urlResponseHeaders;
            return resolve(datas);
        }
        async function loadFailed(error) {
            // console.log('load-failed');
            clearTimeout(fetchTimer);

            try {
                error.cookies = await getCookies();
            } catch (err) {
                console.error(err);
            }
            if (!settings.openDevTools) {
                if (win) win.close();
            }
            error.headers = urlResponseHeaders;
            return reject(error);
        };
        function getCookies() {
            var details = Object.assign({
                url: webContents.getURL()
            });
            return new Promise((resolve, reject) => {
                if (!webContents) {
                    return reject(new Error('Object has been destroyed'));
                }
                webContents.session.cookies.get(details, function (error, cookies) {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(cookies);
                });
            });
        }
        // 监听webContents事件
        webContents.on('crashed', (event, killed) => {
            const error = {
                errorType: 'crashed',
                killed: killed,
                httpResponseCode: 500
            };
            return loadFailed(error);
        });
        webContents.on('did-get-response-details', (event, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) => {
            // console.log('response details' + Date.now() + ' ' + originalURL + ' ' + resourceType + ' <' + httpResponseCode + '>');
            // 处理HttpCode
            if (originalURL === url) {
                urlResponseHeaders = headers;
                settings.policy.handlerHttpCode = settings.policy.handlerHttpCode || [];
                if (settings.policy.handlerHttpCode.indexOf(httpResponseCode) > -1) {
                    if (settings.policy.handlerReturn) {
                        webContents.stop();
                        const error = {
                            errorType: 'handler-return',
                            status: status,
                            newURL: newURL,
                            originalURL: originalURL,
                            httpResponseCode: httpResponseCode,
                            requestMethod: requestMethod,
                            referrer: referrer,
                            headers: headers,
                            resourceType: resourceType
                        };
                        return loadFailed(error);
                    }
                }
            }
        });
        webContents.on('did-get-redirect-request', (event, oldURL, newURL, isMainFrame, httpResponseCode, requestMethod, referrer, headers) => {
            // console.log('redirect request' + Date.now() + ' ' + oldURL + ' redirect to ' + newURL + ' <' + httpResponseCode + '>');
            if (oldURL === url) {
                urlResponseHeaders = headers;
                webContents.stop();
                const error = {
                    errorType: 'handler-redirect',
                    status: status,
                    oldURL: oldURL,
                    newURL: newURL,
                    isMainFrame: isMainFrame,
                    httpResponseCode: httpResponseCode,
                    requestMethod: requestMethod,
                    referrer: referrer,
                    headers: headers
                };
                return loadFailed(error);
            }
        });
        webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
            const error = {
                errorType: 'did-fail-load',
                errorCode: errorCode,
                errorDescription: errorDescription,
                validatedURL: validatedURL,
                isMainFrame: isMainFrame,
                httpResponseCode: 500
            };
            return loadFailed(error);
        });
        webContents.on('will-navigate', (event, url) => {
            // console.log('will-navigate ' + url);
            clearTimeout(returnTimer);
        });
        webContents.on('did-finish-load', () => {
            // console.log('did-finish-load');
            // 获取document
            const js = `(function(){ 
                var data = {
                    // title: document.title,
                    url: document.URL,
                    // cookies: document.cookie,
                    body: document.body.innerHTML,
                }
                return data;
            })()`;
            let executeTimer = setTimeout(() => {
                const error = {
                    errorType: 'execute-timeout',
                    url: url,
                    timeout: settings.executeTimeout,
                    httpResponseCode: 504
                };
                clearTimeout(returnTimer);
                return loadFailed(error);
            }, settings.executeTimeout);

            webContents.executeJavaScript(js, true)
                .then((result) => {
                    clearTimeout(executeTimer);
                    // console.log('will return at ' + settings.returnTimeout);
                    // 延时返回 针对will-navigate
                    returnTimer = setTimeout(() => {
                        result.httpResponseCode = 200;
                        return loadSucceed(result);
                    }, settings.returnTimeout);
                });
        });
        // 获取session
        const ses = win.webContents.session;

        // 清理session
        if (settings.clearStorageData) {
            settings.clearStorageData.origin = settings.clearStorageData.origin || url;
            if (settings.clearStorageData.storages) {
                ses.clearStorageData(settings.clearStorageData, () => {
                    // console.log('Clear storage data succeed in ' + settings.clearStorageData.origin);
                });
            }
        }
        // 设置cookies
        if (settings.cookies) {
            settings.cookies.details = settings.cookies.details || [];
            for (let cookie of settings.cookies.details) {
                cookie.url = url;
                ses.cookies.set(cookie, (error) => {
                    if (error) {
                        const err = {
                            errorType: 'set-cookie-error',
                            error: error,
                            cookie: cookie,
                            httpResponseCode: 406
                        };
                        return loadFailed(err);
                    }
                });
            }
        }
        // 设置proxy
        if (settings.proxy) {
            ses.setProxy({ proxyRules: settings.proxy }, () => { });
        }
        // 加载URL
        webContents.loadURL(url, settings.contents);
        // 设置超时
        fetchTimer = setTimeout(() => {
            const error = {
                errorType: 'fetch-timeout',
                url: url,
                timeout: settings.fetchTimeout,
                httpResponseCode: 504
            };
            return loadFailed(error);
        }, settings.fetchTimeout);
    }));
};

