import Sequelize, { Model } from 'sequelize';
import { addMonths } from 'date-fns';
import Plan from './Plan';

class Registration extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.DOUBLE,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async reg => {
      const plan = await Plan.findByPk(reg.plan_id);
      reg.end_date = addMonths(reg.start_date, plan.duration);
      reg.price = plan.duration * plan.price;
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student',
    });
    this.belongsTo(models.Plan, {
      foreignKey: 'plan_id',
      as: 'plan',
    });
  }
}

export default Registration;
