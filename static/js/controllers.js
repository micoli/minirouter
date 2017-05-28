(function(){
	'use strict';
	angular
	.module('minirouterApp')
	.factory('minirouter', function($http) {
		var app={};
		app.set = function(serverIp,clientIp,nom,cb){
			$http({
				method : 'POST',
				url : '/set',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data :  {
					server_ip : serverIp,
					client_ip : clientIp
				}
			})
			.then(
			function(response){
				cb();
			},
			function(response){
				cb();
			});

		}
		return app;
	})
	.controller('minirouterListCtrl',function($scope,$uibModal,$http,minirouter){
		$scope.refresh = function(){
			$http.get('/get', {})
			.then(
			function(response){
				$scope.data = response.data;
				console.log($scope.data);
			});
		}
		$scope.refresh();

		$scope.changeTo = function (server_ip,client_ip,nom){
			$uibModal.open({
				backdrop: true,
				keyboard: true,
				templateUrl: 'static/partials/confirm.tpl.html', // Url du template HTML
				controller: ['$scope', '$uibModalInstance','scopeParent','data',
					function($scope, $uibModalInstance,scopeParent,data) { //Controller de la fenêtre. Il doit prend en paramètre tous les élèments du "resolve".
						$scope.data=data;
						$scope.ok = function() {
							minirouter.set(server_ip,client_ip,nom,scopeParent.refresh);
							$uibModalInstance.dismiss('ok');
						};
						$scope.cancel = function() {
							$uibModalInstance.dismiss('cancel');
						};
					}
				],
				resolve: {
					scopeParent: function() {
						return $scope; //On passe à la fenêtre modal une référence vers le scope parent.
					},
					data:function(){
						return {
							server_ip:server_ip,
							nom:nom
						};
					}
				}
			});
		}
	})
	.controller('minirouterManualCtrl',function($scope,$http,minirouter){
		$scope.refresh = function(){
			$http.get('/get', {})
			.then(
			function(response){
				$scope.data = response.data;
				$scope.data.new_server = response.data.current_server;
			});
		}
		$scope.refresh();

		$scope.set=function (server_ip,client_ip){
			minirouter.set(server_ip,client_ip,'',$scope.refresh);
		};
	})
	.controller('minirouterGlobalCtrl',function($scope,$http,minirouter){
		$scope.refresh = function(){
			$http.get('/get', {})
			.then(
			function(response){
				$scope.data = response.data;
			});
		}
		$scope.refresh();
	});
})()
