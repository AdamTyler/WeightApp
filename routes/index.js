var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var router = express.Router();

var recSchema = mongoose.Schema({
  date: Date,
  weight: Number,
});
var Recording = mongoose.model('Recording', recSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  var avgWeight = 0;
  Recording.find({}).sort('-date').exec(function(err, rec){
    for(var i = 0; i < 7; i++){
      avgWeight += rec[i].weight;
    }
    res.render('index', { title: 'The Weight App', rec: rec, avg: avgWeight/7 });
  });
});

router.get('/record', function(req, res, next) {
  res.render('record');
});

router.post('/save', function(req, res, next) {
  var info = req.body;
  info.date = info.date + ' ' + moment().format('h:mm:ss');
  var rec = new Recording(info);

  rec.save(function(err) {
    if (err){
      console.log('Error in Saving weight: '+err);
      throw err;
    }
    console.log('save succesful');
    return res.redirect('/');
  });
});

module.exports = router;
