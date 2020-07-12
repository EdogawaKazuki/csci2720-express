var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const { sortBy } = require('lodash');

// connect to DB
mongoose.connect('mongodb://localhost:27017/csci2720');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection errr:'));
db.once('open', () => {
  console.log("connection is open");
})

// Event schema
var EventSchema = mongoose.Schema({
    eventId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    loc: { type: String },
    quota: { type: Number }
});

var Event = mongoose.model('event', EventSchema);

router.get('/events', (req, res, next) => {
    res.redirect('./events/1');
});

router.get('/events/page/:page/sortBy/:sortBy', (req, res, next) => {
    console.log(req.params.page, req.params.sortBy)
    Event.find(
        {},
        'event_summary event_location event_date event_org',
        function (err, e) {
            if(err)
                res.send(err);
            if(e){
                res.send(e);
            }else{
                res.send({err: "No event found"});
            }
        }
    ).skip((req.params.page - 1) * 10).limit(10).sort(req.params.sortBy);
})


router.get('/search/:keyword', (req, res, next) => {
    Event.find(
        {name: {'$regex' : req.params.keyword}},
        'event_summary event_location event_date event_org',
        function (err, e) {
            if(err)
            res.send(err);
            console.log(e);
            if(e){
                res.send(e);
            }else{
                res.send({err: "No event found"});
            }
        }
    );
})


module.exports = router