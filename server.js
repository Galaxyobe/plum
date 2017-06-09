const restify = require('restify');
const routes = require('./routes');

var server = restify.createServer({
    name: 'fetch app',
    version: '0.1.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.get('/', function (req, res, next) {
    res.send(server.name);
    return next();
});

server.post('/fetch', routes.fetch);

server.listen(3003, function () {
    console.log('%s listening at %s', server.name, server.url);
});

module.exports = server;
