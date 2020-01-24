import User from '../models/User';

export default async (req, res, next) => {
  const user = await User.findByPk(req.userId);

  if (user.email === 'admin@gympoint.com') {
    return next();
  }

  return res
    .status(400)
    .json({ error: 'You don`t have permission to do this' });
};
