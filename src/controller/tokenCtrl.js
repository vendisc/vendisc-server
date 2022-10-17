const tokenService = require('../service/tokenService');

exports.jwtVerify = async (ctx, next) => {
    const { authorization = '' } = ctx.request.header;
    const ip = ctx.request.ip;

    const userInfo = await tokenService.verify(authorization, ip);

    ctx.state.user = userInfo;

    await next();
}