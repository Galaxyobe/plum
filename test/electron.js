const Electron = require('../fetcher/electron');


var electron = Electron();


const settings = {
    save: {
        saveToPdf: true,
        saveToPdfPath: 'pdf'
        // saveToHtml: true,
        // saveToHtmlType: 'HTMLOnly', // HTMLOnly/HTMLComplete/MHTML
        // saveToHtmlPath: 'html'
    },
    fetchTimeout: 30000,
    executeTimeout: 30000,
    // proxy: 'http://127.0.0.1:8888',
    cookies: {
        // details: [
        //     { name: 'dummy_name', value: 'dummy' }
        // ]
    },
    clearStorageData: {
        storages: ['cookies', 'localstorage']
    },
    policy: {
        handlerReturn: true,
        handlerHttpCode: [403, 503]
    },
    stealth: true,
    openDevTools: false,
    window: {
        show: false,
        webPreferences: {
            images: false,
            webaudio: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    },
    contents: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
        extraHeaders: 'pragma: no-cache\n'
    }
};


let urls = [
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-08&dd1=2017-07-08&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-08 23:59:59
];

urls.forEach(url => {
    setTimeout(() => {
        const start = Date.now();
        electron.fetcher(url, settings).then(datas => {
            console.log('datas:' + JSON.stringify(datas));
            console.log('fetch ' + url + ' use: ' + (Date.now() - start) / 1000 + 's');
        }).catch(err => {
            console.log(JSON.stringify(err));
            console.log('fetch ' + url + ' use: ' + (Date.now() - start) / 1000 + 's');
        });
    }, Math.ceil(Math.random() * 1000));
});

