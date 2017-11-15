/*#######################################################################
  
  Elad Doocker, Guy Ben-Shahar and Gal Sosin

  #######################################################################*/

  
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
        .when('/stations',
            {
                controller: 'StationsController',
                templateUrl: '/app/views/stationsView.html'
            })
		.when('/preview/:Date/:StationId',
			{
				controller: 'StationsPreviewController',
				templateUrl: '/app/views/stationPreview.html'
			})
		.when('/about',
			{
				controller: 'AboutController',
				templateUrl: '/app/views/aboutView.html'
			})
		.when('/preferences',
			{
				controller: 'StationsController',
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
          $rootScope.facebookAppId = '894530424000353'; // set your facebook app id here
      }
]);