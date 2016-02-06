var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile('/root/apps/sense/index.html');
});

http.listen(80, function() {
   console.log('listening on *:80');
});

var nodeimu = require('./node_modules/nodeimu/out/NodeIMU');
var Rx = require('rx');
var Promise = require('q');
var util = require('util')
var IMU = new nodeimu.IMU();



var print_vector3 = function(name, data) {
  var sx = data.x >= 0 ? ' ' : '';
  var sy = data.y >= 0 ? ' ' : '';
  var sz = data.z >= 0 ? ' ' : '';
  return util.format('%s: %s%s %s%s %s%s ', name, sx, data.x.toFixed(4), sy, data.y.toFixed(4), sz, data.z.toFixed(4));
}

var timer$ = Rx.Observable.timer(0, 500);

var value$ = timer$.flatMap(function(){
	var deferred = Promise.defer();
	 IMU.getValue(function(e, data){
		deferred.resolve({e:e, data: data});
	 });
	return Rx.Observable.fromPromise(deferred.promise);
});//.filter(function(obj) { return obj.e == undefined });

value$.subscribe(function(obj){
	//console.log(print_vector3('Gyro', obj.data.gyro));
	io.emit('data', obj.data);
});


