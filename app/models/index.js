const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.category = require("./category.model.js")(sequelize, Sequelize);
db.login = require("./login.model.js")(sequelize, Sequelize);
db.LoginMeta = require("./login_meta.model.js")(sequelize, Sequelize);
db.townships = require("./townships.model.js")(sequelize, Sequelize);
db.plots = require("./plots.model.js")(sequelize, Sequelize);
db.blocks = require("./blocks.model.js")(sequelize, Sequelize);
db.booking = require("./booking.model.js")(sequelize, Sequelize);
db.broker = require("./brokers.model.js")(sequelize, Sequelize);
db.state = require("./state.model.js")(sequelize, Sequelize);
db.city = require("./city.model.js")(sequelize, Sequelize);

/*Login - user meta relationship */
db.login.hasOne(db.LoginMeta);
db.LoginMeta.belongsTo(db.login);


/*Township - blocks relationship */
db.townships.hasMany(db.blocks);
db.blocks.belongsTo(db.townships);
db.townships.belongsTo(db.state,{
  foreignKey : 'stateId',
  targetKey : 'id'
});
db.townships.belongsTo(db.city,{
  foreignKey : 'cityId',
  targetKey : 'id'
}); 

/*Block - plots relationship */
db.blocks.hasMany(db.plots);
db.plots.belongsTo(db.blocks); 
db.plots.belongsTo(db.townships);

db.booking.belongsTo(db.townships);
db.booking.belongsTo(db.blocks);
db.booking.belongsTo(db.plots);
db.booking.belongsTo(db.broker);

/*State - city relationship */
db.state.hasMany(db.city);
db.city.belongsTo(db.state);

module.exports = db;