const sequelize = require('../utils/sequelize');
const Sequelize = require('sequelize');

const User = sequelize.define('user', {
    uid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uname: Sequelize.STRING(20),
    username: Sequelize.STRING(16),
    password: Sequelize.STRING(256),
    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 100 * 1024 * 1024  // 100mb
    },
    email: Sequelize.STRING(50)
}, {
    tableName: 't_user',
    timestamps:false
});

(async () => {
    await User.sync();
})();

module.exports = User;