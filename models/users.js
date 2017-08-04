module.exports = function(sequelize, DataTypes){
  var Users = sequelize.define("Users", {
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models){
        // Authors.hasMany(models.Images);
      }
    }
  });

  return Users;
};