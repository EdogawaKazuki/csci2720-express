var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var https = require('https');
const { sortBy, stubObject } = require('lodash');
const session = require('express-session');

// connect to DB
mongoose.connect('mongodb://localhost:27017/csci2720');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection errr:'));
db.once('open', () => {
  console.log("connection is open");
})

// Event schema
var EventSchema = mongoose.Schema({
    event_id: {
        type: Number,
        required: true,
        unique: true
    },
    event_summary: {
        type: String,
        required: true
    },
    event_org: {
        type: String,
        required: true
    },
    event_location: {
        type: String,
        required: true
    },
    event_date: {
        type: String,
        required: true
    },
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
    if(!req.session.loginStatus){
        res.send({err:'notLogin', sessionID: req.sessionID, login: req.session.loginStatus});
        return;
    }
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

router.get('/comments/eventId/:eventId/page/:page', (req, res, next) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
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
router.post('/comments', (req, res) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
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
router.delete('/comments/:commentId', (req, res) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
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

// DELETE event
router.delete('/event/:eventId', (req, res) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
    console.log(req.params.eventId)
    Event.findOne(
        {event_id: Number(req.params.eventId)},
        (err, e) => {
            if(err){
                res.send(err);
                return;
            }
            res.send(e)
        }
    ).remove()
});

// update event
router.put('/event', (req, res) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
    console.log(req.body)
    if(req.body.event_id && req.body.event_summary && 
        req.body.event_org && req.body.event_date &&
        req.body.event_location){
            Event.findOne(
                {event_id: Number(req.body.event_id)},
                'event_id event_summary event_location event_date event_org',
                (err, e) => {
                    if(err)
                        res.send(err);
                    if(e){
                        e.event_summary = req.body.event_summary;
                        e.event_location = req.body.event_location;
                        e.event_date = req.body.event_date;
                        e.event_org = req.body.event_org;
                        e.save()
                        console.log(e)
                        res.send(e);
                    }else{
                        res.send({err:"No Event Found"});
                    }
                }
            );
    }else{
        res.send({err: 'Invalid params'});
    }
})

// new event
router.post('/event', (req, res) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
    console.log(req.body)
    if(req.body.event_summary && 
        req.body.event_org && req.body.event_date &&
        req.body.event_location){
        Event.findOne({}, 'event_id', (err, eMax) => {
            if(err){
                res.send(err);
                return;
            }
            console.log(eMax.event_id)
            var e = new Event ({
                event_id: eMax.event_id + 1,
                event_summary: req.body.event_summary,
                event_org: req.body.event_org,
                event_date: req.body.event_date,
                event_location: req.body.event_location
            });
            e.save((err)=>{
                if(err){
                    res.send(err)
                    return;
                }
                res.send(e);
            });
        }).sort('-event_id')
    }else{
        res.send({err: 'Invalid params'});
    }

})

// flush data
router.get('/event', (req, res) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
    console.log('flush Data')
    let request = https.get('https://ogcef.one.gov.hk/event-api/eventList', (response) => {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
            data += chunk;
        })
        response.on('end', () => {
            data = JSON.parse(data)
            Event.find({}).remove();
            for(let event of data){
                if(event.event_location && event.event_summary &&
                    event.event_org && event.event_date){
                    var e = new Event ({
                        event_id: event.event_id,
                        event_summary: event.event_summary,
                        event_org: event.event_org,
                        event_date: event.event_date,
                        event_location: event.event_location
                    });
                    e.save();
                }
            }
            res.send({msg: 'success'});
        })
    })
    
})

// test
router.get('/', (req, res) => {
    if(!req.session.loginStatus){
        res.send({err:'notLogin'});
        return;
    }
    res.send({msg: 'logout', sessionId: req.sessionID, login: req.session.loginStatus});
})


module.exports = router 