module.exports = function(sequelize, DataTypes){
  var Authors = sequelize.define("Authors", {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models){
        // Authors.hasMany(models.Images);
      }
    }
  });

  return Authors;
};