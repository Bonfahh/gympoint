import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { student, plan, end_date, price } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Bem vindo a família GymPoint',
      template: 'registration',
      context: {
        student: student.name,
        plan,
        end_date,
        price,
      },
    });
  }
}

export default new RegistrationMail();
