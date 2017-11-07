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
		console.log($scope.info);
		if ($scope.info.selected == undefined || $scope.info.warehouse == undefined || $scope.info.type == undefined) {
			$scope.orderSteps = 'info';
			Notification.error({ message: `Bạn chưa cung cấp đủ thông tin khách hàng`, title: 'Thông báo', delay: 3000 });
		}
		else if ($scope.jtableData.length == 0) {
			$scope.orderSteps = 'products';
			$(document).ready(function () {
				$(function () {
					$("#tableProduct").jtable("showCreateForm");
				});
			});
			Notification.error({ message: `Đơn hàng phải có ít nhất một sản phẩm`, title: 'Thông báo', delay: 3000 });
		}
		else {
			$(function () {
				$("#file-1").fileinput('upload');
			});
		}

	}
	$scope.submitOrder = function (id) {
		var data = {
			EmplID: $localStorage.user[0].EmplID,
			poNumber: '',
			idFile: id,
			ChildDepartment: $localStorage.employee.ChildDepartment,
			type: this.info.type,
			Warehouse: this.info.warehouse,
			customerName: this.info.selected.name,
			customerAddress: this.info.selected.address,
			customerPhone: this.info.selected.sdt,
			customerEmail: this.info.selected.mail,
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
				data.poNumber = res.data.data.poNumber;
				svSocket.emit('create_order', data);
				delete $localStorage.jtableData;
				delete $localStorage.info;
				$scope.info = {};
				$scope.jtableData = [];
				Notification({ message: `Bạn đã tạo thành công đơn hàng`, title: 'Thông báo', delay: 2000 });
				$state.go('order-list');
			}, function errorCallBack(res) {
				console.log(res.status)
				Notification.error({ message: `Thất Bại`, title: 'Thông báo', delay: 2000 });
				$scope.orderSteps = 'info';
			});
	}
	$scope.resfeshOrder = function () {

		delete $localStorage.jtableData;
		delete $localStorage.info;
		$scope.info = {};
		$scope.jtableData = [];
		$scope.orderSteps = 'info';
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
						addNewRecord: 'Thêm hàng'
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
								var dataRecord = $("#jtable-create-form").serializeArray();
								var temp = {
									pnNumber: dataRecord[0].value,
									name: dataRecord[1].value,
									frequency: dataRecord[2].value,
									unitPrice: dataRecord[3].value,
									NCCDN: dataRecord[4].value,
									CQ_CO: dataRecord[5].value,
									note: dataRecord[6].value
								}
								if (temp.frequency.length == 0 || temp.unitPrice.length == 0) {
									temp.frequency = '0';
									temp.unitPrice = '0';
								}
								temp.price = parseInt(temp.unitPrice.replace(/,/g, "\"\""), 10) * temp.frequency;
								temp.STT = $scope.jtableData.length + 1;
								temp.NCCTT = '';
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
								var dataRecord = $("#jtable-edit-form").serializeArray();
								var temp = {
									pnNumber: dataRecord[0].value,
									name: dataRecord[1].value,
									frequency: dataRecord[2].value,
									unitPrice: dataRecord[3].value,
									NCCDN: dataRecord[4].value,
									CQ_CO: dataRecord[5].value,
									note: dataRecord[6].value
								}
								temp.price = parseInt(temp.unitPrice, 10) * temp.frequency;
								$scope.jtableData[temp.STT - 1] = temp;
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
							width: '3%'
						},
						pnNumber: {
							title: 'P/N',
							create: true,
							edit: true
						},
						name: {
							title: 'Tên hàng',
							width: '15%',
							create: true,
							edit: true,
							type: 'textarea'
						},
						frequency: {
							title: 'SL',
							create: true,
							width: '3%',
							edit: true
						},
						unitPrice: {
							title: 'Đơn giá',
							create: true,
							edit: true,
							input: function (data) {
								//	console.log(data);
								if (data.record) {
									return '<input type="text"  id="price" name="unitPrice" value="' + data.record.unitPrice + '" />';
								} else {
									return '<input type="text" id="price" name="unitPrice" value="" />';
								}
							},
							display: function (data) {
								return $.number(data.record.unitPrice);
							}
						},
						price: {
							title: 'Thành tiền',
							create: false,
							edit: false,
							display: function (data) {
								var price = parseFloat(data.record.price);
								return $.number(price);
							}
						},
						NCCDN: {
							title: 'NCC đề nghị ',
							create: true,
							edit: true
						},
						priceTT: {
							title: 'Thành tiền TT',
							defaultValue: "Pending",
							create: false,
							edit: false,
							list: false
						},
						NCCTT: {
							title: 'NCC TT ',
							defaultValue: "Pending",
							create: false,
							edit: false,
							list: false
						},
						CQ_CO: {
							defaultValue: "Có",
							title: 'CQ/CO',
							type: 'selected',
							options: { 'Có': 'Có', 'Không': 'Không' },
							width: '3%'
						},
						note: {
							title: 'Y/C khác',
							type: 'textarea',
							create: true,
							edit: true
						}
					},
					//Initialize validation logic when a form is created
					formCreated: function (event, data) {
						data.form.find('textarea[name="name"]').addClass('validate[required]');
						data.form.find('input[name="frequency"]').addClass('validate[required,custom[number]]');
						data.form.find('input[name="unitPrice"]').addClass('validate[required],custom[number]');
						data.form.find('input[name="NCCDN"]').addClass('validate[required]');
						data.form.find('input[name="unitPrice"]').number(true);
						data.form.validationEngine();

					},
					//Validate form when it is being submitted
					formSubmitting: function (event, data) {
						return data.form.validationEngine('validate');
					},
					//Dispose validation logic when form is closed
					formClosed: function (event, data) {
						data.form.validationEngine('hide');
						data.form.validationEngine('detach');
					}
				});
				//$('unitPrice').number(true, 2);
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
				$scope.idFile = Date.now();

				$("#file-1").fileinput({
					uploadUrl: '/api/upload/', // you must set a valid URL here else you will get an error
					allowedFileExtensions: ['jpg', 'png', 'msg', 'gif', 'pdf', 'docx', 'doc', 'zip'],
					overwriteInitial: false,
					maxFileCount: 4,
					validateInitialCount: true,
					uploadAsync: false,
					showUpload: false,
					required: true,
					slugCallback: function (filename) {
						return filename.replace('(', '_').replace(']', '_');
					},
					uploadExtraData: function (previewId, index) {
						var info = {
							"tags": $scope.idFile,
							"mail": false
						};
						return info;
					},
					previewSettings: {
						other: { width: "160px", height: "100px" }
					}
				}).on('filebatchuploadcomplete', function (event, files, extra) {
					console.log('File batch upload complete');
					$scope.submitOrder($scope.idFile);
				});
			})
		}
	}
}])