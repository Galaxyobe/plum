const ChromeHeadlessFetcher = require('../fetcher/chrome');

const fetcher = ChromeHeadlessFetcher();

let settings = {
    images: false,
    stealth: true,
    fetchTimeout: 90000,
    returnTimeout: 10000,
    contents: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
        headers: { pragma: 'no-cache' }
    },
    policy: {
        handlerReturn: true,
        handlerHttpCode: [403, 503]
    }
};

let url = 'https://booking.airasia.com/Flight/Select?o1=PEK&d1=AKL&culture=zh-CN&dd1=2017-06-30&dd2=2017-06-30&r=true&ADT=1&CHD=1&inl=1&s=true&mon=true&cc=CNY&c=false';
// url = 'https://www.baidu.com';

const start = Date.now();
fetcher.fetch(url, settings).then(data => {
    console.log(JSON.stringify(data));
    console.log('fetch ' + url + ' <' + data.httpResponseCode + '> use: ' + (Date.now() - start) / 1000 + 's');
}).catch(err => {
    console.error(JSON.stringify(err));
    console.log('fetch ' + url + ' <' + err.httpResponseCode + '> use: ' + (Date.now() - start) / 1000 + 's');
});
