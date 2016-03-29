var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
    res.locals.message = "hello";
    res.sendfile('index.html');
});

module.exports = router;
