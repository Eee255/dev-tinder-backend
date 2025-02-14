const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status : {
        type: String,
        enum: {
            values : ['interested', 'ignored', 'accepted', 'rejected'],
            message : `{VALUE} is invalid status type`
        }
    }
},{ timestamps: true});

// creating compond indexing
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1});

connectionRequestSchema.pre('save', function (next) {
    const connectionRequest = this;
    if(connectionRequest.toUserId.equals(this.fromUserId)){
        throw new Error('cannot send connection request to yourself');
    }
    next();
})

const connectionRequestModel = mongoose.model('connectionRequest',connectionRequestSchema);

module.exports = connectionRequestModel;