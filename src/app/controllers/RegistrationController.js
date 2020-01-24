import * as Yup from 'yup';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import Plan from '../models/Plan';
import RegistrationMail from '../jobs/RegistrationMail';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      order: ['created_at'],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      req.status(400).json({ error: 'Validation failed' });
    }

    const registrationExists = await Registration.findOne({
      where: { student_id: req.body.student_id },
    });

    if (registrationExists) {
      return res.status(400).json({ error: 'User already have a plan!' });
    }

    const {
      id,
      plan_id,
      student_id,
      end_date,
      price,
    } = await Registration.create(req.body);

    const student = await Student.findByPk(student_id);
    const plan = await Plan.findByPk(plan_id);

    const formattedDate = format(end_date, " dd 'de' MMMM'", {
      locale: pt,
    });

    await Queue.add(RegistrationMail.key, {
      student,
      plan: plan.title,
      end_date: formattedDate,
      price,
    });

    return res.json({
      id,
      plan_id,
      student_id,
      end_date,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const registration = await Registration.findOne({
      where: { student_id: req.params.student_id },
    });

    if (!registration) {
      return res.json(404).json({ error: 'Student not found' });
    }

    const {
      id,
      plan_id,
      student_id,
      end_date,
      price,
    } = await registration.update(req.body);

    return res.json({
      id,
      plan_id,
      student_id,
      end_date,
      price,
    });
  }

  async delete(req, res) {
    const { student_id } = req.params;
    const registration = await Registration.findOne({ where: { student_id } });

    if (!registration) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await registration.destroy();

    return res.status(200).json({ message: 'Registration deleted' });
  }
}

export default new RegistrationController();
