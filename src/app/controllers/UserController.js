import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  // async index() {}

  // async show() {}

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(), // String e obrigatório
      email: Yup.string()
        .email() // Verifica se é email
        .required(), // Obrigatório
      password: Yup.string() // String
        .required() // Obrigatório
        .min(6), // Minimo de caracteres
    });

    if (!(await schema.isValid(req.body))) {
      // Verifica se passou pelo schema
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ), // Validação condicional
      confirmPassword: Yup.string().when(
        'password',
        (password, field) =>
          password ? field.required().oneOf([Yup.ref('password')]) : field // Campo de confirmação de senha
      ),
    });

    if (!(await schema.isValid(req.body))) {
      // Verifica se passou pelo schema
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { email, oldPassword } = req.body; // Campos que quereos alterar

    const user = await User.findByPk(req.userId); // Verifica a senha do usuario no banco

    if (email && email !== user.email) {
      // Verifica se o email está batendo
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        // Se o email não bater, retorna erro
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      // Verifica se realmente o usuário quer alterar a senha e checa se a senha atual bate
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, provider } = await user.update(req.body);
    // Campos que serão enviados pro body

    return res.json({
      // Retorno do servidor
      id,
      name,
      email,
      provider,
    });
  }

  // async delete() {}
}

export default new UserController();
