app.config(function ($mdThemingProvider) {
	$mdThemingProvider.theme('blue')
		.primaryPalette('blue');

}).controller('popupCtrl', ['$scope', '$mdDialog', '$interval', 'svOrderList', '$state', 'Notification', function ($scope, $mdDialog, $interval, svOrderList, $state, Notification) {
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
						if (res.data.data.length == 0)
							return;
						$scope.files = res.data.data[0].files;
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
		$scope.formatCrrentcy = function (number) {
			var price = parseFloat(number);
			return price.toFixed(0).replace(/./g, function (c, i, a) {
				return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
			});
		}
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
					console.log(res.data);
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



		$scope.hide = function () {
			$mdDialog.hide();
		};

		$scope.cancel = function () {
			$mdDialog.cancel();
		};

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