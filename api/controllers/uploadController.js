var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var models = require('../models/model.js');
var file = models.file;

module.exports = function (app) {
	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/uploads/')
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + '-' + file.originalname)
		}
	});
	var upload = multer({ storage: storage });
	app.post('/api/upload/', upload.any(), function (req, res, next) {
		var data = {
			poNumber: req.body.tags,
			files: req.files
		}
		file.create(data, function (err, result) {
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
}