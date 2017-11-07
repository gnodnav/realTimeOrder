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
			idFile: req.body.tags,
			files: req.files
		}
		//	console.log(req.files);

		if (req.body.mail == 'true') {
			for (var i = 0; i < req.files.length; i++)
				req.files[i].isPom = 'true';

			file.update(
				{ idFile: data.idFile },
				{
					// $push: {
					// 	files: data.files[0],
					// 	$position: 0
					// }
					$push: { files: { $each: [data.files[0]], $position: 0 } }
				}
				, function (err, result) {
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
		} else {
			for (var i = 0; i < req.files.length; i++)
				req.files[i].isPom = 'false';

			file.create(data, function (err, result) {
				if (err) {
					res.status(500).json(err);
					throw err;
				}
				else {
					console.log(result);
					res.json({
						result: true,
						data: result
					})
				}
			})
		}
	})
}