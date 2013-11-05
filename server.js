var express 		= require('express'),
		http 				= require('http');
    io 					= require('socket.io'),
    path 				= require('path'),
    tweetStream = require('./tweetStream'),
		app 				= express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
		sock = io.listen(server);

sock.sockets.on('connection', function (socket) {
	var tweets = new tweetStream();
	tweets.on('sentiment', function (data) {
	  console.log(data);
	  socket.emit('sentiment', data);
	});

	tweets.stream();
	setTimeout(function () { console.log('Stopped stream'); tweets.emit('stop')}, 30000);
});
// tweetStream.start();
// sock.sockets.on('connection', function (socket) {
//tweetStream.on('sentiment', function (tweets) {
// 		console.log(tweets)
// 		socket.emit('sentiment', tweets);
// 	});
// 	tweetStream.start();
// });

// sock.sockets.on('stop', function (socket) {
// 	console.log('stop')
// 	// tweetStream.stop();
// });

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
