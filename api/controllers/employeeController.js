var models = require('../models/model.js');
module.exports = function (app) {
	var accounts = models.account;
	var employee = models.employee;
	//login
	app.post('/api/login/', function (req, res) {
		var data = {
			Username: req.body.Username,
			Password: req.body.Password
		};
		accounts.find(data, function (err, result) {
			if (err)
				return res.status(500).json(err);
			else {
				if (result.length > 0)
					res.json(result);
				else res.json(-1);
			}
		});
	})
	//get info employee
	app.get("/api/user-info/:id", function (req, res) {
		var EmplID = parseInt(req.params.id);
		employee.find({ EmplID: EmplID }, function (err, result) {
			if (err)
				throw err;
			else
				res.json(result);
		});
	});
	//update info employee
	app.put('/api/update-info', function (req, res) {
		var Employee = req.body;
		employee.update({ _id: Employee._id }, {
			EmplRcd: Employee.EmplRcd,
			Name: Employee.Name,
			ChildDepartment: Employee.ChildDepartment,
			OfficerCode: Employee.OfficerCode,
			//	JobTitle: employee,
		}, function (err, result) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			else {
				res.json({
					result: true,
					data: result
				});
			}
		})
	})
	//change password employee
	app.put('/api/change-password', function (req, res) {
		accounts.update({ EmplID: req.body.EmplID }, {
			Password: req.body.Password
		}, function (err, result) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			else {
				res.json({
					result: true,
					data: result
				});
			}
		})
	})
	//jtable
	function filterItems(query, array) {
		return array.filter(function (el) {
			switch (query.option) {
				case 'id':
					return el.EmplID.toString().toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
				case 'name':
					return el.Name.toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
				case 'cd':
					return el.ChildDepartment.toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
				case 'oc':
					return el.OfficerCode.toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
				default:
					return el.Name.toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
			}
			//return el.Name.toLowerCase().indexOf(query.toLowerCase()) > -1;
		})
	}
	app.post("/api/employeeList/?", function (req, res) {
		employee.find({}, function (err, result) {
			if (err) {
				res.json({
					Result: "ERROR", Message: err
				});
				throw err;
			}
			else {
				var data = filterItems({
					name: req.body.name,
					option: req.body.option
				}, result);
				var length = data.length;
				res.json({
					Result: "OK",
					Records: data.splice(req.query.jtStartIndex, req.query.jtPageSize),
					TotalRecordCount: data.length
				});
			}

		});
	});
	app.delete("/api/deleteEmployee", function (req, res) {
		if (req.body.EmplID == 0) {
			res.json({
				Result: "ERROR", Message: res.status(500)
			});
			return;
		}
		employee.remove({ EmplID: req.body.EmplID }, function (err, result) {
			if (err) {
				res.json({
					Result: "ERROR", Message: err
				});
				throw err;
			}
			else
				res.json({
					Result: "OK"
				});
		});
	});

	app.post("/api/CreateEmployee", function (req, res) {
		employee.create(req.body, function (err, result) {
			var data = req.body;
			data.EmplID = parseInt(data.EmplID, 10);
			if (err) {
				res.json({
					Result: "ERROR", Message: err
				});
				throw err;
			}
			else
				res.json({
					Result: "OK",
					Record: req.body
				});
		});
	});

	app.put('/api/updateEmployee', function (req, res) {
		var Employee = req.body;
		employee.update({ EmplID: Employee.EmplID }, {
			EmplRcd: Employee.EmplRcd,
			Name: Employee.Name,
			ChildDepartment: Employee.ChildDepartment,
			OfficerCode: Employee.OfficerCode,
			authorities: Employee.authorities,
			JobTitle: Employee.JobTitle,
		}, function (err, result) {
			if (err) {
				res.json({
					Result: "ERROR", Message: err
				});
				throw err;
			}
			else {
				res.json({
					Result: "OK"
				});
			}
		})
	})

}
