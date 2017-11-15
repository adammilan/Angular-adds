myApp.controller('HomeController', function($scope, $location) {
	var headline = 'Welcome to our  Apartment Ads Application!';
    var jumboLine1 = 'this is the best apartment web app worldwide!!';
	var jumboLine2 = 'View all the apartments in one place!!';
	$scope.headline = headline;
    $scope.jumboLine1 = jumboLine1;
	$scope.jumboLine2 = jumboLine2;	
});	

myApp.controller('NavbarController', ['$scope','$rootScope','$location',function($scope, $rootScope,$location) {
	$rootScope.showNav = true;
	var appTitle = 'Apartments Ads Application';
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
	$scope.messages = [];
    socketFactory.emit('getAllMessages', null);
    socketFactory.on('sendAllMessages', function(res) {
        $scope.messages = res;
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

myApp.controller('EditMessageController', ['$scope', '$routeParams', 'socketFactory', '$location', 'modalService', function($scope, $routeParams, socketFactory, $location, modalService) {
	var msgEdit = $routeParams.msgName;
	$scope.title = ($routeParams.msgName == 'NULL') ? 'Add' : 'Edit'
	$scope.newMsg = false;
	$scope.message, $scope.sendToServer;
	$scope.buttonText = 'Save Changes';
	$scope.cancelButton = "Cancel";
	$scope.optionDays = [];
	if (msgEdit != 'NULL') {
		socketFactory.emit('getMessage', msgEdit);
		socketFactory.on('sendMessage', function(res) {
			$scope.message = res[0];
			$scope.screensSize = $scope.message.screensId.length;
		});
	} else {
		$scope.newMsg = true;
		$scope.message = {"screensId":[1],
		"name":"",
		"text":[],
		"images":[],
		"template":"",
		"msgTime": 0,
		"city":"",
		"lat":"",
		"long":""};
	}
	$scope.saveAdd = function() {
		$scope.editToServer = angular.copy($scope.message);
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
		$scope.sendToServer = angular.copy($scope.message);
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
	$scope.updateCounters = function(changed){
		if (changed=='t'){
			$scope.txtSize++;
		}
		else{
			$scope.imgSize++;
		}
	}
}]);

myApp.controller('StatisticsController', ['$scope', 'socketFactory','$rootScope', function($scope, socketFactory,$rootScope) {
	socketFactory.emit('getCityStatistics', null);
	socketFactory.on('sendCityStatistics', function(data) {
        var svg = d3.select("#cityPie").append("svg").attr("width",700).attr("height",300);
        svg.append("g").attr("id","cityDonut");
        Donut3D.draw("cityDonut", data, 150, 150, 130, 100, 30, 0.4);
	});
    socketFactory.emit('getTemplateStatistics', null);
    socketFactory.on('sendTemplateStatistics', function(data) {
        var svg = d3.select("#templatePie").append("svg").attr("width",700).attr("height",300);
        svg.append("g").attr("id","templateDonut");
        Donut3D.draw("templateDonut", data, 150, 150, 130, 100, 30, 0.4);
    });
}]);

myApp.controller('AboutController', ['$scope', 'socketFactory', function($scope, socketFactory) {
	$scope.map = { center: { latitude: 32, longitude: 34.8 }, zoom: 9 };
	$scope.code = 'L6OmHbZ2vHs';
    socketFactory.emit('getCoordinates', null);
    socketFactory.on('sendCoordinates', function(data) {
        $scope.coordinates = data;
    });
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var x = canvas.width / 2 +23;
    var y = canvas.height / 2 -30;
    var text = 'An app based on web technolgy That gives a comftorble interface for commercials.';
	context.font = "bold 16px Arial";
	context.textAlign = "center";
	context.fillText(text, x, y);
}]);