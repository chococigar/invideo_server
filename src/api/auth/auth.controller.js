const Joi = require('joi');
const Account = require('./../../models/account.js');


exports.localRegister = async (ctx) => {
    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(15).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required()
    });
    const result = Joi.validate(ctx.request.body, schema);

    if (result.error) {
        ctx.status = 400;
        ctx.body = {
            status: 400
        };
        return;
    }

    let existing = null;
    try {
        existing = await Account.findByEmailOrUsername(ctx.request.body);
    } catch (e) {
        ctx.body = {
            status:500
        };
        ctx.throw(500, e);
    }

    if (existing) {
        ctx.status = 409; 
        ctx.body = {
            status:409,
            key: existing.email === ctx.request.body.email ? 'email' : 'username'
        };
        return;
    }

    let account = null;
    try {
        account = await Account.localRegister(ctx.request.body);
    } catch (e) {
        ctx.body = {
            status:500
        };
        ctx.throw(500, e);
    }

    let token = null;
    try {
        token = await account.generateToken();
    } catch (e) {
        ctx.body = {
            status:500
        };
        ctx.throw(500, e);
    }

    let sessionId = null;
    try {
        sessionId = await account.generateOTsessionId();
    } catch (e) {
        ctx.body = {
            status:500
        };
        ctx.throw(500, e);
    }

    OTtoken = await account.generateOTToken(sessionId); 

    account.savecredentials(sessionId, token, OTtoken);

    ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
    ctx.cookies.set('OTsessionId', sessionId, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
    ctx.cookies.set('OTaccess_token', OTtoken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });

    ctx.body = 
    {
        status: 200,
        username : account.profile.username,
        credentials: {
            apiKey: process.env.API_KEY,
            sessionId: sessionId,
            token: OTtoken
        }
    };
};

exports.localLogin = async (ctx) => {
    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const result = Joi.validate(ctx.request.body, schema);

    if (result.error) {
        ctx.status = 400; // Bad Request
        ctx.body = {
            status:400
        };
        return;
    }

    const { email, password } = ctx.request.body; 

    let account = null;
    try {
        account = await Account.findByEmail(email);
    } catch (e) {
        ctx.body = {
            status:500
        };
        ctx.throw(500, e);
    }

    if(!account || !account.validatePassword(password)) {
        ctx.status = 403;
        ctx.body = {
            status:403
        };
        return;
    }

    let token = null;
    try {
        token = await account.generateToken();
    } catch (e) {
        ctx.body = {
            status:500
        };
        ctx.throw(500, e);
    }

    const sessionId = account.opentok.sessionId;

    console.log("inside login username is  " + account.profile.username)

    OTtoken = await account.generateOTToken(sessionId);

    account.savecredentials(sessionId, token, OTtoken);

    ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
    ctx.cookies.set('OTsessionId', sessionId, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
    ctx.cookies.set('OTaccess_token', OTtoken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
    
    ctx.body = 
    {
        status: 200,
        username : account.profile.username,
        credentials: {
            apiKey: process.env.API_KEY,
            sessionId: sessionId,
            token: OTtoken
        }
    };
    //account.profile;
};

exports.exists = async (ctx) => {
    const { key, value } = ctx.params;
    let account = null;

    try {
        // findByEmail or findByUsername depending on the key value
        account = await (key === 'email' ? Account.findByEmail(value) : Account.findByUsername(value));    
    } catch (e) {
        ctx.body = {
            status:500
        };
        ctx.throw(500, e);
    }

    ctx.body = {
        exists: account !== null
    };
};


exports.logout = async (ctx) => {
    ctx.cookies.set('access_token', null, {
        maxAge: 0, 
        httpOnly: true
    });
    ctx.status = 204;
    ctx.body = {
        status:204,
    };
};

exports.check = (ctx) => {
    const { user } = ctx.request;

    if(!user) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            status:403
        };
        return;
    }

    ctx.body = user;
};
