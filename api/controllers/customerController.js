var models = require('../models/model.js');
module.exports = function (app) {
	var customer = models.customer;
	//jtable
	function filterItems(query, array) {
		return array.filter(function (el) {
			switch (query.option) {
				case 'id':
					return el.customerID.toString().toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
				case 'name':
					return el.name.toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
				case 'mail':
					return el.mail.toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
				default:
					return el.name.toLowerCase().indexOf(query.name.toLowerCase()) > -1
					break;
			}
			//return el.Name.toLowerCase().indexOf(query.toLowerCase()) > -1;
		})
	}
	app.post("/api/customerList/?", function (req, res) {
		customer.find({}, function (err, result) {
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
	app.delete("/api/deleteCustomer", function (req, res) {
		customer.remove({ customerID: req.body.customerID }, function (err, result) {
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

	app.post("/api/CreateCustomer", function (req, res) {
		console.log(req.body);
		req.body.customerID = Date.now();
		customer.create(req.body, function (err, result) {
			var data = req.body;
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

	app.put('/api/updateCustomer', function (req, res) {
		var Customer = req.body;
		customer.update({ customerID: Customer.customerID }, {
			customerID: Customer.customerID,
			name: Customer.name,
			address: Customer.address,
			sdt: Customer.sdt,
			mail: Customer.mail
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
