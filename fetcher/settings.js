module.exports = {
    save: {
        // saveToPdf: true,
        // saveToPdfPath: 'pdf'
        // saveToHtml: true,
        // saveToHtmlType: 'HTMLOnly', // HTMLOnly/HTMLComplete/MHTML
        // saveToHtmlPath: 'html'
    },
    fetchTimeout: 60000,
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
