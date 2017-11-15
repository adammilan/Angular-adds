myApp.factory('socketFactory', ['$rootScope','$location', function ($rootScope,$location) {
	var msgMap = {};
    var socket = io.connect('http://localhost:8080');
    return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {  
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);

					// this will refresh the view page after getting a new Message
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

                    // this will refresh the view page after sending a new Message
				});
			})
		},
		initMsgDates: function(Messages) {
			if ($.isArray(Messages)) {
				for (var i=0; i<Messages.length; i++) {
					for (var j=0; j<Messages[i].timeFrame.length; j++) {
						if (!(Messages[i].timeFrame[j].startDate instanceof Date)) {
							var tempStart = new Date(Messages[i].timeFrame[j].startDate[0],Messages[i].timeFrame[j].startDate[1],Messages[i].timeFrame[j].startDate[2]);
							Messages[i].timeFrame[j].startDate = tempStart;
							var tempEnd = new Date(Messages[i].timeFrame[j].endDate[0],Messages[i].timeFrame[j].endDate[1],Messages[i].timeFrame[j].endDate[2]);
							Messages[i].timeFrame[j].endDate = tempEnd;
							}	
						}
				}
			} else {
				for (var i=0; i<Messages.timeFrame.length; i++) {
					var tempStart = new Date(Messages.timeFrame[i].startDate[0],Messages.timeFrame[i].startDate[1],Messages.timeFrame[i].startDate[2]);
					Messages.timeFrame[i].startDate = tempStart;
					var tempEnd = new Date(Messages.timeFrame[i].endDate[0],Messages.timeFrame[i].endDate[1],Messages.timeFrame[i].endDate[2]);
					Messages.timeFrame[i].endDate = tempEnd;
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
			var temp = localStorage.getItem(storeName);
			storMap = JSON.parse(temp);
			if (storMap[msg]==undefined){
				storMap[msg] = 0;
			}
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