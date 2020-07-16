var express = require('express');
const { render } = require('../app');
const session = require('express-session');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//login
router.post('/login', function(req, res, next){
  req.session.loginStatus = true;
  //res.setHeader('Access-Control-Allow-Credentials', true);
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.send({msg: 'login', sessionid: req.sessionID, loginStatus: req.session.loginStatus});
})

//logout
router.all('/logout', function(req, res, next){
  req.session.loginStatus = false;
  res.send({msg: 'logout', loginStatus: req.session.loginStatus});
})

module.exports = router;
