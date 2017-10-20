app.controller('orderListCtrl', ['$scope', '$rootScope', 'svOrderList', 'Notification', '$state', '$window', '$localStorage', 'svSocket', function ($scope, $rootScope, svOrderList, Notification, $state, $window, $localStorage, svSocket) {
	//int
	var temp = [];
	$scope.itemsPerPage = 10;
	$scope.currentPage = 1;

	var searchID = function (arr, index, data) {
		arr.forEach(function (element) {
			if (element.poNumber == index)
				element = data
		}, this);
	}
	var parsePoNumber = function (sec) {
		var curdate = new Date(null);
		curdate.setTime(sec);
		return curdate.getFullYear + '_';
	}
	//socket listen
	svSocket.on('viewCreateOrder', function (data) {
		if ($scope.ordersCurrent == undefined)
			$scope.ordersCurrent = [];

		$scope.ordersCurrent.push(data);
		$scope.orders.push(data);
	})
	svSocket.on('viewApprove', function (data) {
		if ($scope.ordersCurrent == undefined)
			$scope.ordersCurrent = [];

		if ($localStorage.employee.authorities == 'POM')
			$scope.ordersCurrent.push(data);
		else {
			for (var i = 0; i < $scope.ordersCurrent.length; i++)
				if ($scope.ordersCurrent[i].poNumber == data.poNumber) {
					$scope.ordersCurrent[i] = data;
				}

			for (var i = 0; i < $scope.orders.length; i++)
				if ($scope.orders[i].poNumber == data.poNumber) {
					$scope.orders[i] = data;
				}
		}
	})
	svSocket.on('viewUpdateOrder', function (data) {
		for (index in $scope.ordersCurrent) {
			if ($scope.ordersCurrent[index].poNumber === data.poNumber)
				$scope.ordersCurrent[index] = data;
		}
	})

	if ($scope.orders)
		$scope.totalItems = $scope.orders.length;
	else
		$scope.orders = [];
	$scope.parsePage = function (arraySrc, arrayDes, length) {
		var temp = arraySrc.slice(0, arraySrc.length);
		for (var i = 0; i < length / $scope.itemsPerPage; i++) {
			arrayDes.push(temp.splice(0, $scope.itemsPerPage))
		}
	}
	$scope.parsePage($scope.orders, temp, $scope.orders.length);
	$scope.ordersCurrent = temp[0];
	$rootScope.formatCrrentcy = function (number) {
		if (number === undefined || number == '')
			return;
		var price = parseFloat(number);
		return price.toFixed(0).replace(/./g, function (c, i, a) {
			return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
		});
	}
	function filterItems(query, array) {
		return array.filter(function (el) {
			return el.status.toLowerCase().indexOf(query.toLowerCase()) > -1;
		})
	}
	$scope.filterStatus = function (status) {
		var buff = filterItems(status, $scope.orders);
		temp = [];
		$scope.totalItems = buff.length;
		$scope.parsePage(buff, temp, buff.length);
		$scope.ordersCurrent = temp[$scope.currentPage - 1];
	}


	function addZero(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}
	$rootScope.formatSecToDate = function (sec) {
		var curdate = new Date(null);
		curdate.setTime(sec);
		return curdate.getDate() + '/' + curdate.getMonth() + '/' + curdate.getFullYear() + ' ' + curdate.getHours()
			+ ':' + curdate.getMinutes() + ':' + addZero(curdate.getSeconds());
	}

	$scope.setPage = function (pageNo) {
		$scope.currentPage = pageNo;
		$scope.ordersCurrent = temp[$scope.currentPage - 1];

	};
	$scope.approveOrder = function (order) {
		svOrderList.approveOrder(order.poNumber, $localStorage.employee)
			.then(function successCallback(res) {
				svSocket.emit('approveOrder', order);
				order.approve = true;
				order.status = "Pending";
				searchID($scope.ordersCurrent, order.poNumber, order)
				Notification({ message: `Xác nhận đơn hàng thành công`, title: 'Thông báo', delay: 2000 });
			}, function errorCallback(res) {
				console.log(res.status);
			})
	}
	$scope.back = function () {
		$window.history.back();
	}
	$scope.updateOrder = function () {
		svOrderList.updateOrder($rootScope.order).then(
			function successCallback(res) {
				svSocket.emit('updateOrder', $rootScope.order);
				Notification({ message: `Update đơn hàng thành công`, title: 'Thông báo', delay: 2000 });
				$state.transitionTo("order-list")
				//searchID($scope.ordersCurrent, order.poNumber, order)
			},
			function errorCallback(res) {
				console.log(res.status);
			}
		)
	}
	$scope.printValue = function (item) {
		$scope.order = item;

		setTimeout(function () {
			document.getElementById("kaka").click();
		}, 200);

	}
}])