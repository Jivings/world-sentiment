var twitter = require('twitter');
var util    = require('util');
var request = require('superagent');
var EventEmitter  = require('events').EventEmitter;

var twit = new twitter({
  consumer_key        : 'eKa3H9FPj52wm9V2USB4Q',
  consumer_secret     : 'hC3VAqRqJZ4v07wRoEW5Ro6XSWjK3Fh4i71decoGiqA',
  access_token_key    : '381717505-AWHdQPKLmTSPJ3g32cz04aqzzPM6NxB5tkR3bFXT',
  access_token_secret : 'y8WAQXRy83RFcaL3UoGZYROrUSmjCgoQyZpkRBm7Q'
});

var SentimentStream = function() {};
SentimentStream.prototype = Object.create(EventEmitter.prototype);
SentimentStream.prototype.start = function() {

  var that = this;

  twit.stream('statuses', 'filter', function (stream) {
  console.log('Streaming!');  
  // that.on('stop', stream.destroy);
  
  stream.on('data', function(data) {
    console.log('data!', data);  
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
        that.emit('sentiment', data[index])
      };
      
    });

  });

});
}

var stream = new SentimentStream();



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



module.exports = stream;