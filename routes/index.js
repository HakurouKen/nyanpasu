var express = require('express'),
	nyanpasu = require('../nyanpasu');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	nyanpasu.get().then(function(data){
		res.render('index', {
			nyanpasu: data
		});
	});
});

router.get('/get', function(req, res, next) {
	nyanpasu.get().then(function(data) {
		res.json({
			nyanpasu: data
		});
	});
});

router.get('/add', function(req, res, next) {
	nyanpasu.inc().then(function(data) {
		res.json({
			nyanpasu: data
		});
	});
});

module.exports = router;