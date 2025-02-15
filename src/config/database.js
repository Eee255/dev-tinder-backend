
const mongoose = require("mongoose");

const connectionDB = async () => {
    await mongoose.connect(
        "mongodb+srv://bhanu171:kZP3YurHFp8LtFS6@bhanu.rul9b.mongodb.net/devTinder"
    );
}

module.exports = connectionDB