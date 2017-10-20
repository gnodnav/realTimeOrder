app.controller('employeesCtrl', ['$scope', '$rootScope', '$localStorage', 'Notification', '$state', function ($scope, $rootScope, $localStorage, Notification, $state) {
	//$scope.param = 'name';
	$scope.reloadSearch = function () {
		$(document).ready(function () {
			if ($localStorage.opitionFilterEmpl === undefined)
				$localStorage.opitionFilterEmpl = 'name';

			$('#tableEmployee').jtable('load', {
				name: $('#searchText').val(),
				option: $localStorage.opitionFilterEmpl
			});
		})
	}
	$scope.employees = {
		EmplID: {
			title: 'Empl ID',
			key: true,
			create: true,
			edit: false,
			list: true,
			width: '5%',
		},
		EmplRcd: {
			title: 'EmplRcd',
			create: true,
			edit: true,
			list: false,
			defaultValue: 0
		},
		Name: {
			title: 'Name',
			//	width: '8%',
			create: true,
			edit: true
		},
		ChildDepartment: {
			title: 'Child Department',
			//	width: '15%',
			create: true,
			edit: true
		},
		OfficerCode: {
			title: 'Officer Code',
			//	width: '10%',
			create: true,
			edit: true
		},
		Mail: {
			title: 'Mail',
			//width: '10%',
			create: true,
			edit: true,
			inputClass: 'validate[required,custom[email]]',

		},
		authorities: {
			title: 'Authorities',
			width: '5%',
			create: true,
			edit: true,
			options: { 'AM': 'AM', 'Admin': 'Admin', 'POM': 'POM', 'Manager': 'Manager' }
		}
	}
}]).directive('employeeTable', function ($localStorage) {
	return {
		restrict: 'AECM',
		scope: true,
		template: "<div></div>",
		controller: function ($scope, Notification) {
			$(document).ready(function () {
				$(`#tableEmployee`).jtable({
					title: 'Employees',
					paging: true, //Enables paging
					pageSize: 10, //Actually this is not needed since default value is 10.
					sorting: true, //Enables sorting
					defaultSorting: 'Name ASC', //Optional. Default sorting on first load.,
					jqueryuiTheme: true,
					messages: {
						addNewRecord: 'Add new employee'
					},
					actions: {
						listAction: function (postData, jtParams) {
							return $.Deferred(function ($dfd) {
								$.ajax({
									url: '/api/employeeList?jtStartIndex=' + jtParams.jtStartIndex + '&jtPageSize=' + jtParams.jtPageSize + '&jtSorting=' + jtParams.jtSorting,
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
									url: '/api/deleteEmployee',
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
									url: '/api/CreateEmployee',
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
									url: '/api/updateEmployee',
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
					fields: $scope.employees
				});
				$('.search-panel .dropdown-menu').find('a').click(function (e) {
					e.preventDefault();
					$scope.param = $(this).attr("href").replace("#", "");
					$localStorage.opitionFilterEmpl = $(this).attr("href").replace("#", "");
					var concept = $(this).text();
					$('.search-panel span#search_concept').text(concept);
					$('.input-group #search_param').val($scope.param);
				});
				$('#btnSearch').click(function (e) {
					e.preventDefault();
					$('#tableEmployee').jtable('load', {
						name: $('#searchText').val(),
						option: $scope.param
					});
				});
				$('#btnSearch').click();
			});
		}
	}
})