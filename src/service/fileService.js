const File = require('../model/FileModel');
const sequelize = require('../utils/sequelize');
const ERROR = require('../config/error.json');
const { unlinkFile } = require('../utils/fileUtil');
const { fileNameValidator } = require('../validator/fileValidator');
const { getFileType } = require('../utils/fileUtil');

/**
 * 获取当前位置的文件列表
 * @param {*} uid 用户标识
 * @param {*} pos 所处位置,null则为根目录
 * @returns 
 */
const getFileList = async (uid, lid) => {
    const fileList = await File.findAll({
        attributes: ['fid', 'fname', 'url', 'uri', 'size', 'timestamp', 'type'],
        where: {
            uid,
            lid: lid || null
        }
    })

    return fileList
}

/**
 * 获取用户的已经使用的容量
 * @param {*} uid 用户标识
 * @returns 
 */
const getUsedCapacity = async (uid) => {
    const [res] = await File.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('size')), 'usedCapacity']],
        where: {
            uid
        }
    });

    return parseInt(res.dataValues.usedCapacity || 0);
}

/**
 * 保存文件
 * @param {*} file 文件信息
 */
const saveFile = async (file, capacity) => {
    const { fname, size, uid, uri } = file;

    // 判断文件是否已存在
    const res = await File.findOne({ where: { fname } });
    if (res) {
        // 删除文件
        await unlinkFile(uri);
        throw new ReqError(ERROR.FILE_EXIST, 'File exist');
    }

    // 判断容量是否充足
    const usedCapacity = await getUsedCapacity(uid);
    if (usedCapacity + size > capacity) {
        // 删除文件
        await unlinkFile(uri);
        throw new ReqError(ERROR.FULL_CAPACITY, 'Full capacity');
    }

    // 创建实例提交事务
    file.type = getFileType(fname);
    const fileInstance = await File.create(file);
    await fileInstance.save();
}

/**
 * 根据文件id删除文件
 * @param {*} fid 文件标识
 */
const deleteFile = async (fid, uri) => {
    if (!uri) {
        const res = await File.findOne({
            attributes: ['uri'],
            where: { fid }
        });
        if (res && res.dataValues) {
            uri = res.dataValues.uri;
        }
        else {
            throw new ReqError(ERROR.FILE_NOT_EXIST, 'File not exist');
        }
    }

    await File.destroy({ where: { fid } })
    await unlinkFile(uri);
}

const updateFileName = async (fid, fname) => {
    const { errors, isValid } = fileNameValidator(fname);

    // 验证输入合法性
    if (!isValid) {
        throw new ReqError(ERROR.INVALID_INPUT, 'Invalid input', errors);
    }

    const type = getFileType(fname);
    await File.update({ fname, type }, {
        where: { fid }
    });
}

const updateFileLid = async (fid, fdid) => {
    await File.update({ lid: fdid }, {
        where: { fid }
    });
}

module.exports = {
    getFileList,
    saveFile,
    deleteFile,
    updateFileName,
    getUsedCapacity,
    updateFileLid
}