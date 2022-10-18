const fileService = require('../service/fileService');
const folderService = require('../service/folderService');
const res = require('../utils/response');

exports.getCurList = async ctx => {
    const lid = ctx.header.lid;

    const fileListOrigin = await fileService.getFileList(lid);
    const folderListOrigin = await folderService.selectFolder(lid);

    const fileList = fileListOrigin.map(item => ({
        id: 'f_' + item.dataValues.fid,
        name: item.dataValues.fname,
        url: item.dataValues.url,
        uri: item.dataValues.uri,
        size: item.dataValues.size,
        timestamp: item.dataValues.timestamp,
        type: item.dataValues.type
    }))

    const folderList = folderListOrigin.map(item => ({
        id: 'fd_' + item.dataValues.fdid,
        name: item.dataValues.fdname,
        url: null,
        uri: null,
        size: null,
        timestamp: item.dataValues.timestamp,
        type: 'folder'
    }))

    ctx.body = res.success('get list success', [...folderList, ...fileList])
}