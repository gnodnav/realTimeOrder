var app = angular.module("app");

app.factory("svEmployee", ['$http', function ($http) {
	return {
		login: function (data) {
			return $http.post('/api/login/', data);
		},
		getInfo: function (id) {
			return $http.get('/api/user-info/' + id);
		},
		updateInfo: function (data) {
			return $http.put('/api/update-info/', data);
		},
		changePassword: function (data) {
			return $http.put('/api/change-password', data);
		}
	}
}]);
app.factory("svOrder", ['$http', function ($http) {
	return {
		createOrder: function (data) {
			return $http.post('/api/dashboard/create-order', data);
		}
	}
}]);
app.factory('svOrderList', ['$http', function ($http) {
	return {
		//all 
		getOrders: function (id, rom) {
			return $http.get('/api/order-list/orders/' + id + '/' + rom);
		},
		getOrder: function (id) {
			return $http.get('/api/order-list/order/' + id);
		},
		downloadFile: function (id) {
			return $http.get('/api/dowload/' + id)
		},
		//manager
		approveOrder: function (id, data) {
			return $http.put('/api/order-list/approve/' + id, data);
		},
		//poman
		setNCC: function (id, data) {
			return $http.put('/api/order-list/setncc/' + id, data);
		},
		createNCC: function (data) {
			return $http.post('/api/order-list/createncc/', data)
		},
		getNCC: function (id) {
			return $http.get('/api/order-list/getncc/' + id);
		},
		updateOrder: function (data) {
			return $http.put('/api/order-list/update-order/', data);
		},
		//get all Customer
		getCustomers: function () {
			return $http.get('/api/order/get-customers/');
		}
	}
}])