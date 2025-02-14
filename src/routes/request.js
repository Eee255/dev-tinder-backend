
const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const ALLOWED_STATUS = ['interested','ignored'];

        if (!ALLOWED_STATUS.includes(status)){
            throw new Error('Invalid status');
        }

        const isToUserExists = await User.findById(toUserId);

        if (!isToUserExists){
            throw new Error('user not found!');
        }

        const isConnectionRequestExist = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId}
            ]
        });

        if (isConnectionRequestExist) {
            return res.status(404).json({ message: 'connection request already exist!'});
        }
        const request = await ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await request.save();
        res.json({message: `connection request ${status}`});

    } catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }
});

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedUser = req.user;
        const { status, requestId } = req.params;
        const allowedStatus = ['accepted', 'rejected'];

        if (!allowedStatus.includes(status)){
            return res.status(404).json({ message: 'Status not allowed'});
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedUser,
            status: 'interested'
        });

        if (!connectionRequest){
            return res.status(404).json({ message: 'Request not found'});
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({ message: `request ${status} successfully!`, data});
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
})

module.exports = requestRouter;