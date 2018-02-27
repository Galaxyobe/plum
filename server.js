const restify = require('restify');
const Config = require('./config');


var server = restify.createServer({
    name: 'fetch app',
    version: '0.1.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


if (Config.fetcher.ElectronFetcher) {
    const electronFetcher = require('./routes/electron');
    server.post('/electron/fetch', electronFetcher.fetch);
}

if (Config.fetcher.ChromeHeadlessFetcher) {
    const chromeFetcher = require('./routes/chrome');
    server.post('/fetch', chromeFetcher.fetch);
    server.post('/chrome/fetch', chromeFetcher.fetch);
}

if (Config.fetcher.PhantomFetcher) {
    const phantomFetcher = require('./routes/phantom');
    server.post('/phantom/fetch', phantomFetcher.fetch);
}

server.get('/', function (req, res, next) {
    res.send(server.name);
    return next();
});

server.listen(3003, function () {
    console.log('%s listening at %s\nfetcher: %s', server.name, server.url, JSON.stringify(Config.fetcher));
});

module.exports = server;
