import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } }); // Verificar se o email existe

    if (!user) {
      // se não existir
      return res.status(401).json({ error: 'User not found' });
    }

    if (!(await user.checkPassword(password))) {
      // Se a senha não bater, método do model User
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        // Payload, assinatura, { expiração }
        expiresIn: authConfig.expiresIn, // EXPIRAÇÃO DO TOKEN
      }),
    });
  }
}

export default new SessionController();
