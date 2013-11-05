var twitter = require('ntwitter');
var request = require('superagent');
var EventEmitter  = require('events').EventEmitter;

var twit = new twitter({
  consumer_key        : 'HiWU3MGrJynSKD8O9jLO6g',
  consumer_secret     : '2e8r8LUo9h5LxpsX7wLakIwp2VErt7v5Jj5H3sM',
  access_token_key    : '381717505-vjKL753yL3B1aIzxCDqACK6OpKowF6MB41mdVBT8',
  access_token_secret : 'mk3UY1k1Gm7quk8dgrP4Kk554cW4k2KBZDgZtkCIboc'
});

var TweetStreamer = function(){};
TweetStreamer.prototype = Object.create(EventEmitter.prototype);


TweetStreamer.prototype.stream = function() {
	var that = this;

	twit.stream('statuses/filter', {'locations':'-180,-90,180,90'}, function(stream) {
		that.on('stop', stream.destroy);
	  stream.on('data', function (data) {
	    processTweet(data, function (tweets) {
	    	that.emit('sentiment', tweets)
	    })
	  });
	});
};



function processTweet(data, emit) {
	var tweet = {
	  time : data.created_at,
	  id   : data.id,
	  text : data.text,
	  hashtags : data.entities && data.entities.hashtags || [],
	  retweet_count : data.retweet_count,
	  geo : {
	    geo : data.geo,
	    coords : data.coords,
	    place : data.place
	  },        
	  connections : {}
	};


	if ( typeof data.user !== 'undefined' ) {
    tweet.user = {
      id : data.user.id,
      name : data.user.name,
      followers : data.user.followers_count,
      screen_name : data.user.screen_name
    };
  };
  if ( typeof data.retweeted_status !== 'undefined' ) {
    tweet.connections.retweeted_from = {
      id : data.retweeted_status.user.id,
      name : data.retweeted_status.user.name,
      screen_name : data.retweeted_status.user.screen_name
    };
  };
  if ( data.entities && data.entities.user_mentions.lenth > 0 ) {
    tweet.connections.mentions = data.entities.user_mentions;
  };
  
  getSentiment(tweet, function (data) {
    console.log('Got sentiment!')
    
    
    for(var index in data) {
      console.log(data[index].polarity);
      emit(data[index]);
    };
    
  });
}

var batched = [];
var batchSize = 20;
var sentimentUrl = 'http://www.sentiment140.com/api/bulkClassifyJson';

var getSentiment = function(tweet, callback) {
  var coords = (function () {
    if (tweet.geo.coords) return tweet.geo.coords;
    else if (tweet.geo.geo) return tweet.geo.geo.coordinates;
    else return 0;
  }());

  batched.push({
    id: batched.length,
    text: tweet.text,
    tweet: tweet,
    geo: coords
  });

  if (batched.length === batchSize) {
    console.log('Getting sentiment');
    
    var data = {
      data: batched
    };
    
    request
      .post('http://www.sentiment140.com/api/bulkClassifyJson')
      .send(data)
    .end(function (res) {
      if (res.ok) {
        callback(res.body.data);
      }
      else {  
        console.error('Error with getting sentiments', res.text);
      }
    });

    console.log('Reset batch');
    batched = [];
  };


};



module.exports = TweetStreamer;