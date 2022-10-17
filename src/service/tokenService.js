const Token = require('../model/tokenModel');
const jwt = require('../utils/jwt');
const ERROR = require('../config/error.json');

const insertToken = async (token, uid, ip) => {
    const [, created] = await Token.findOrCreate({
        where: { uid, ip },
        defaults: { token }
    })

    if (!created) {
        await Token.update({ token, timestamp: Date.now() }, {
            where: { uid, ip }
        })
    }
}

const verify = async (token, ip) => {
    const userInfo = jwt.jwtVerify(token);

    if(!userInfo) {
        throw new ReqError(ERROR.PERMISSION_DENIED, 'Permission denied');
    }

    const res = await Token.findOne({where: {
        uid: userInfo.uid,
        ip
    }})

    if(!res || res.token !== token) {
        throw new ReqError(ERROR.PERMISSION_DENIED, 'Permission denied');
    }

    return userInfo;
}

const removeToken = async (uid, ip) => {
    await Token.destroy({
        where: ip ? {uid, ip} : {uid}
    })
}

module.exports = {
    insertToken,
    verify,
    removeToken
}