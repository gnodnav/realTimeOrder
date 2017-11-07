var models = require('../models/model.js');

module.exports = function (app, orderNumber) {
	var order = models.order;
	var file = models.file;
	var ncc = models.ncc;
	var account = models.account;
	var employee = models.employee;
	var customer = models.customer;
	//employee get orders 
	app.get('/api/order-list/orders/:id/:rom', function (req, res) {
		switch (req.headers.authorization) {
			case 'Admin':
			case 'Manager':
				order.find({ ChildDepartment: req.params.rom }, function (err, result) {
					if (err) {
						res.status(500).json(err);
						throw err;
					}
					else {
						res.json({
							result: true,
							data: result
						})
					}
				})
				break;
			case 'POM':
				order.find({ approve: true }, function (err, result) {
					if (err) {
						res.status(500).json(err);
						throw err;
					}
					else {
						res.json({
							result: true,
							data: result
						})
					}
				})
				break;
			case 'Administrator':
				order.find({}, function (err, result) {
					if (err) {
						res.status(500).json(err);
						throw err;
					}
					else {
						res.json({
							result: true,
							data: result
						})
					}
				})
				break;
			default:
				order.find({ EmplID: req.params.id }, function (err, result) {
					if (err) {
						res.status(500).json(err);
						throw err;
					}
					else {
						res.json({
							result: true,
							data: result
						})
					}
				})
				break;
		}
	})
	//employee get order 
	app.get('/api/order-list/order/:id', function (req, res) {
		// var check = {};
		// switch (req.headers.authorization) {
		// 	case 'Admin':
		// 	case 'Manager':
		// 	case 'Administrator':
		// 	case 'POM':
		// 		check = { poNumber: req.params.id }
		// 		break;
		// 	case 'AM':
		// 		check = { poNumber: req.params.id, EmplID: req.params.id }
		// 		break;
		// 	default:
		// 		break;
		// }
		// console.log(check);	

		order.find({ poNumber: req.params.id }, function (err, result) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			else {
				res.json({
					result: true,
					data: result[0]
				})
			}
		})
	})
	//add order
	app.post('/api/dashboard/create-order/', function (req, res) {
		var data = req.body;
		var dateTime = new Date();
		if (req.headers.authorization == "POM" || req.headers.authorization == "Manager") {
			data.status = 'Pending';
			data.approve = true
		}
		data.poNumber = dateTime.getFullYear() + "_" + orderNumber;
		order.create(data, function (err, result) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			else {
				res.json({
					result: true,
					data: result
				})

				orderNumber++;
			}
		});
	})
	//dowload file
	app.get('/api/dowload/:id', function (req, res) {
		if (req.headers.authorization === 'Administrator' || req.headers.authorization === 'POM') {
			file.find({ idFile: req.params.id }, function (err, result) {
				if (err) {
					res.status(500).json(err);
					throw err;
				}
				else {
					res.json({
						result: true,
						id: result[0].idFile,
						record: result[0].files
					})
				}
			})
		}
		else {
			file.aggregate(
				{
					$match: { idFile: req.params.id }
				},
				{ $unwind: "$files" },
				{ $match: { "files.isPom": 'false' } }, function (err, result) {
					if (err) {
						res.status(500).json(err);
						throw err;
					}
					else {
						var data = [];
						result.forEach(function (file) {
							data.push(file.files);
						}, this);
						
						res.json({
							result: true,
							id: result[0].idFile,
							record: data
						})
					}
				})
		}

	})
	//approve order
	app.put('/api/order-list/approve/:id', function (req, res) {
		if (req.headers.authorization === 'Manager' || req.headers.authorization === "Administrator") {
			order.update({ poNumber: req.params.id }
				, {
					approve: true,
					status: 'Pending'
				}
				, function (err, result) {
					if (err) {
						res.status(500).json(err);
						throw err;
					}
					else
						res.json({
							result: true,
							data: result
						})
				})
		} else
			res.status(500).json();
	})

	//set NCC
	app.put('/api/order-list/setncc/:id', function (req, res) {
		order.update({ poNumber: req.params.id, "products.pnNumber": req.body.items.pnNumber }, {
			$set: { "products.$.NCCTT": req.body.data.NCCDN, "products.$.priceTT": req.body.data.unitPrice }
		}, function (err, result) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			else
				res.json({
					result: true,
					data: result
				})
		});
	})
	//create ncc
	app.post('/api/order-list/createncc/', function (req, res) {
		var data = req.body;
		ncc.create(data, function (err, result) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			else {
				res.json({
					result: true,
					data: result
				})
			}
		});
	})
	//get ncc
	app.get('/api/order-list/getncc/:id', function (req, res) {
		//	console.log(req.params.id);
		ncc.find({ name: req.params.id }, function (err, result) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			else {
				res.json({
					result: true,
					data: result
				})
			}
		})
	})
	app.put('/api/order-list/update-order/', function (req, res) {
		if (req.headers.authorization == 'POM' || req.headers.authorization == 'Administrator') {
			var data = req.body;
			order.update({ poNumber: data.poNumber }, {
				products: data.products,
				status: data.status,
				notePOM: data.notePOM,
				totalPrice: data.totalPrice
			}, function (err, result) {
				if (err) {
					res.status(500).json(err);
					throw err;
				}
				else {
					res.json({
						result: true,
						data: result
					})
				}

			})
		} else
			res.status(500).json;
	})

	app.get('/api/order/get-customers/', function (req, res) {
		customer.find({}, function (err, result) {
			if (err)
				throw err;
			else
				res.json(result);
		});

	})

}
