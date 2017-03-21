'use strict';

const calculatePosition = require('../shared/util/calculatePosition');
const isNumber = require('lodash/isNumber');
const { processStatics, resolveStatics } = require('../shared/storage/helpers');

module.exports = function (sequelize, DataTypes) {
  const TeachingElement = sequelize.define('TeachingElement', {
    type: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.JSON
    },
    position: {
      type: DataTypes.FLOAT,
      validate: { min: 0, max: 1000000 }
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at'
    }
  }, {
    classMethods: {
      associate(models) {
        TeachingElement.belongsTo(models.Activity, {
          foreignKey: { name: 'activityId', field: 'activity_id' }
        });
        TeachingElement.belongsTo(models.Course, {
          foreignKey: { name: 'courseId', field: 'course_id' }
        });
      },
      initialize() {
        const opts = { type: sequelize.QueryTypes.SELECT };
        return sequelize.query('SELECT NEXTVAL(\'teaching_element_id_seq\')', opts)
          .then(result => TeachingElement.build({ id: result[0].nextval }));
      },
      list(integration, opt) {
        return integration
          ? TeachingElement.findAll(opt)
          : TeachingElement.fetch({ include: opt });
      },
      fetch(opt) {
        return isNumber(opt)
          ? TeachingElement.findById(opt).then(it => it && resolveStatics(it))
          : TeachingElement.findAll(opt)
              .then(arr => Promise.all(arr.map(it => resolveStatics(it))));
      }
    },
    instanceMethods: {
      siblings() {
        return TeachingElement.findAll({
          where: { activityId: this.activityId },
          order: 'position ASC'
        });
      },
      reorder(index) {
        return sequelize.transaction(t => {
          return this.siblings().then(siblings => {
            this.position = calculatePosition(this.id, index, siblings);
            return this.save({ transaction: t });
          });
        });
      }
    },
    hooks: {
      beforeCreate(te) {
        return processStatics(te);
      },
      beforeUpdate(te) {
        const changed = te.changed('data');
        return changed ? processStatics(te) : Promise.resolve();
      }
    },
    underscored: true,
    timestamps: true,
    paranoid: true,
    tableName: 'teaching_element'
  });

  return TeachingElement;
};
