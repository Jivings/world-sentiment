var express = require('express'),
		http = require('http');
    io = require('socket.io'),
    path = require('path'),
    tweetStream = require('./main');



var app = express();


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// app.get('/', function (req, res) {
//   res.sendfile(__dirname + '/index.html');
// });

// app.get('/client.js', function (req, res) {
// 	res.sendfile(__dirname + '/client.js');
// });

// app.get('/styles.css', function (req, res) {
// 	res.sendfile(__dirname + '/styles.css');
// });



var server = http.createServer(app);
var sock = io.listen(server);

sock.sockets.on('connection', function (socket) {
	tweetStream.on('sentiment', function (tweets) {
		socket.emit('sentiment', tweets);
	});
	tweetStream.start();
});

sock.sockets.on('stop', function (socket) {
	tweetStream.stop();
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
