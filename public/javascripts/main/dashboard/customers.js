app.controller('customersCtrl', ['$scope', '$localStorage', 'Notification', '$state', function ($scope, $localStorage, Notification, $state) {
	$scope.reloadSearch = function () {
		$(document).ready(function () {
			if ($localStorage.optionFilterCustomer === undefined)
				$localStorage.optionFilterCustomer = 'name';
			$('#tableCustomer').jtable('load', {
				name: $('#searchText').val(),
				option: $localStorage.optionFilterCustomer
			});
		})
	}
	//	$scope.checkDelete = false
	$scope.customers = {
		customerID: {
			//defaultValue: Date.now(),
			title: 'Customer ID',
			key: true,
			create: false,
			edit: false,
			list: true,
			width: '2%',
		},
		name: {
			title: 'Customer Name',
			create: true,
			edit: true,
			list: true,
			width: '5%',
		},
		sdt: {
			title: 'Customer Phone',
			width: '4%',
			create: true,
			edit: true
		},
		mail: {
			title: 'Customer Mail',
			width: '5%',
			create: true,
			edit: true,
		}, address: {
			title: 'Customer Address',
			//	width: '15%',
			create: true,
			edit: true,
			type: 'textarea'
		}
	}
}]).directive('customerTable', function ($localStorage) {
	return {
		restrict: 'AECM',
		scope: true,
		template: "<div></div>",
		controller: function ($scope, Notification) {
			$(document).ready(function () {

				$(`#tableCustomer`).jtable({
					title: 'Customers',
					paging: true, //Enables paging
					pageSize: 10, //Actually this is not needed since default value is 10.
					sorting: true, //Enables sorting
					defaultSorting: 'Name ASC', //Optional. Default sorting on first load.,
					jqueryuiTheme: true,
					messages: {
						addNewRecord: 'Add new cusomter'
					},
					actions: {
						listAction: function (postData, jtParams) {
							return $.Deferred(function ($dfd) {
								$.ajax({
									url: '/api/customerList?jtStartIndex=' + jtParams.jtStartIndex + '&jtPageSize=' + jtParams.jtPageSize + '&jtSorting=' + jtParams.jtSorting,
									type: 'POST',
									dataType: 'json',
									data: postData,
									success: function (data) {
										$dfd.resolve(data);
									},
									error: function () {
										$dfd.reject();
									}
								});
							});
						},
						deleteAction: function (postData) {
							return $.Deferred(function ($dfd) {
								$.ajax({
									url: '/api/deleteCustomer',
									type: 'DELETE',
									dataType: 'json',
									data: postData,
									success: function (data) {
										$dfd.resolve(data);
										Notification({ message: `Bạn đã XÓA thành công`, title: 'Thông báo', delay: 2000 });
									},
									error: function () {
										$dfd.reject();
									}
								});
							});
						},
						createAction: function (postData) {
							return $.Deferred(function ($dfd) {
								$.ajax({
									url: '/api/CreateCustomer',
									type: 'POST',
									dataType: 'json',
									data: postData,
									success: function (data) {
										$dfd.resolve(data);
										Notification({ message: `Bạn đã Tạo thành công`, title: 'Thông báo', delay: 2000 });
									},
									error: function () {
										$dfd.reject();
									}
								});
							});
						},
						updateAction: function (postData) {
							return $.Deferred(function ($dfd) {
								$.ajax({
									url: '/api/updateCustomer',
									type: 'PUT',
									dataType: 'json',
									data: postData,
									success: function (data) {
										$dfd.resolve(data);
										Notification({ message: `Bạn đã SỬA thành công`, title: 'Thông báo', delay: 2000 });
									},
									error: function () {
										$dfd.reject();
									}
								});
							});
						}
					},
					fields: $scope.customers,
					//Initialize validation logic when a form is created
					formCreated: function (event, data) {
						data.form.find('input[name="customerID"]').addClass('validate[required]');
						data.form.find('input[name="name"]').addClass('validate[required]');
						data.form.find('input[name="sdt"]').addClass('validate[required]');
						data.form.find('input[name="mail"]').addClass('validate[required],custom[email]');
						data.form.validationEngine();

					},
					rowInserted: function (event, data) {
						if ($localStorage.employee.authorities !== 'Administrator')
							data.row.find('.jtable-delete-command-button').hide();
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
				//$(`#tableEmployee`).jtable('load');
				var param;
				$('.search-panel .dropdown-menu').find('a').click(function (e) {
					e.preventDefault();
					param = $(this).attr("href").replace("#", "");
					$localStorage.optionFilterCustomer = $(this).attr("href").replace("#", "");
					var concept = $(this).text();
					$('.search-panel span#search_concept').text(concept);
					$('.input-group #search_param').val(param);
				});
				$('#btnSearch').click(function (e) {
					e.preventDefault();
					$('#tableCustomer').jtable('load', {
						name: $('#searchText').val(),
						option: param
					});
				});
				$('#btnSearch').click();
			});
		}
	}
})