app.controller('orderCtrl', ['$scope', 'svOrder', '$localStorage', '$window', 'Notification', '$state', 'svSocket', function ($scope, svOrder, $localStorage, $window, Notification, $state, svSocket) {
	$scope.orderSteps = 'info';
	$scope.whenProduct = function () {
		if ($scope.orderSteps == 'info') {
			$scope.orderSteps = 'products';
			$(document).ready(function () {
				$(function () {
					$("#tableProduct").jtable("showCreateForm");
				});
			});
		}
		else
			$scope.orderSteps = 'products';
	}
	//check cockied
	if ($localStorage.jtableData)
		$scope.jtableData = $localStorage.jtableData;
	else
		$scope.jtableData = [];

	if ($localStorage.info)
		$scope.info = $localStorage.info
	else
		$scope.info = {};
	//switch content
	$scope.next = function () {
		if ($scope.orderSteps === 'info') {
			$scope.whenProduct();
			$localStorage.info = $scope.info;
		}
		else if ($scope.orderSteps === 'products')
			$scope.orderSteps = 'attach';
	}
	$scope.back = function () {
		if ($scope.orderSteps === 'products')
			$scope.orderSteps = 'info';
		else if ($scope.orderSteps === 'attach')
			$scope.orderSteps = 'products';
	}
	//submit form
	var totalPrice = function () {
		var total = 0;
		for (var i = 0; i < $scope.jtableData.length; i++) {
			total += $scope.jtableData[i].price;
		}
		return total
	}
	$scope.callFunc = function (params) {
		$(function () {
			$("#file-1").fileinput('upload');
		});
	}
	$scope.submitOrder = function (id) {
		var data = {
			EmplID: $localStorage.user[0].EmplID,
			poNumber: id,
			ChildDepartment: $localStorage.employee.ChildDepartment,
			type: this.info.type,
			Warehouse: this.info.warehouse,
			customerName: this.info.selected.name,
			customerAddress: this.info.selected.address,
			approve: false,
			products: $scope.jtableData,
			branch: this.options,
			status: 'Approve',
			notePOM: '',
			datetime: Date.now(),
			totalPrice: totalPrice()
		}
		svOrder.createOrder(data)
			.then(function successCallback(res) {
				console.log('create order');
				svSocket.emit('create_order', data);
				delete $localStorage.jtableData;
				delete $localStorage.info;
				$scope.info = {};
				$scope.jtableData = [];
				Notification({ message: `Bạn đã tạo thành công đơn hàng`, title: 'Thông báo', delay: 2000 });
			}, function errorCallBack(res) {
				console.log(res.status)
				Notification.error({ message: `Thất Bại`, title: 'Thông báo', delay: 2000 });
				$scope.orderSteps = 'info';
			});
	}

}]).directive('jTable', function ($localStorage) {
	return {
		restrict: 'AECM',
		scope: true,
		template: "<div></div>",
		controller: function ($scope) {
			$(document).ready(function () {
				$(`#tableProduct`).jtable({
					title: 'Products',
					paging: true, //Enables paging
					pageSize: 10, //Actually this is not needed since default value is 10.
					sorting: true, //Enables sorting
					defaultSorting: 'Name ASC', //Optional. Default sorting on first load.,
					jqueryuiTheme: true,
					messages: {
						addNewRecord: 'Add new product'
					},
					actions: {
						listAction: function (postData, jtParams) {
							return $.Deferred(function ($dfd) {
								var lengthRecords = $scope.jtableData.length;
								$localStorage.jtableData = $scope.jtableData;
								$dfd.resolve({
									Result: 'OK',
									Records: $scope.jtableData,
									TotalRecordCount: lengthRecords
								});
							});
						},
						deleteAction: function (postData) {
							return $.Deferred(function ($dfd) {
								var result = $.grep($scope.jtableData, function (e) { return e.STT == postData.STT; });
								$scope.jtableData.splice($scope.jtableData.indexOf(result[0]), 1);
								$dfd.resolve({
									Result: 'OK'
								});

							});
						},
						createAction: function (postData) {
							return $.Deferred(function ($dfd) {
								var temp = JSON.parse('{"' + decodeURI(postData.replace(/&/g, "\",\"").replace(/=/g, "\":\"").replace(/\+/g, ' ')) + '"}');
								temp.price = parseInt(temp.unitPrice.replace(/,/g, "\"\""), 10) * temp.frequency;
								temp.STT = $scope.jtableData.length + 1;
								temp.NCCTT = 'none';
								temp.priceTT = '';
								$scope.jtableData.push(temp);
								$dfd.resolve({
									Result: 'OK',
									Record: temp
								});
							});
						},
						updateAction: function (postData) {
							return $.Deferred(function ($dfd) {
								var temp = JSON.parse('{"' + decodeURI(postData.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
								temp.price = parseInt(temp.unitPrice, 10) * temp.frequency;
								$scope.jtableData[temp.STT] = temp;
								$dfd.resolve({
									Result: 'OK'
								});
							});
						}
					},
					fields: {
						STT: {
							title: 'STT',
							key: true,
							create: false,
							edit: false,
							list: true,
						},
						pnNumber: {
							title: 'P/N',
							width: '8%',
							create: true,
							edit: true
						},
						name: {
							title: 'Tên hàng',
							width: '15%',
							create: true,
							edit: true
						},
						frequency: {
							title: 'Số lượng',
							width: '10%',
							create: true,
							edit: true
						},
						unitPrice: {
							title: 'Đơn giá',
							width: '10%',
							create: true,
							edit: true,
							display: function (data) {
								var price = parseFloat(data.record.unitPrice);
								return price.toFixed(0).replace(/./g, function (c, i, a) {
									return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
								});
							}
						},
						price: {
							title: 'Thành tiền',
							width: '15%',
							create: false,
							edit: false,
							display: function (data) {
								var price = parseFloat(data.record.price);
								return price.toFixed(0).replace(/./g, function (c, i, a) {
									return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
								});
							}
						},
						NCCDN: {
							title: 'NCC đề nghị ',
							width: '15%',
							create: true,
							edit: true
						},
						priceTT: {
							title: 'Thành tiền TT',
							defaultValue: "none",
							create: false,
							edit: false,
							list: false
						},
						NCCTT: {
							title: 'NCC TT ',
							defaultValue: "0",
							create: false,
							edit: false,
							list: false
						},
						CQ_CO: {
							title: 'CQ/CO',
							width: '10%',
							type: 'radiobutton',
							options: { '1': 'CQ/CO' }
						},
						note: {
							title: 'Y/C khác',
							width: '20%',
							type: 'textarea',
							create: true,
							edit: true
						}
					}
				});
				$(`#tableProduct`).jtable('load');
			});
		}
	}
}).directive('uploadFile', ['$localStorage', 'Notification', '$state', function ($localStorage, Notification, $state) {
	return {
		scope: true,
		restrict: 'AE',
		controller: function ($scope, $state) {
			$(document).ready(function () {
				$scope.poNumber = Date.now();
				$("#file-1").fileinput({
					uploadUrl: '/api/upload/', // you must set a valid URL here else you will get an error
					allowedFileExtensions: ['jpg', 'png', 'gif', 'pdf', 'docx', 'doc', 'zip'],
					overwriteInitial: false,
					maxFileCount: 5,
					validateInitialCount: true,
					uploadAsync: false,
					showUpload: false,
					required: true,
					slugCallback: function (filename) {
						return filename.replace('(', '_').replace(']', '_');
					},
					uploadExtraData: function (previewId, index) {
						var info = { "tags": $scope.poNumber };
						return info;
					}
				}).on('filebatchuploadcomplete', function (event, files, extra) {
					console.log('File batch upload complete');
					$scope.submitOrder($scope.poNumber);
					$state.transitionTo('order-list');
				});
			})
		}
	}
}])