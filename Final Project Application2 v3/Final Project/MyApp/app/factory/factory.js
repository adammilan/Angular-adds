myApp.factory('socketFactory', ['$rootScope','$location', function ($rootScope,$location) {
	var msgMap = {};
    var socket = io.connect('http://localhost:8080');
    return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {  
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);

					// this will refresh the view page after getting a new message
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

                    // this will refresh the view page after sending a new message
				});
			})
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