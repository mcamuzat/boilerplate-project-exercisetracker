const User = require('../models/user');

const router = require('express').Router();

router.post('/new-user', (req, res, next) => {
  const user = new User(req.body);
  user.save((err, savedUser) => { 
    if (err) return next(err);
    res.json({
      username: savedUser.username,
      _id: savedUser._id
    })
  })
})

router.get('/users', (req,res,next) => {
  User.find({}, (err, data) => {
    if (err) return next(err);
    res.json(data)
  })
})

router.post('/add', (req, res, next) => {
  User.findById(req.body.userId, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return next(err)
    }
    // date is opionnal
    let date = new Date().toISOString().substring(0,10);
    if (req.body.date) {
        date = req.body.date;
    } 

    // format everybody 
    //var date = new Date(req.body.date).toDateString();
    var duration = parseInt(req.body.duration,10);

    var exercise = {
      description: req.body.description,
      duration: duration,
      date: date
    };

    User.findByIdAndUpdate(
    req.body.userId,
    { $push: { exercise: exercise } },
    (err, result) => {
      console.log(err, result, exercise, req.body.userId);
      if (err) return next(err);
      res.json({
        username: result.username,
        description: exercise.description,
        duration: exercise.duration,
        _id: result._id,
        date:new Date(exercise.date).toDateString()
      });
    });
  }); 
});

router.get('/log', (req, res, next) => {
  var userId = req.query.userId;
  var from = req.query.from;
  var to = req.query.to;
  let limit = 100;
  if (req.query.limit) {
    limit = parseInt(req.query.limit,10);
  }

  User.findById(userId, (err, doc) => {
      if (err) return next(err);

      let exercise = doc.exercise;
      let log = [];
      
      if (from&&to) {
        from = new Date(from);
        to = new Date(to);
        exercise = exercise.filter(x => x.date >= from)
                .filter(x => x.date <= to)
      }
      
      if (limit > 0) {
        limit = Math.min(limit, exercise.length)
      }
      for (let i = 0; i < limit; i++) {
          log.push({
            description: exercise[i].description,
            duration: parseInt(exercise[i].duration),
            date: exercise[i].date
          });
      }
      return res.json({
          _id: userId,
          username: doc.username,
          count: log.length,
          log: log
        });
  });


});

module.exports = router