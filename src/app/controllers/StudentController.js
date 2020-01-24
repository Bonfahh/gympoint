import * as Yup from 'yup';
import Student from '../models/Student';

class StudentControler {
  async index(req, res) {
    const students = await Student.findAll();

    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation Failed' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      res.status(400).json({ error: 'Student already exists' });
    }

    const { id, name, email } = await Student.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Failed' });
    }

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'User don`t exists' });
    }

    if (req.body.email) {
      if (req.body.email !== student.email) {
        const studentExists = await Student.findOne({
          where: { email: req.body.email },
        });

        if (studentExists) {
          return res.status(400).json({ error: 'This email already exists' });
        }
      }
    }

    const { id, name, email } = await student.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new StudentControler();
