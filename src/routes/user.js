const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName age gender skills about photoUrl";

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', USER_SAFE_DATA);

        res.json({ message: "data fetched successfully", data: connectionRequests});
    } catch(err) {
        res.status(400).send('ERROR: ' + err.message);
    }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: 'accepted'},
                { toUserId: loggedInUser._id, status: 'accepted'}
            ]
        })
        .populate('fromUserId', USER_SAFE_DATA)
        .populate('toUserId', USER_SAFE_DATA);

        const data = connections.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({ message: "connections fetched successfully", data: data});
    } catch (err) {
        res.status(400).send('ERROR:  ' + err.message);
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = req.query.page || 1;
        let limit = req.query.limit || 10;
        limit = limit>50 ? 50 : limit;
        const step = (page-1)*limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: {$nin: Array.from(hideUsersFromFeed)}},
                { _id: {$ne: loggedInUser._id}}
            ]
        })
        .select(USER_SAFE_DATA)
        .skip(step)
        .limit(limit);

        res.json({data: users});
    } catch (err) {
        res.status(400).send({ message: `ERROR: ${err.message}`});
    }
})



module.exports = userRouter;