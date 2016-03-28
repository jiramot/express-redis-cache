'use strict';

const path = require('path');
const bluebird = require('bluebird');
const redis = require("redis")
const _ = require('lodash');

bluebird.promisifyAll(redis.RedisClient.prototype);

function RedisCache(){
  var globalOptions = {
    port: 6379,
    host: 'localhost'
  };

  var isConnected = false;

  this.options = function(options) {
    if (options) {
      _.extend(globalOptions, options);
      return this;
    } else {
      return globalOptions;
    }
  };

  var isConnected = false;

  var client = connect()
    .on('error', console.log)
    .on('end', connect)
    .on('ready', ready)

  function ready(){
    console.log("redis is ready")
    isConnected = true;
  }

  function connect(){
    console.log("redis trying to connect");
    isConnected = false;
    return redis.createClient(globalOptions);
  }

  this.middlewares = function(options){
    options = options || {};

    return function(req, res, next){
      if(req.method != 'GET'){
        return next();
      }

      var key = req.url;

      client.getAsync(key)
        .then(function(cache){
          if( cache != null ){
            res.setHeader("X-Cached", "HIT");
            return res.send(JSON.parse(cache));

          }else{
            res.realSend = res.send;
            res.send = function(a, b) {
              var data = !_.isUndefined(b) ? b : (!_.isNumber(a) ? a : null);
              client.set(key, data);
              client.EXPIRE(key, options.ttl); // in 15 minute.
              return res.realSend(data);
            };
            next()
          }
        })

      }
  }
}
module.exports = new RedisCache();
