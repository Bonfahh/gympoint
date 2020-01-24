import Mail from '../../lib/Mail';

class HelpOrderMail {
  get key() {
    return 'HelpOrderMail';
  }

  async handle({ data }) {
    const { student, question, answer } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Pedido de auxílio respondido',
      template: 'helpOrder',
      context: {
        student: student.name,
        question,
        answer,
      },
    });
  }
}

export default new HelpOrderMail();
