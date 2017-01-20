var express = require('express');
var app = express();
var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({store: 'memory', max: 100, ttl: 60/*seconds*/});
var request = require('request');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/put', function (req, res) {
  if(req.query.id && req.query.url ) {
    var decodedUrl = decodeURIComponent(req.query.url);
    console.log(decodedUrl);
    makeRequest(decodedUrl, req.query.id );
    res.send('ok');
  }
  else{
    //malformed request
    res.sendStatus(400);
  }
});

app.get('/get', function (req, res) {
  if(req.query.id) {
    memoryCache.get(req.query.id, function(err, urlCache) {
      if(err) {
        console.log(err);
        res.sendStatus(500);
      }
       if(urlCache) {
         if(urlCache.contentType) {
           res.header('Content-Type', urlCache.contentType);
         }
         res.send(urlCache.content);
       }
       else{
         res.send('no data found');
       }
    });
  }
  else{
    //malformed request
    res.sendStatus(400);
  }
});

app.listen(3001, function () {
  console.log('Video app listening on port 3001!');
});

function UrlCache(content, contentType) {
  this.content = content;
  this.contentType = contentType;
}

function makeRequest(url, id) {
  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
    }
  };
  request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    urlItem = new UrlCache(body, response.headers['content-type']);
    memoryCache.set(id, urlItem);
  }
});
}
