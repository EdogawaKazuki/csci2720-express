var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


// Comment schema
var UserSchema = mongoose.Schema({
  userId:{
      type: Number,
      required: true,
      unique: true
  },
  userName: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  password: {
      type: String,
      required: true
  }
});

var User = mongoose.model('user', UserSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//login
router.post('/login', function(req, res, next){
  if(req.body.email && req.body.password){
    User.findOne(
      {email: req.body.email},
      'userId userName password',
      (err, u) => {
        if(err){
          res.send(err);
          return;
        }
        if(u && bcrypt.compareSync(Buffer.from(req.body.password, 'base64').toString(), u.password)){
          req.session.loginStatus = true;
          req.session.userId = u.userId;
          req.session.userName = u.userName;
          res.send({
            msg: 'success', 
            userId: u.userId, 
            userName: u.userName,
            loginStatus: req.session.loginStatus
          });
        }else{
          req.session.loginStatus = false;
          res.send({
            msg: 'fail', 
            loginStatus: req.session.loginStatus
          });
        }
      }
    )
  }else{
    res.send({err: 'Invalid params'})
  }
})

//logout
router.all('/logout', function(req, res, next){
  req.session.loginStatus = false;
  res.send({msg: 'logout', loginStatus: req.session.loginStatus});
})

module.exports = router;
