myApp.controller('HomeController', function($scope, $location) {
	var headline = 'Welcome to our Messages manager Application!';
    var jumboLine1 = 'This app provide you the tools for managing your messages system with easy adding, editing and removing messages content.'; 
	var jumboLine2 = 'Preview how your messages will be displayed in the real stations.'; 
	$scope.headline = headline;
    $scope.jumboLine1 = jumboLine1;
	$scope.jumboLine2 = jumboLine2;	
});	

myApp.controller('NavbarController', ['$scope','$rootScope','$location',function($scope, $rootScope,$location) {
	$rootScope.showNav = true;
	var appTitle = 'Messages Application';
    $scope.appTitle = appTitle;
    $scope.highlight = function (path) {
		return $location.path().substr(0, path.length) == path;
    };
	$scope.isActive = function(viewLocation) {
		return viewLocation === $location.path();
	};
	$scope.authors = "Elad Doocker, Gal Sosin & Guy Ben-Shahar"
}]);

myApp.controller('MessagesController', ['$scope', 'socketFactory', 'modalService', function ($scope, socketFactory, modalService) {
	$scope.messages = [];
    socketFactory.emit('getAllMessages', null);
    socketFactory.on('sendAllMessages', function(res) {
        $scope.messages = res;
		socketFactory.initMsgDates($scope.messages);
    });
	$scope.deleteMessage = function (msgName) {
		var modalOptions = {
			closeButtonText: 'Cancel',
			actionButtonText: 'Delete Message',
			headerText: 'Delete ' + msgName + '?',
			bodyText: 'Are you sure you want to delete this message?'
		};
		modalService.showModal({}, modalOptions).then(function(result) {
			if (result === 'ok') {
				socketFactory.emit('deleteMessage', msgName);
				socketFactory.on('DeleteSuccessed', function(unUsed) {
					for (var i = 0; i < $scope.messages.length; i++) {
						if ($scope.messages[i].name == msgName) {
							$scope.messages.splice(i, 1);
							break;
						}
					}
				});
			}
		});
    };
}]);

myApp.controller('StationsController', ['$scope', 'socketFactory', '$timeout', function($scope, socketFactory, $timeout) {
    $scope.stationsArray = [];
	$scope.msgArray = [];
	$scope.date, $scope.stationId;	
	$scope.displayStation = function() {
		$scope.stationId = $scope.stationId.trim();
		$scope.stationId = $scope.stationId.substring($scope.stationId.length-1, $scope.stationId.length);
		$scope.address = "#/preview/" + $scope.date + "/" + $scope.stationId;
	}
	socketFactory.emit('getStations', null);
	socketFactory.on('sendStations', function(res) {
		res.sort(function(a, b){return a-b});
		for (var i=0; i<res.length; i++) {
			$scope.stationsArray[i] = res[i];
		}
	});
}]);

myApp.controller('StationsPreviewController',['$routeParams','$scope','$timeout','socketFactory',function($routeParams,$scope,$timeout,socketFactory) {
	socketFactory.setNav(false);
	$scope.date = $routeParams.Date;
	$scope.id = $routeParams.StationId;
	$scope.template,$scope.text = [],$scope.images = [];
	msgNum = 0, MsgTime = 0, countFrames = 0;
	CheckForDivText = false;
	var msgArray = [];
	var curTime;
	socketFactory.emit('sendId',parseInt($scope.id));
	socketFactory.emit('getMessagesByScreen', $scope.id);
	socketFactory.on('sendMessages', function(result) {
		if (result != undefined) {
			msgArray = result;
			socketFactory.initMsgDates(msgArray);
			RunAds();
		}
	});
	socketFactory.on('messageUpdate', function(newMsg) {
		if (newMsg != undefined) {
			msgArray.push(newMsg);
			socketFactory.initMsgDates(msgArray);
			RunAds();
		}
	});
		RunAds = function() {	
			if (curTime == undefined)
				curTime = new Date ($scope.date);
			CheckIfFindAd = false;
			CheckDays = false;
			while (CheckIfFindAd == false) {
				if (msgNum >= msgArray.length) {
					msgNum = 0;
					MsgTime = 0;
					CheckIfFindAd = true;
					continue;
				}
				for (var i=0; i<msgArray[msgNum].timeFrame.length; i++) {
					if (curTime >= msgArray[msgNum].timeFrame[i].startDate && curTime <= msgArray[msgNum].timeFrame[i].endDate) {
							for (var j=0; j<msgArray[msgNum].timeFrame[i].days.length; j++) {
								if (curTime.getDay() == msgArray[msgNum].timeFrame[i].days[j]){
									CheckDays = true;
									socketFactory.setInLocalStorage("map",msgArray[msgNum].name);
									$scope.template = msgArray[msgNum].template;
									if (CheckForDivText == true) {
										CheckForDivText = false;
										$scope.text = [];
										$scope.images = [];
									}
									
									for (var k=0; k<msgArray[msgNum].text.length; k++) {
											$scope.text[k] = msgArray[msgNum].text[k];
									}
									if (msgArray[msgNum].images.length > 0) {
										for (var k=0; k<msgArray[msgNum].images.length; k++) {
											$scope.images[k] =  msgArray[msgNum].images[k];
										}
									}
									CheckForDivText = true;
									MsgTime = msgNum;
									CheckIfFindAd = true;
									break;
								}
							}
							if (CheckDays != true){
								countFrames++;
							}
					} else {
						countFrames++;
					}
				}
				if (CheckIfFindAd) {
					countFrames = 0;
					var tempCount = msgNum;
					msgNum++;
				} else {
					var tempCount = msgNum;
				}
				if (countFrames >= msgArray[tempCount].timeFrame.length ) {
					msgNum++;
					countFrames = 0;
				}
			}
			$timeout(RunAds, msgArray[0].msgTime);
		}
}]);

myApp.controller('EditMessageController', ['$scope', '$routeParams', 'socketFactory', '$location', 'modalService', function($scope, $routeParams, socketFactory, $location, modalService) {
	var msgEdit = $routeParams.msgName;
	$scope.title = ($routeParams.msgName == 'NULL') ? 'Add' : 'Edit'
	$scope.newMsg = false;
	$scope.message, $scope.sendToServer;
	$scope.buttonText = 'Save Changes';
	$scope.cancelButton = "Cancel";
	$scope.optionDays = [];
	var initOptionDays = function(message) {
		for (var i=0; i < message.timeFrame.length; i++) {
			$scope.optionDays[i] = [
				{day:'Sunday', flag: false}, {day:'Monday', flag: false}, {day:'Tuesday', flag: false},
				{day:'Wednesday', flag: false}, {day:'Thursday', flag: false}, {day:'Friday', flag: false}, {day:'Saturday', flag: false}
			];
			for (var j=0; j<message.timeFrame[i].days.length; j++) {
				$scope.optionDays[i][message.timeFrame[i].days[j]].flag = true;
			}
		}
	};
	if (msgEdit != 'NULL') {
		socketFactory.emit('getMessage', msgEdit);
		socketFactory.on('sendMessage', function(res) {
			$scope.message = res[0];
			socketFactory.initMsgDates($scope.message);
			$scope.screensSize = $scope.message.screensId.length;
			initOptionDays($scope.message);
		});
	} else {
		$scope.newMsg = true;
		$scope.message = {"screensId":[1],
		"name":"",
		"text":[],
		"images":[],
		"template":"",
		"msgTime": 0,
		"timeFrame":[
			{ "startDate" : new Date(), "endDate" : new Date(), "days" : [], "startTime" : 0, "endTime" : 0}]};
		initOptionDays($scope.message);
	}
	var saveDays = function() {
		for (var i=0; i < $scope.message.timeFrame.length; i++) {
			$scope.message.timeFrame[i].days = [];
			for (var j=0; j < $scope.optionDays[i].length; j++) {
				if ($scope.optionDays[i][j].flag)
					$scope.message.timeFrame[i].days.push(j);
			}
		}
	};
	$scope.saveAdd = function() {
		saveDays();
		$scope.editToServer = angular.copy($scope.message);
		$scope.convertDateToArr($scope.editToServer);
		if (msgEdit != $scope.message.name) {
			socketFactory.emit('isValidName', $scope.editToServer);
			socketFactory.on('checkName', function(res) {
				if (res == "Message name is already exist. Please choose different name.") {
					var modalOptions = {
						actionButtonText: 'ok',
						headerText: 'Error saving',
						bodyText: res
					};
					modalService.showModal({}, modalOptions).then(function(result) {
						if (result === 'ok') {
							$scope.navigate('/messages');
						}
					});
				} else {
					saveEditedMsg();
				}
			});
		} else {
			saveEditedMsg();
		}
	};
	var saveEditedMsg = function() {
		socketFactory.emit('EditMessage', [$scope.editToServer, msgEdit]);
		socketFactory.on('EditFinished', function(res) {
			if (res == "Changes saved") {
				var modalOptions = {
				actionButtonText: 'ok',
				headerText: res + '!',
				bodyText: 'Press ok to finish'
				};
				modalService.showModal({}, modalOptions).then(function(result) {
					if (result === 'ok') {
						$scope.navigate('/messages');
					}
				});
			}
		});
	};
	$scope.save = function() {
		saveDays();
		$scope.sendToServer = angular.copy($scope.message);
		$scope.convertDateToArr($scope.sendToServer);
		modalOptions = {
				closeButtonText: 'Cancel',
				actionButtonText: 'ok',
				headerText: 'Save New Message',
				bodyText: ''
		};
		socketFactory.emit('saveNewMessage',$scope.sendToServer);
		socketFactory.on('updateNewMessage', function(res) {
			modalOptions.bodyText = res;
			if (res == "Message name is already exist. Please choose different name."){
				modalService.showModal({}, modalOptions).then(function(result) {
					if (result === 'Cancel') {
						$scope.navigate('/messages');
					}
				});
			} else {
				modalService.showModal({}, modalOptions).then(function(result) {
					if (result === 'ok' || result === 'Cancel') {
						$scope.navigate('/messages');
					}
				});
			}
		});
	};
	$scope.navigate = function(url) {
            $location.path(url);
    };
	$scope.convertDateToArr = function(msg){
		for (var i=0;i<msg.timeFrame.length;i++){
			msg.timeFrame[i].startDate = [msg.timeFrame[i].startDate.getFullYear(),msg.timeFrame[i].startDate.getMonth(),msg.timeFrame[i].startDate.getDate()];
			msg.timeFrame[i].endDate = [msg.timeFrame[i].endDate.getFullYear(),msg.timeFrame[i].endDate.getMonth(),msg.timeFrame[i].endDate.getDate()];
		}
	};
	$scope.addStation = function(station) {
        $scope.message.screensId.push(parseInt(station));
    };
	$scope.deleteScreen = function(screen) {
		var temp = [];
		for (var i=0; i < $scope.message.screensId.length; i++) {
			if ($scope.message.screensId[i] != screen)
				temp.push($scope.message.screensId[i])
		}
		$scope.message.screensId = temp
	};
	$scope.addText = function(str) {
        $scope.message.text.push(str);
    };
	$scope.deleteText = function(str) {
		var temp = [];
		for (var i=0; i < $scope.message.text.length; i++) {
			if ($scope.message.text[i] != str)
				temp.push($scope.message.text[i])
		}
		$scope.message.text = temp
	};
	$scope.addImage = function(img) {
		$scope.message.images.push(img);
	}
	$scope.deleteImage = function(image) {
        var temp = [];
		for (var i=0; i < $scope.message.images.length; i++) {
			if ($scope.message.images[i] != image)
				temp.push($scope.message.images[i])
		}
		$scope.message.images = temp
    };
	$scope.addTimeFrame = function() {
		var tempTimeFrame = {"startDate" : new Date(), "endDate" : new Date(), "days" : [""], "startTime" : 0, "endTime" : 23}
		$scope.message.timeFrame.push(tempTimeFrame);
		$scope.optionDays.push([
				{day:'Sunday', flag: false}, {day:'Monday', flag: false}, {day:'Tuesday', flag: false},
				{day:'Wednesday', flag: false}, {day:'Thursday', flag: false}, {day:'Friday', flag: false}, {day:'Saturday', flag: false}
		]);
	};
	$scope.deleteTimeFrame = function(time) {
		var temp = [];
		for (var i=0; i < $scope.message.timeFrame.length; i++) {
			if (i != time)
				temp.push($scope.message.timeFrame[i])
		}
		$scope.message.timeFrame = temp
	};
	$scope.updateCounters = function(changed){
		if (changed=='t'){
			$scope.txtSize++;
		}
		else{
			$scope.imgSize++;
		}
	}
	$scope.ConvertToInt = function(changed, parentIndex, index) {
		if (changed == 'sc') {
			$scope.message.screensId[index] = parseInt($scope.message.screensId[index]);
			$scope.screensSize++;
		} else if (changed == 'd') {
			$scope.message.timeFrame[parentIndex].days[index] = parseInt($scope.message.timeFrame[parentIndex].days[index]);
		} else if (changed == 'st') {
			$scope.message.timeFrame[index].startTime = parseInt($scope.message.timeFrame[index].startTime);
		} else if (changed == 'mst') {
			$scope.message.msgTime = parseInt($scope.message.msgTime);
		} else {
			$scope.message.timeFrame[index].endTime = parseInt($scope.message.timeFrame[index].endTime);
		}
	};
	$scope.convertDays = function(index) {
		var temp = []; 
		var tempDays = [];
		temp = String($scope.message.timeFrame[index].days).split(",");
		for (var i=0;i<temp.length;i++) {
			tempDays[i] = parseInt(temp[i]);
		}
		$scope.message.timeFrame[index].days = tempDays;
	};
}]);

myApp.controller('StatisticsController', ['$scope', 'socketFactory','$rootScope', function($scope, socketFactory,$rootScope) {
	socketFactory.emit('getTemplateStatistics', null);
	socketFactory.on('sendTemplateStatistics', function(result) {
		var data = result;
		var tempGraph2 = {
			chart: {
				caption: "Templates",
				subcaption: "Analize the number of messages that have been using each template",
				startingangle: "120",
				showlabels: "0",
				showlegend: "1",
				enablemultislicing: "0",
				slicingdistance: "15",
				showpercentvalues: "1",
				showpercentintooltip: "0",
				plottooltext: "",
				theme: "fint"
			},
			data
		};
		localStorage.setItem("graph2", JSON.stringify(tempGraph2));
	});
	$scope.graph2 = JSON.parse(localStorage.getItem("graph2"));
	var map = socketFactory.getFromLocalStorage("map");
	var mapKeys = Object.keys(map);
	data = [];
	for (var i=0;i<mapKeys.length;i++) {
		var temp = {label: mapKeys[i], value: map[mapKeys[i]]};
		data.push(temp);
	}
	$scope.graph1 = {
				chart: {
					caption: "Messages Views",
					subCaption: "Display the amount of previews for each message",
					numberPrefix: "",
					theme: "ocean"
				},
				data
			};
	
}]);

myApp.controller('AboutController', ['$scope', function($scope) {
	$scope.map = { center: { latitude: 31, longitude: 34 }, zoom: 8 };
	$scope.code = 'unf6pIaLQY4';
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var x = canvas.width / 2 +23;
    var y = canvas.height / 2 -30;
    var text = 'An app based on web technolgy That gives a comftorble interface for commercials.';
	context.font = "bold 16px Arial";
	context.textAlign = "center";
	context.fillText(text, x, y);
}]);