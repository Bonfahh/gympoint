import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Queue from '../../lib/Queue';
import Student from '../models/Student';
import HelpOrderMail from '../jobs/HelpOrderMail';

class HelpOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      order: ['created_at'],
      limit: 10,
      offset: (page - 1) * 10,
      where: {
        answer: null,
      },
    });

    return res.json(helpOrders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;

    const helpOrderExists = await HelpOrder.findByPk(id);

    if (!helpOrderExists) {
      return res.status(404).json({ error: 'Help order not found' });
    }

    const {
      student_id,
      question,
      answer,
      answer_at,
    } = await helpOrderExists.update(req.body);

    const student = await Student.findByPk(student_id);

    await Queue.add(HelpOrderMail.key, {
      student,
      question,
      answer,
    });

    return res.json({
      id,
      student_id,
      question,
      answer,
      answer_at,
    });
  }
}

export default new HelpOrderController();
