myApp.controller('HomeController', function($scope, $location) {
	var headline = 'Welcome to our Messages Ads Application!';
    var jumboLine1 = 'This app provide you the tools for managing your Message system with easy adding, editing and removing Messages content.';
	var jumboLine2 = 'Preview how your Messages will be displayed in the real stations.';
	$scope.headline = headline;
    $scope.jumboLine1 = jumboLine1;
	$scope.jumboLine2 = jumboLine2;	
});	

myApp.controller('NavbarController', ['$scope','$rootScope','$location',function($scope, $rootScope,$location) {
	$rootScope.showNav = true;
	var appTitle = 'Message Ads Application';
    $scope.appTitle = appTitle;
    $scope.highlight = function (path) {
		return $location.path().substr(0, path.length) == path;
    };
	$scope.isActive = function(viewLocation) {
		return viewLocation === $location.path();
	};
	$scope.authors = "Ben and Adam"
}]);

myApp.controller('MessagesController', ['$scope', 'socketFactory', 'modalService', function ($scope, socketFactory, modalService) {
	$scope.Messages = [];
    socketFactory.emit('getAllMessages', null);
    socketFactory.on('sendAllMessages', function(res) {
        $scope.Messages = res;
        socketFactory.initMsgDates($scope.Messages);
    });
	$scope.deleteMessage = function (msgName) {
		var modalOptions = {
			closeButtonText: 'Cancel',
			actionButtonText: 'Delete Message',
			headerText: 'Delete ' + msgName + '?',
			bodyText: 'Are you sure you want to delete this Message?'
		};
		modalService.showModal({}, modalOptions).then(function(result) {
			if (result === 'ok') {
				socketFactory.emit('deleteMessage', msgName);
				socketFactory.on('DeleteSuccessed', function(unUsed) {
					for (var i = 0; i < $scope.Messages.length; i++) {
						if ($scope.Messages[i].name == msgName) {
							$scope.Messages.splice(i, 1);
							break;
						}
					}
				});
			}
		});
    };
}]);

myApp.controller('EditMessageController', ['$scope', '$routeParams', 'socketFactory', '$location', 'modalService', function($scope, $routeParams, socketFactory, $location, modalService) {
	var msgEdit = $routeParams.msgName;
	$scope.title = ($routeParams.msgName == 'NULL') ? 'Add' : 'Edit'
	$scope.newMsg = false;
	$scope.Message, $scope.sendToServer;
	$scope.buttonText = 'Save Changes';
	$scope.cancelButton = "Cancel";
	$scope.optionDays = [];
	var initOptionDays = function(Message) {
		for (var i=0; i < Message.timeFrame.length; i++) {
			$scope.optionDays[i] = [
				{day:'Sunday', flag: false}, {day:'Monday', flag: false}, {day:'Tuesday', flag: false},
				{day:'Wednesday', flag: false}, {day:'Thursday', flag: false}, {day:'Friday', flag: false}, {day:'Saturday', flag: false}
			];
			for (var j=0; j<Message.timeFrame[i].days.length; j++) {
				$scope.optionDays[i][Message.timeFrame[i].days[j]].flag = true;
			}
		}
	};
	if (msgEdit != 'NULL') {
		socketFactory.emit('getMessage', msgEdit);
		socketFactory.on('sendMessage', function(res) {
			$scope.Message = res[0];
			socketFactory.initMsgDates($scope.Message);
			$scope.screensSize = $scope.Message.screensId.length;
			initOptionDays($scope.Message);
		});
	} else {
		$scope.newMsg = true;
		$scope.Message = {"screensId":[1],
		"name":"",
		"text":[],
		"images":[],
		"template":"",
		"msgTime": 0,
		"timeFrame":[
			{ "startDate" : new Date(), "endDate" : new Date(), "days" : [], "startTime" : 0, "endTime" : 0}]};
		initOptionDays($scope.Message);
	}
	var saveDays = function() {
		for (var i=0; i < $scope.Message.timeFrame.length; i++) {
			$scope.Message.timeFrame[i].days = [];
			for (var j=0; j < $scope.optionDays[i].length; j++) {
				if ($scope.optionDays[i][j].flag)
					$scope.Message.timeFrame[i].days.push(j);
			}
		}
	};
	$scope.saveAdd = function() {
		saveDays();
		$scope.editToServer = angular.copy($scope.Message);
		$scope.convertDateToArr($scope.editToServer);
		if (msgEdit != $scope.Message.name) {
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
							$scope.navigate('/Messages');
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
						$scope.navigate('/Messages');
					}
				});
			}
		});
	};
	$scope.save = function() {
		saveDays();
		$scope.sendToServer = angular.copy($scope.Message);
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
						$scope.navigate('/Messages');
					}
				});
			} else {
				modalService.showModal({}, modalOptions).then(function(result) {
					if (result === 'ok' || result === 'Cancel') {
						$scope.navigate('/Messages');
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
	$scope.addstation = function(station) {
        $scope.Message.screensId.push(parseInt(station));
    };
	$scope.deleteScreen = function(screen) {
		var temp = [];
		for (var i=0; i < $scope.Message.screensId.length; i++) {
			if ($scope.Message.screensId[i] != screen)
				temp.push($scope.Message.screensId[i])
		}
		$scope.Message.screensId = temp
	};
	$scope.addText = function(str) {
        $scope.Message.text.push(str);
    };
	$scope.deleteText = function(str) {
		var temp = [];
		for (var i=0; i < $scope.Message.text.length; i++) {
			if ($scope.Message.text[i] != str)
				temp.push($scope.Message.text[i])
		}
		$scope.Message.text = temp
	};
	$scope.addImage = function(img) {
		$scope.Message.images.push(img);
	}
	$scope.deleteImage = function(image) {
        var temp = [];
		for (var i=0; i < $scope.Message.images.length; i++) {
			if ($scope.Message.images[i] != image)
				temp.push($scope.Message.images[i])
		}
		$scope.Message.images = temp
    };
	$scope.addTimeFrame = function() {
		var tempTimeFrame = {"startDate" : new Date(), "endDate" : new Date(), "days" : [""], "startTime" : 0, "endTime" : 23}
		$scope.Message.timeFrame.push(tempTimeFrame);
		$scope.optionDays.push([
				{day:'Sunday', flag: false}, {day:'Monday', flag: false}, {day:'Tuesday', flag: false},
				{day:'Wednesday', flag: false}, {day:'Thursday', flag: false}, {day:'Friday', flag: false}, {day:'Saturday', flag: false}
		]);
	};
	$scope.deleteTimeFrame = function(time) {
		var temp = [];
		for (var i=0; i < $scope.Message.timeFrame.length; i++) {
			if (i != time)
				temp.push($scope.Message.timeFrame[i])
		}
		$scope.Message.timeFrame = temp
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
			$scope.Message.screensId[index] = parseInt($scope.Message.screensId[index]);
			$scope.screensSize++;
		} else if (changed == 'd') {
			$scope.Message.timeFrame[parentIndex].days[index] = parseInt($scope.Message.timeFrame[parentIndex].days[index]);
		} else if (changed == 'st') {
			$scope.Message.timeFrame[index].startTime = parseInt($scope.Message.timeFrame[index].startTime);
		} else if (changed == 'mst') {
			$scope.Message.msgTime = parseInt($scope.Message.msgTime);
		} else {
			$scope.Message.timeFrame[index].endTime = parseInt($scope.Message.timeFrame[index].endTime);
		}
	};
	$scope.convertDays = function(index) {
		var temp = []; 
		var tempDays = [];
		temp = String($scope.Message.timeFrame[index].days).split(",");
		for (var i=0;i<temp.length;i++) {
			tempDays[i] = parseInt(temp[i]);
		}
		$scope.Message.timeFrame[index].days = tempDays;
	};
}]);

myApp.controller('StatisticsController', ['$scope', 'socketFactory','$rootScope', function($scope, socketFactory,$rootScope) {
	socketFactory.emit('getTemplateStatistics', null);
	socketFactory.on('sendTemplateStatistics', function(result) {
		var data = result;
		var tempGraph2 = {
			chart: {
				caption: "Templates",
				subcaption: "Analize the number of Messages that have been using each template",
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
					subCaption: "Display the amount of previews for each Message",
					numberPrefix: "",
					theme: "ocean"
				},
				data
			};

	// d3
    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);
	
}]);

myApp.controller('AboutController', ['$scope', function($scope) {
	$scope.map = { center: { latitude: 31, longitude: 34 }, zoom: 8 };
	$scope.code = 'L6OmHbZ2vHs';
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var x = canvas.width / 2 +23;
    var y = canvas.height / 2 -30;
    var text = 'An app based on web technolgy That gives a comftorble interface for commercials.';
	context.font = "bold 16px Arial";
	context.textAlign = "center";
	context.fillText(text, x, y);
}]);