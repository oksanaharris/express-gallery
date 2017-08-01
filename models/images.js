

module.exports = function (sequelize, DataTypes){
  var Images = sequelize.define("Images", {
    url: DataTypes.STRING,
    description: DataTypes.TEXT
  });
  Images.associate = function(models) {
    Images.belongsTo(models.Authors, {foreignKey: 'authors_id'});
  };

  return Images;
};


