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
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-09&dd1=2017-06-09&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-09 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-10&dd1=2017-06-10&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-10 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-11&dd1=2017-06-11&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-11 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-12&dd1=2017-06-12&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-12 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-13&dd1=2017-06-13&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-13 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-14&dd1=2017-06-14&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-14 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-15&dd1=2017-06-15&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-15 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-16&dd1=2017-06-16&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-16 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-17&dd1=2017-06-17&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-17 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-18&dd1=2017-06-18&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-18 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-19&dd1=2017-06-19&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-19 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-20&dd1=2017-06-20&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-20 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-21&dd1=2017-06-21&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-21 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-22&dd1=2017-06-22&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-22 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-23&dd1=2017-06-23&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-23 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-24&dd1=2017-06-24&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-24 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-25&dd1=2017-06-25&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-25 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-26&dd1=2017-06-26&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-26 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-27&dd1=2017-06-27&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-27 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-28&dd1=2017-06-28&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-28 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-29&dd1=2017-06-29&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-29 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-06-30&dd1=2017-06-30&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-06-30 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-01&dd1=2017-07-01&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-01 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-02&dd1=2017-07-02&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-02 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-03&dd1=2017-07-03&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-03 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-04&dd1=2017-07-04&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-04 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-05&dd1=2017-07-05&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-05 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-06&dd1=2017-07-06&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-06 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-07&dd1=2017-07-07&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-07 23:59:59
    'https://booking.airasia.com/Flight/Select?ADT=1&CHD=1&cc=CNY&dd2=2017-07-08&dd1=2017-07-08&inl=1&culture=en-GB&s=false&r=true&mon=true&o1=CAN&d1=DEL', //  2017-07-08 23:59:59
];

urls.forEach(url => {
    setTimeout(() => {
        const start = Date.now();
        electron.fetcher(url, settings).then(datas => {
            // console.log('datas:' + JSON.stringify(datas));
            console.log('datas:' + datas.title);
            console.log('fetch ' + url + ' use: ' + (Date.now() - start) / 1000 + 's');
        }).catch(err => {
            console.log(JSON.stringify(err));
            console.log('fetch ' + url + ' use: ' + (Date.now() - start) / 1000 + 's');
        });
    }, Math.ceil(Math.random() * 1000));
});

