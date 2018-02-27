const { app } = require('electron');  // 控制应用生命周期的模块。
const { BrowserWindow } = require('electron');  // 创建原生浏览器窗口的模块
const _ = require('lodash');
const fs = require('fs');


// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window 会被自动地关闭
var mainWindow = null;
// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function () {
    // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
    // 应用会保持活动状态
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// 当 ElectronFetcher 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on('ready', function () {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({ width: 800, height: 600, show: true });

    // 打开开发工具
    mainWindow.openDevTools();
    // 当 window 被关闭，这个事件会被发出
    mainWindow.on('closed', function () {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 但这次不是。
        mainWindow = null;
    });

    const webContents = mainWindow.webContents;

    webContents.on('did-get-response-details', (event, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) => {
        console.log(originalURL + ' <' + httpResponseCode + '>');
    });
    webContents.on('dom-ready', (event) => {
        console.log('dom-ready');
        const js = `(function(){ 
            var data = {
                title: document.title,
                url: document.URL,
                // body: document.body.innerHTML,
            }
            return data;
        })()`;
        webContents.executeJavaScript(js, true)
            .then((result) => {
                console.log(result); // Will be the JSON object from the fetch call
            });
    });
    webContents.on('did-finish-load', function () {
        console.log('did-finish-load');
        var details = Object.assign({
            url: webContents.getURL()
        });

        webContents.session.cookies.get(details, function (error, cookies) {
            if (error) return console.log(error);
            // console.log(cookies);
        });
        // Use default printing options
        // webContents.printToPDF({}, function (error, data) {
        //     if (error) throw error;
        //     fs.writeFile('./print.pdf', data, function (error) {
        //         if (error) {
        //             throw error;
        //         }
        //         console.log('Write PDF successfully.');
        //     });
        // });
        // webContents.savePage('./test.html', 'HTMLComplete', function (error) {
        //     if (!error) {
        //         console.log('Save page successfully');
        //     }
        //     app.exit();
        // });

    });
    // const url = 'https://booking.airasia.com/Flight/Select?o1=PEK&d1=AKL&culture=zh-CN&dd1=2017-06-30&dd2=2017-06-30&r=true&ADT=1&CHD=1&inl=1&s=true&mon=true&cc=CNY&c=false';
    const url = 'https://www.baidu.com';
    webContents.loadURL(url);

});

