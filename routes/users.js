var express = require('express');
var router = express.Router();
var api = require('../logic/api.js');

router.use("/",function(req,res,next){
  var action = req.body.action;
  var args = req.body.args?JSON.parse(req.body.args):null;

  //为了双端联调 开启ajax跨域访问
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','POST');
  res.header('Access-Control-Allow-Headers','x-requested-with,content-type');

  if(api[action])
  {
    try{console.log(req.body);api[action](res,args);}
    catch (e){console.log(e.stack);}
  }
  else
  {
    next();
  }
});
module.exports = router;
