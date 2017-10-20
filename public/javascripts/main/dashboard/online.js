app.controller('onlineCtrl', ['$rootScope', '$scope', 'svSocket', '$state', function ($rootScope, $scope, svSocket, $state) {
	//$rootScope.users = [];
	svSocket.on('viewEmployeeOnline', function (data) {
		$rootScope.users = data;
		console.log(data);
	})
}])