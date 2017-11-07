app.config(function ($mdThemingProvider) {
	$mdThemingProvider.theme('blue')
		.primaryPalette('blue');

}).controller('popupCtrl', ['$scope', '$rootScope', '$mdDialog', '$interval', 'svOrderList', '$state', 'Notification', '$window', function ($scope, $rootScope, $mdDialog, $interval, svOrderList, $state, Notification, $window) {
	$scope.theme = 'blue';
	$scope.customFullscreen = false;
	$scope.showAlert = function (ev, note, title) {
		$mdDialog.show(
			$mdDialog.alert()
				.clickOutsideToClose(true)
				.parent(angular.element(document.querySelector('#popupContainer')))
				.clickOutsideToClose(true)
				.title(title)
				.textContent(note)
				.ariaLabel('Alert Dialog Demo')
				.ok('OK')
				.targetEvent(ev)
		);
	};
	$scope.showAdvanced = function (ev, url, data, id) {
		$mdDialog.show({
			controller: DialogController,
			templateUrl: url,
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
			locals: {
				items: data,
				id: id,
				url: url
			},
		})
			.then(function (answer) {
				$scope.status = 'You said the information was "' + answer + '".';
			}, function () {
				$scope.status = 'You cancelled the dialog.';
			});
	};
	function DialogController($scope, $mdDialog, $interval, $state, Notification, items, id, url) {
		$scope.files = [];
		$scope.NCC = [];
		$scope.textNote = '';
		switch (url) {
			case '/views/dashboard/order-list/downloadfile.html':
				svOrderList.downloadFile(items)
					.then(function successCallback(res) {
						if (res.data.record === undefined)
							return;
						$scope.idFile = res.data.id;
						$scope.files = res.data.record;
					}, function errorCallback(res) {
						console.log(res.status);
					})
				break;
			case '/views/dashboard/order-list/popupNCC.html':
				svOrderList.getNCC(items.name).then(
					function successCallback(res) {
						$scope.NCC = res.data.data;
						var data = {
							NCCDN: items.NCCDN,
							unitPrice: items.unitPrice,
							check: true
						}
						// if ($scope.NCC.length > 0)
						// 	data.check = false;
						$scope.NCC.unshift(data);
					},
					function errorCallback(res) {
						console.log(res.status);
					}
				)
				break;
			case '/views/dashboard/order-list/popupnote.html':
				$scope.textNote = items;
				break;
			default:
				break;
		}

		$scope.check = function (item) {
			for (var temp in $scope.NCC) {
				$scope.NCC[temp].check = false;
			}
			item.check = true;
		}

		$scope.formatCrrentcy = $rootScope.formatCrrentcy;

		$scope.addNCC = function () {
			var data = {
				pnNumber: items.pnNumber,
				name: items.name,
				NCCDN: $scope.supplier,
				unitPrice: $scope.unitPrice,
				check: false
			}
			svOrderList.createNCC(data).then(
				function successCallback(res) {
					$scope.NCC.push(data);
					$scope.supplier = '';
					$scope.unitPrice = '';
					//	console.log(res.data);
				},
				function errorCallback(res) {
					console.log(res.status);
				}
			)
			window.setTimeout(function () {
				document.getElementById('ncc').focus();
			}, 0);
		}
		$scope.enter = function (func) {
			if (event.keyCode == 13)
				func();
		}
		$scope.moveCusor = function () {
			window.setTimeout(function () {
				document.getElementById('dongia').focus();
			}, 0);
		}

		$scope.savePdfRP = function (fileName) {
			var url = '/assets/uploads/' + fileName;
			$window.open(url);
		}

		$scope.hide = function () {
			$mdDialog.hide();
		};

		$scope.cancel = function () {
			$mdDialog.cancel();
		};
		$scope.formatSecToDate = $rootScope.formatSecToDate;
		$scope.confirm = function () {
			var temp = {};
			for (var i = 0; i < $scope.NCC.length; i++) {
				if ($scope.NCC[i].check === true)
					temp = $scope.NCC[i];
			}
			//set thanh tien TT
			temp.unitPrice = items.frequency * temp.unitPrice;
			var data = {
				items: items,
				data: temp
			}
			svOrderList.setNCC(id, data).then(
				function successCallback(res) {
					Notification({ message: `Update thành công`, title: 'Thông báo', delay: 2000 });
					$state.reload();
				},
				function errorCallback(res) {
					console.log(res.status);
				}
			)
			$mdDialog.cancel();
		};

		$scope.answer = function (answer) {
			$mdDialog.hide(answer);
		};
	}

}]);
