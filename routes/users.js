var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');

var url = 'mongodb://localhost:27017/';

function sessionExists(req, res){
  if(!req.session.user) res.render('login', {layout: 'loginLayout', errMsg: 'Session expired.'});
  else return true;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/createUser', function(req, res, next){
  if(sessionExists(req, res)){ //AUTHENTICATE INSTEAD OF SESSION ONLY
    //check if userID exists
    //check password
    //insert user {userID, password, usertype, createdby, datecreated}
  }
});

module.exports = router;
