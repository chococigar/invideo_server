const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');
const { generateToken } = require('./../lib/token');
const { generateOTToken2 } = require('./../lib/token');
const OpenTok = require('opentok');
var apiKey = process.env.API_KEY,
    apiSecret = process.env.API_SECRET;
var opentok = new OpenTok(apiKey, apiSecret);


function hash(password) {
    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');
}

const Account = new Schema({
    profile: {
        username: { type: String, lowercase: true },
    },
    email: { type: String, lowercase: true },
    social: {
        facebook: {
            id: String,
            accessToken: String
        },
        google: {
            id: String,
            accessToken: String
        }
    },
    opentok:{
        sessionId: String,
        accessToken: String
    },
    loginToken: String,
    password: String, // Hashed password
    thoughtCount: { type: Number, default: 0 }, // 서비스에서 포스트를 작성 할 때마다 1씩 올라갑니다
    createdAt: { type: Date, default: Date.now }
});

Account.statics.findByUsername = function(username) {
    return this.findOne({'profile.username': username}).exec();
};

Account.statics.findByEmail = function(email) {
    return this.findOne({email}).exec();
};

Account.statics.findByEmailOrUsername = function({username, email}) {
    return this.findOne({
        $or: [
            { 'profile.username': username },
            { email }
        ]
    }).exec();
};

Account.statics.localRegister = function({ username, email, password }) {
    const account = new this({
        profile: {
            username
        },
        email,
        password: hash(password)
    });

    return account.save();
};



Account.methods.validatePassword = function(password) {
    const hashed = hash(password);
    return this.password === hashed;
};

Account.methods.generateToken = function() {
    const payload = {
        _id: this._id,
        email: this.email
    };

    return generateToken(payload, 'account');
};

Account.methods.generateOTsessionId = function() {
    return new Promise(
        (resolve, reject) => {
            opentok.createSession(function(error, session){
                if (error) reject(error);
                resolve(session.sessionId);    
            });
        }
    );
};

Account.methods.generateOTToken = function(sessionId) {
    return new Promise(
        (resolve, reject) => {
            resolve(opentok.generateToken(sessionId));
        }
    );
};

Account.methods.saveOTsessionId = function(sessionId) {
    this.opentok.sessionId = sessionId;
    return this.save();
};

Account.methods.saveOTToken = function(token) {
    this.opentok.accessToken = token;
    return this.save();
};

Account.methods.saveloginToken = function(token) {
    this.loginToken = token;
    return this.save();
};


Account.methods.savecredentials = function(sessionId, token, OTtoken) {
    this.opentok.sessionId = sessionId;
    this.loginToken = token;
    this.opentok.accessToken = OTtoken;
    return this.save();
};


module.exports = mongoose.model('Account', Account);