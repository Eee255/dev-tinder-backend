const crypto = require('crypto');

let otp = null;
const OtpGenerator = async () => {
    await crypto.randomInt(100000, 999999), (err, n) => {
        if(err) throw err;
        otp = n;
        console.log(n);
    }
}
console.log(otp);