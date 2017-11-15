var express = require("express");
var path = require("path");
var url = require("url");

var app = express(); // express.createServer();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname));

var MongoClient = require('mongodb').MongoClient
, format = require('util').format;

var insertMsg, Collection;
var socketMap = {};
var date;
var msgNum = 7;

var url = 'mongodb://127.0.0.1:27017/ads_db1';


MongoClient.connect(url, function(err, db) {
	if(err) 
		throw err;
	Collection = db.collection('messages');
	console.log("connected to DB...");

	insertMsg = function (saveJson) {
		console.log("Start Saving...");
		db.collection('messages').insertOne(saveJson,function(err,res){
			if (err) {
				console.log(err);
			}
		});
		console.log("Finish saving successfuly...");
	};
	removeMessages = function(msg, callback) {
		db.collection('messages').deleteMany(
			{ "name": msg }, 
			function(err, results) {
				console.log(results);
				callback();
			}
		);
	};
	updateMessage = function(msg) {
		db.collection('messages').update({"name": msg[1]},{$set:{name: msg[0].name,msgTime: msg[0].msgTime,template: msg[0].template,screensId: msg[0].screensId,text: msg[0].text,images: msg[0].images, timeFrame: msg[0].timeFrame}},{upsert: false});	
		
		var setMode = {$set: {}};
		for (var i=0;i<msg[0].timeFrame.length;i++){
			setMode.$set['timeFrame.' + i + '.startDate'] = msg[0].timeFrame[i].startDate;
			setMode.$set['timeFrame.' + i + '.endDate'] = msg[0].timeFrame[i].endDate;
			setMode.$set['timeFrame.' + i + '.days'] = msg[0].timeFrame[i].days;
			setMode.$set['timeFrame.' + i + '.startTime'] = msg[0].timeFrame[i].startTime;
			setMode.$set['timeFrame.' + i + '.endTime'] = msg[0].timeFrame[i].endTime;
			db.collection('messages').update({"name": msg[0].name},setMode);
			setMode = {$set: {}};
		}
	};
});

app.get("/TestUpdate", function(request, response) {
	var screenId = request.query.id;
	console.log("Updating station number: " + screenId);
	var newMsg = { 	
		"screensId":[parseInt(screenId)],
		"name":"msg6",
		"text":["Won the lottary?","Want to invest your money?","Shulberg investment company","Your money is important to us!"],
		"images":["http://thefilipinoexpat.com/wp-content/uploads/2015/11/04_investment.jpg"],
		"template":"/html/templateA.html",
		"msgTime":5000,
		"timeFrame":[
			{ "startDate" : [2016,0,1], "endDate" : [2016,11,31], "days" : [0,1,2,3,4,5,6], "startTime" : 6, "endTime" : 23},
			{ "startDate" : [2016,0,1], "endDate" : [2016,11,31], "days" : [5], "startTime" : 13, "endTime" : 20}]	}
	insertMsg(newMsg);
	if (socketMap[parseInt(screenId)] != undefined) {
		socketMap[parseInt(screenId)].emit('messageUpdate', newMsg);
	}
	response.send("SUCCESS!");
});

app.get("/screen=:screenNum", function(request, response) {
	response.sendFile(__dirname + '/station/station.html');
});

app.get("/preview", function(request, response) {
	date = request.params.date
	response.sendFile(__dirname + '/station/stationPreview.html');
});

app.get("/html/:template", function(request, response) {
	var template = request.params.template;
	response.sendFile(__dirname + '/station/' + template);
});

app.get("/*", function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
	socket.on('sendId', function(stationId) {
		socketMap[parseInt(stationId)] = socket;
	});
	socket.on('getMessagesByScreen', function(screenId) {
		res = [];
		Collection.find({"screensId":{'$eq': parseInt(screenId)}}).toArray(function(err, docs) {
			docs.forEach(function(doc) {
				res.push(doc);
			});
			console.log(res.length)
			socket.emit('sendMessages', res);
		});
	});
	socket.on('getAllMessages',function(unUsed) { // listen to get all messages, and in return, send "sendAllMessages"
		res = [];
		Collection.find().toArray(function(err, docs) {
			docs.forEach(function(doc) {
				res.push(doc);
			});
			socket.emit('sendAllMessages', res);
		});
	});
	socket.on('getMsgNum', function(unUsed) {
		socket.emit('sendMsgNum', msgNum);
		msgNum++;
	});
	socket.on('getMsgAmount', function(unUsed) {
		Collection.find().toArray(function(err, docs) {
			docs.forEach(function(doc) {
				res.push(doc);
			});
			socket.emit('sendMsgAmount', msgNum);
		});
	});
	socket.on('deleteMessage', function(msg) {
		removeMessages(msg, function() {
			socket.emit('DeleteSuccessed', null);
		});
	});
	socket.on('getMessage', function(msg) {
		Msg = [];
		Collection.find({"name":{'$eq': msg}}).toArray(function(err, docs) {
			docs.forEach(function(doc) {
				Msg.push(doc);
			});
			socket.emit('sendMessage', Msg);
		});
	});
	socket.on('getStations', function(unUsed) {
		Collection.distinct("screensId", function(err, stationsArray) {
			socket.emit('sendStations', stationsArray);
		});
	});
	socket.on('EditMessage', function(update) {
		updateMessage(update);
		socket.emit('EditFinished',"Changes saved");
	});
	socket.on('saveNewMessage', function(msg) {
		Collection.find({"name":{'$eq': msg.name}}).toArray(function(err, docs) {
			if (docs.length > 0) {
				socket.emit('updateNewMessage', "Message name is already exist. Please choose different name.");
			} else {
				insertMsg(msg);
				socket.emit('updateNewMessage', "Message saved successfully");
			}
		});
	});
	socket.on('getDate', function(unUsed) {
		console.log(date);
		socket.emit('sendDate', date);
	});
	socket.on('getCityStatistics', function(unUsed) {
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

		Collection.aggregate(
			[
			   { $group: { "_id": "$city", "total": { $sum: 1 } } }
			]
		).toArray(function(err, result) {
			data2 = [];
			for (var i=0; i < result.length; i++) {
					var temp = {label: result[i]._id, value: "" + result[i].total, color: getRandomColor()};
					data2.push(temp);
			}
			socket.emit('sendCityStatistics', data2);
		});
	});
	socket.on('isValidName', function(msg) {
		console.log(msg.name)
		Collection.find({"name":{'$eq': msg.name}}).toArray(function(err, docs) {
			if (docs.length > 0) {
				socket.emit('checkName', "Message name is already exist. Please choose different name.");
			} else {
				socket.emit('checkName', "Message saved successfully");
			}
		});
	});
});

server.listen(8080, function() {
	console.log("Messages Application Express node js server listening on port %d...", this.address().port);
});