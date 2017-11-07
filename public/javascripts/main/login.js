app.controller('loginCtrl', ['$scope', 'svEmployee', 'svSocket', '$location', '$localStorage', 'Notification', '$state', '$http', function ($scope, svEmployee, svSocket, $location, $localStorage, Notification, $state, $http) {

	$scope.isAuthenticated = function () {
		if ($localStorage.user) {
			$scope.username = $localStorage.user[0].Username;
			return true;
		}
		return false;
	}
	$scope.infoTable = true;
	$scope.enableEdit = function () {
		$scope.infoTable = false;
		$scope.button = true;
	}
	$scope.disableEdit = function () {
		$scope.infoTable = true;
		$scope.button = false;
	}
	$scope.editInfo = function () {
		$scope.infoTable = true;
		$scope.button = false;
		svEmployee.updateInfo($scope.employee)
			.then(function successCallback(res) {
				Notification({ message: `Bạn đã UPDATE thành công`, title: 'Thông báo', delay: 2000 });
			}, function errorCallback(res) {
				console.log(res.status)
			})
	}
	$scope.login = function () {
		var data = {
			Username: $scope.login_name,
			Password: $scope.login_pass
		}
		svEmployee.login(data)
			.then(function successCallback(res) {
				if (res.data == -1) {
					alert("Mật Khẩu Không Hợp Lệ");
					$scope.login_name = '';
					$scope.login_pass = '';
				}
				else {
					$localStorage.user = res.data;
					svEmployee.getInfo($localStorage.user[0].EmplID)
						.then(function successCallbac(res) {
							$state.go('homepage');
							$localStorage.employee = res.data[0];
							$http.defaults.headers.common.Authorization = $localStorage.employee.authorities;
							return res.data;
						}, function errorCallbac(res) {
							console.log(res.status);
						})
				}
			}, function errorCallback(res) {
				console.log(res.status)
			})
	}
	$scope.logout = function () {
		svSocket.disconnect();
		$localStorage.user = '';
		$location.path("/login");
		$scope.dropdownLogin = false;
		$scope.username = '';
	}
	$scope.refresh = function () {
		$scope.newPass = '';
		$scope.currPass = '';
		$scope.confirmPass = '';
	}

	$scope.changePassword = function () {
		var data = {
			EmplID: $localStorage.user[0].EmplID,
			Password: $scope.newPass
		}
		if ($scope.confirmPass !== $scope.newPass) {
			$scope.messageError = 'Password not match';
			$scope.error = true;
			$scope.newPass = '';
			$scope.currPass = '';
			$scope.confirmPass = '';
			return;
		} else if ($scope.currPass !== $localStorage.user[0].Password) {
			$scope.messageError = 'Password not match';
			$scope.error = true;
			$scope.newPass = '';
			$scope.currPass = '';
			$scope.confirmPass = '';
			return;
		} else {
			svEmployee.changePassword(data)
				.then(function successCallback(res) {
					Notification({ message: `Bạn đã UPDATE thành công`, title: 'Thông báo', delay: 2000 });
					$scope.newPass = '';
					$scope.currPass = '';
					$scope.confirmPass = '';
				}, function errorCallback(res) {
					console.log(res.status)
				})
		}
	}
}])


// app.controller('dashboradCtrl', ['$scope', 'svSocket', '$localStorage', function ($scope, svSocket, $localStorage) {
// 	var info = {
// 		room: $localStorage.employee.ChildDepartment,
// 		id: $localStorage.employee.EmplID,
// 		authorities: $localStorage.employee.authorities,
// 		ChildDepartment: $localStorage.employee.ChildDepartment
// 	}
// 	svSocket.emit('newUser', info);
// }])