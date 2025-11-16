import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { authModel } from '~/models/auth.model'
import { signToken } from '~/utils/jwt'

export class AuthController {
  login = (req: Request, res: Response) => {
    const { username, password } = req.body
    const user = authModel.findUserByUsername(username)

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const access_token = signToken({ id: user.id, username })

    return res.json({ access_token })
  }

  register = (req: Request, res: Response) => {
    const { fullname, email, username, password } = req.body

    if (authModel.findUserByEmail(email)) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    if (authModel.findUserByUsername(username)) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    const hashed = bcrypt.hashSync(password, 10)

    const newUser = authModel.createUser({
      fullname,
      email,
      username,
      password: hashed
    })

    const access_token = signToken({ id: newUser.id, username })

    return res.status(201).json({ access_token })
  }

  forgotPassword = (req: Request, res: Response) => {
    const { email, new_password } = req.body

    const user = authModel.findUserByEmail(email)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const hashed = bcrypt.hashSync(new_password, 10)
    authModel.updateUserPassword(user.username, hashed)

    return res.json({ message: 'Password updated successfully' })
  }

  logout = (_req: Request, res: Response) => {
    return res.json({ message: 'Logged out successfully' })
  }
}

export const authController = new AuthController()
