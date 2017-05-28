(function(){
	'use strict';

	var dwnApp = angular.module('minirouterApp', [
		'ui.bootstrap',
		'ui.router'
	]);

	dwnApp.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
		$urlRouterProvider.otherwise("/list");

		$stateProvider
		.state('minirouter', {
			url			: '/',
			templateUrl	: 'static/partials/home.html'
		})
		.state('minirouter.list', {
			url			: "list",
			templateUrl	: 'static/partials/list.html',
			controller	: 'minirouterListCtrl'
		})
		.state('minirouter.manual', {
			url			: "manual",
			templateUrl	: 'static/partials/manual.html',
			controller	: 'minirouterManualCtrl'
		})
		.state('minirouter.global', {
			url			: "global",
			templateUrl	: 'static/partials/global.html',
			controller	: 'minirouterGlobalCtrl'
		});
	}]);
})();
