import { Op } from 'sequelize';
import { subDays, startOfDay, endOfDay } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { student_id } = req.params;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const checkins = await Checkin.findAll({
      order: ['created_at'],
      limit: 10,
      offset: (page - 1) * 10,
      where: { student_id },
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const { student_id } = req.params;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const now = Date.now();
    const sevenDaysPast = subDays(now, 7);

    const checkins = await Checkin.findAll({
      where: {
        student_id,
        created_at: {
          [Op.between]: [startOfDay(sevenDaysPast), endOfDay(now)],
        },
      },
    });

    if (checkins.length >= 5) {
      return res.status(401).json({ error: 'Weekly checkin limit reached' });
    }

    const { id, created_at, updated_at } = await Checkin.create({ student_id });

    return res.json({
      id,
      student_id,
      created_at,
      updated_at,
    });
  }
}

export default new CheckinController();
