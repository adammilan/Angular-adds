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
		db.collection('messages').update({"name": msg[1]},{$set:{name: msg[0].name,msgTime: msg[0].msgTime,template: msg[0].template,screensId: msg[0].screensId,text: msg[0].text,images: msg[0].images, city: msg[0].city, lat: msg[0].lat, long: msg[0].long}},{upsert: false});
	};
});

app.get("/TestUpdate", function(request, response) {
	var screenId = request.query.id;
	console.log("Updating zipCode number: " + screenId);
	var newMsg = { 	
		"screensId":[parseInt(screenId)],
		"name":"msg6",
		"text":["Won the lottary?","Want to invest your money?","Shulberg investment company","Your money is important to us!"],
		"images":["http://thefilipinoexpat.com/wp-content/uploads/2015/11/04_investment.jpg"],
		"template":"/html/templateA.html",
		"msgTime":5000}
	insertMsg(newMsg);
	if (socketMap[parseInt(screenId)] != undefined) {
		socketMap[parseInt(screenId)].emit('messageUpdate', newMsg);
	}
	response.send("SUCCESS!");
});

app.get("/screen=:screenNum", function(request, response) {
	response.sendFile(__dirname + '/zipCode/zipCode.html');
});


app.get("/html/:template", function(request, response) {
	var template = request.params.template;
	response.sendFile(__dirname + '/zipCode/' + template);
});

app.get("/*", function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
	socket.on('sendId', function(zipCode) {
		socketMap[parseInt(zipCode)] = socket;
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
	socket.on('getZipCode', function(unUsed) {
		Collection.distinct("screensId", function(err, stationsArray) {
			socket.emit('sendZipCode', stationsArray);
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
    socket.on('getTemplateStatistics', function(unUsed) {
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
                { $group: { "_id": "$template", "total": { $sum: 1 } } }
            ]
        ).toArray(function(err, result) {
            data2 = [];
            for (var i=0; i < result.length; i++) {
                var temp = {label: result[i]._id, value: "" + result[i].total, color: getRandomColor()};
                data2.push(temp);
            }
            socket.emit('sendTemplateStatistics', data2);
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
    socket.on('getCoordinates', function(unUsed) {
        Collection.find().toArray(function(err, result) {
            data2 = [];
            for (var i=0; i < result.length; i++) {
                var temp = {id: i, coords: {
                    latitude: result[i].lat,
                    longitude: result[i].long
				}};
                data2.push(temp);
            }
            socket.emit('sendCoordinates', data2);
        });
    });
});

server.listen(8080, function() {
	console.log("Apartment Messages Application Express node js server listening on port %d...", this.address().port);
});