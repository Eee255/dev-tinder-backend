
const express = require('express');
const { userAuth } = require('../middlewares/auth');
const Message = require('../models/message');
const messageRouter = express.Router();

messageRouter.get('/getMessages/:toUserId', userAuth, async (req, res) => {
    
    try {
        const toUserId = req.params.toUserId;
        const loggedInUserId = req.user._id.toString();
        const messages = await Message.find({
            $or: [
                { fromUserId: loggedInUserId, toUserId: toUserId}, 
                { fromUserId: toUserId, toUserId: loggedInUserId}
            ]
        }).sort({ createdAt: 1});

        if(!messages || messages.length === 0) {
            return res.json({message: "No messages found", data: []});
        }
        
        res.status(200).json({message: 'user messages retrived', data: messages});

    } catch(err) {
        res.status(400).send('ERROR: ' + err.message);
    }
});

messageRouter.post('/sendMessage/:toUserId/:fromUserId', async (req, res) => {
    const toUserId = req.params.toUserId;
    const { message, status } = req.body;
    const fromUserId = req.params.fromUserId;
    
    // Add your message handling logic here
    if (!toUserId || !message) {
        return res.status(400).json({ error: 'Missing userId or message' });
    }
    const newMessage = await Message({fromUserId, toUserId, message, status});
    await newMessage.save();
    // Process the message
    res.status(200).json({ success: true , data: newMessage});
});


module.exports = messageRouter;