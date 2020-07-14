var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const { sortBy, stubObject } = require('lodash');

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

// Comment schema
var CommentSchema = mongoose.Schema({
    commentId:{
        type: Number,
        required: true,
        unique: true
    },
    eventId: {
        type: Number,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

var Event = mongoose.model('event', EventSchema);
var Comment = mongoose.model('comment', CommentSchema);

router.get('/events/page/:page/sortBy/:sortBy/keyword/:keyword', (req, res, next) => {
    console.log(req.params.page, req.params.sortBy, req.params.keyword)
    let searchField = req.params.keyword.split('::')[0];
    let searchQuery = req.params.keyword.split('::')[1];
    let searchObj = {};
    if(searchField.length){
        searchObj[searchField] = {$regex: searchQuery};
    }
    console.log(searchObj)
    Event.find(
        searchObj,
        'event_id event_summary event_location event_date event_org',
        function (err, e) {
            if(err){
                res.send(err);
                return;
            }
            if(e){
                res.send(e);
            }else{
                res.send({err: "No event found"});
            }
        }
    ).skip((req.params.page - 1) * 10).limit(10).sort(req.params.sortBy);
})

router.get('/comments/eventId/:eventId/page/:page', (req, res, next) =>{
    Comment.find(
        {"eventId": req.params.eventId},
        'commentId userId content date',
        function (err, e) {
            if(err){
                res.send(err);
                return;
            }
            if(e){
                res.send(e);
            }else{
                res.send({err: "No event found"});
            }
        }
    ).skip((req.params.page - 1) * 5).limit(5).sort("-date");
})

// POST comment
router.post('/comments', (req, res)=>{
    console.log(req.body)
    if(req.body.eventId && req.body.userId && req.body.content && req.body.date){
        Comment.count({}, (err, count) => {
            if(err){
                res.send(err);
                return;
            }
            var c = new Comment ({
                commentId: count + 1,
                eventId: req.body.eventId,
                userId: req.body.userId,
                content: req.body.content,
                date: req.body.date,
            });
            c.save((err)=>{
                if(err){
                    res.send(err)
                    return;
                }
                res.send(c);
            });
        })
    }else{
        res.send({err: 'Invalid params'});
    }
});


// DELETE comment
router.delete('/comments/:commentId', (req, res)=>{
    Comment.findOne(
        {commentId: req.params.commentId},
        (err, c) => {
            if(err){
                res.send(err);
                return;
            }
            res.send(c)
        }
    ).remove()
});

module.exports = router 