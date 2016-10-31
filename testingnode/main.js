var http = require('http');
var $ = require('NodObjC');

var port = 3042,
	host = 'localhost';

console.log('creating server: ');
var server = http.createServer(function(req, res) {
	// console.log('inside createserver call, req res: ', req, res);
	res.writeHead(200, {'Content-Type': 'application/json'});
	req.pipe(res);
});
console.log(server);

server.listen(port, host);
console.log('server listening');

console.log(`http://${host}:${port}`);