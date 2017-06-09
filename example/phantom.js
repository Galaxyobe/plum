const Phantom = require('../fetcher/phantom');


const pool = Phantom.newPool({
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


let settings = {
    render: true,
    proxy: 'http://127.0.0.1:8888',
    timeout: 10 * 1000,
    settings: {
        resourceTimeout: 1000, // ms
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
    }
};

let meta = {};
let url = 'https://booking.airasia.com/Flight/Select?o1=PEK&d1=AKL&culture=zh-CN&dd1=2017-06-30&dd2=2017-06-30&r=true&ADT=1&CHD=1&inl=1&s=true&mon=true&cc=CNY&c=false';
let start = Date.now();

// let url = 'http://www.baidu.com';

Phantom.fetcher(pool, url, settings, meta).then(result => {
    console.log('result: ' + JSON.stringify(result));
    console.log('use:' + (Date.now() - start) / 1000);
}).catch(err => {
    console.log('err: ' + err);
});

Phantom.freePool(pool);
