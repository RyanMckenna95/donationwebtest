let Donation = require('../models/donations');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let uriUtil = require('mongodb-uri');
const dotenv = require('dotenv');
dotenv.config();


//var mongodbUri ='mongodb://donationsdb:donationsdb999@ds255260.mlab.com:55260/donationsdb';

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } },
    user: 'YOURMONGODBUSERNAME', pass: 'YOURMONGODBPASSWORD' };

var mongodbUri = `mongodb://ruser:test123@ds029287.mlab.com:29287/heroku_bmwbk872`;
var mongooseUri = uriUtil.formatMongoose(mongodbUri);

//mongoose.connect(mongodbUri);
mongoose.connect(mongooseUri,options);

//mongoose.connect('mongodb://localhost:27017/donationsdb');

let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ] on mlab.com');
});

router.findAll = (req, res) => {
    // Return a JSON representation of our list
    res.setHeader('Content-Type', 'application/json');

    Donation.find(function(err, donations) {
        if (err)
            res.send(err);

        res.send(JSON.stringify(donations,null,5));
    });
}

router.findOne = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    Donation.find({ "_id" : req.params.id },function(err, donation) {
        if (err)
            res.json({ message: 'Donation NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(donation,null,5));
    });
}

function getTotalVotes(array) {
    let totalVotes = 0;
    array.forEach(function(obj) { totalVotes += obj.upvotes; });
    return totalVotes;
}

router.addDonation = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    var donation = new Donation();

    donation.paymenttype = req.body.paymenttype;
    donation.amount = req.body.amount;

    donation.save(function(err) {
        if (err)
            res.json({ message: 'Donation NOT Added!', errmsg : err } );
        else
            res.json({ message: 'Donation Successfully Added!', data: donation });
    });
}

router.incrementUpvotes = (req, res) => {
    // Find the relevant donation based on params id passed in
    // Add 1 to upvotes property of the selected donation based on its id
    var donation = getByValue(donations,req.params.id);

    if (donation != null) {
        donation.upvotes += 1;
        res.json({status : 200, message : 'UpVote Successful' , donation : donation });
    }
    else
        res.send('Donation NOT Found - UpVote NOT Successful!!');

}

router.incrementUpvotes = (req, res) => {

    Donation.findById(req.params.id, function(err,donation) {
        if (err)
            res.json({ message: 'Donation NOT Found!', errmsg : err } );
        else {
            donation.upvotes += 1;
            donation.save(function (err) {
                if (err)
                    res.json({ message: 'Donation NOT UpVoted!', errmsg : err } );
                else
                    res.json({ message: 'Donation Successfully Upvoted!', data: donation });
            });
        }
    });
}

router.deleteDonation = (req, res) => {

    Donation.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.json({ message: 'Donation NOT DELETED!', errmsg : err } );
        else
            res.json({ message: 'Donation Successfully Deleted!'});
    });
}

router.findTotalVotes = (req, res) => {

    Donation.find(function(err, donations) {
        if (err)
            res.send(err);
        else
            res.json({ totalvotes : getTotalVotes(donations) });
    });
}

module.exports = router;