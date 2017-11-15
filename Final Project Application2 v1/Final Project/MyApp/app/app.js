

  //the names in the array are external modules, myApp is the name of the mod
var myApp = angular.module('myApp', ['ngRoute','ui.bootstrap','ng-fusioncharts','uiGmapgoogle-maps']);

//This configures the routes and associates each route with a view and a controller
myApp.config(function ($routeProvider) {
    $routeProvider
		.when('/',
			{
				controller: 'HomeController',
				templateUrl: '/app/views/homeView.html'
			})
		.when('/messages',
			{
				controller: 'MessagesController',
				templateUrl: '/app/views/messagesView.html'
			})
		.when('/editMessage/:msgName',
			{
				controller: 'EditMessageController',	
				templateUrl: '/app/views/editMessageView.html'	
			})
		.when('/about',
			{
				controller: 'AboutController',
				templateUrl: '/app/views/aboutView.html'
			})
		.when('/preferences',
			{
				templateUrl: '/app/views/preferencesView.html'
			})
		.when('/statistics',
			{
				controller: 'StatisticsController',
				templateUrl: '/app/views/statisticsView.html'
			})
		.when('/delete',
			{
				controller: 'MessagesController',
				templateUrl: '/app/views/deleteView.html'
			})
        .otherwise({ redirectTo: '/' });
});
myApp.run([
      '$rootScope', function ($rootScope) {

          $rootScope.facebookAppId = '1394413537248012'; // set your facebook app id here
      }
]);