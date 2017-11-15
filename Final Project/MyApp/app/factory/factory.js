myApp.factory('socketFactory', ['$rootScope','$location', function ($rootScope,$location) {
	var msgMap = {};
    var socket = io.connect('http://localhost:8080');
    return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {  
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		},
		initMsgDates: function(messages) {
			if ($.isArray(messages)) {
				for (var i=0; i<messages.length; i++) {
					for (var j=0; j<messages[i].timeFrame.length; j++) {
						if (!(messages[i].timeFrame[j].startDate instanceof Date)) {
							var tempStart = new Date(messages[i].timeFrame[j].startDate[0],messages[i].timeFrame[j].startDate[1],messages[i].timeFrame[j].startDate[2]);
							messages[i].timeFrame[j].startDate = tempStart;
							var tempEnd = new Date(messages[i].timeFrame[j].endDate[0],messages[i].timeFrame[j].endDate[1],messages[i].timeFrame[j].endDate[2]);
							messages[i].timeFrame[j].endDate = tempEnd;
							}	
						}
				}
			} else {
				for (var i=0; i<messages.timeFrame.length; i++) {
					var tempStart = new Date(messages.timeFrame[i].startDate[0],messages.timeFrame[i].startDate[1],messages.timeFrame[i].startDate[2]);
					messages.timeFrame[i].startDate = tempStart;
					var tempEnd = new Date(messages.timeFrame[i].endDate[0],messages.timeFrame[i].endDate[1],messages.timeFrame[i].endDate[2]);
					messages.timeFrame[i].endDate = tempEnd;
				}
			}
		},
		setNav: function(setNav){
			$rootScope.showNav = setNav;
		},
		setInLocalStorage: function(storeName,msg){
			if (localStorage.getItem(storeName)==undefined){
				localStorage.setItem(storeName, JSON.stringify(storMap));
			}

			if (storMap[msg]==undefined){
				storMap[msg] = 0;
			}
            var temp = localStorage.getItem(storeName);
            var storMap = JSON.parse(temp);
			storMap[msg]++;
			localStorage.setItem(storeName, JSON.stringify(storMap));
		},
		getFromLocalStorage: function(fromName){
			if (localStorage.getItem(fromName)==undefined){
				localStorage.setItem(fromName, JSON.stringify(storMap));
			}
			var temp = localStorage.getItem(fromName);
			return JSON.parse(temp);
		}
    };
}]);