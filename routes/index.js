var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');

var url = 'mongodb://localhost:27017/';

function sessionExists(req, res){
  if(!req.session.user) res.render('login', {layout: 'loginLayout', errMsg: 'Session expired.'});
  else return true;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', {layout: 'loginLayout'}); //adjust for dashboard
});

router.post('/validateLogin', function(req, res, next){

  mongo.connect(url, {useNewUrlParser: true}, function(err, db){
    assert.equal(null, err);
    if (err) throw err;
    dbo = db.db("Diner");
    
    var userID = req.body.username.toUpperCase();

    dbo.collection("UserInfo").findOne({userID: userID}, function(err, result){
      if(err) throw err;
      if(result){
        if(result.password != req.body.password)
          res.render('login', {layout: 'loginLayout', errMsg: 'Incorrect password.'});
        else{
          req.session.user = {
            userID: result.userID,
            userType: result.userType
          };
          res.render('newUser', {user: req.session.user});
        }
      }
      else //No Result
        res.render('login', {layout: 'loginLayout', errMsg: 'Invalid username.'});
      db.close();
    });
  });
});

router.get('/logout', function(req, res, next){
  if(sessionExists(req, res)){

    req.session.user = null;

    res.render('login', { 
      layout: 'loginLayout', 
      successMsg: 'Successfully logged out.'
    });
  }
});

router.get('/changePassword', function(req, res, next){
  if(sessionExists(req, res)){
    res.render('changePassword', {
      user: req.session.user
    });
  }
});

router.post('/updatePassword', function(req, res, next){
  if(sessionExists(req, res)){
    if(req.body.newPass != req.body.confirmPass){
      res.render('changePassword', {
        user: req.session.user,
        errMsg: "New and Confirm Passwords did not match."
      });
    }
    else{
      mongo.connect(url, {useNewUrlParser: true}, function(err, db){
        assert.equal(null, err);
        if (err) throw err;
        dbo = db.db("Diner").collection("UserInfo");
        dbo.findOne({userID: req.session.user.userID}, function(err, result){
          if(err) throw err;
          if(result){
            if(result.password != req.body.oldPass){
              res.render('changePassword', {
                errMsg: 'Incorrect old password.',
                user: req.session.user
              });
            }
            else{
              dbo.updateOne({userID: req.session.user.userID}, {$set: {password: req.body.newPass}}, function(err, result){
                if(err) throw err;
                req.session.user = null;
                res.render('login', {layout: 'loginLayout', successMsg: "Password successfully changed."});
              });
            }
          }
          db.close();
        });
      });
    }
  }
});

module.exports = router;
