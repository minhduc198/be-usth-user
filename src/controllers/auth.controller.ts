import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
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
    const { fullname, email, username, password, license, expire } = req.body

    if (authModel.findUserByEmail(email)) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    if (authModel.findUserByUsername(username)) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    const hashed = bcrypt.hashSync(password, 10)
    authModel.createUser({
      fullname,
      email,
      username,
      password: hashed,
      license,
      expire
    })

    return res.status(201).json({ message: 'User registered successfully' })
  }

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = authModel.findUserByEmail(email)
    if (!user) return res.status(400).json({ message: 'Cannot found email' })

    const access_token = signToken({ id: user.id, username: user.username }, '15m')
    const resetLink = `http://192.168.42.101:3000/reset-password/${access_token}`

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mdblogger1982005@gmail.com',
        pass: 'zzwq hajo stbb koqx'
      }
    })

    await transporter.sendMail({
      from: 'mdblogger1982005@gmail.com',
      to: email,
      subject: 'Reset your password',
      html: `
      <h1>Reset Password</h1>
      <p>Click link below:</p>
      <a href="${resetLink}">${resetLink}</a>
    `
    })

    return res.json({ message: 'Reset link sent' })
  }

  resetPassword = (req: Request, res: Response) => {
    const { new_password } = req.body

    const user = req.user as jwt.JwtPayload
    const username = user.username

    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!new_password) {
      return res.status(400).json({ message: 'New Password is required' })
    }

    try {
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      const hashed = bcrypt.hashSync(new_password, 10)

      authModel.resetPassword(username, hashed)

      return res.json({ message: 'New Password reset successfully' })
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }
  }

  logout = (_req: Request, res: Response) => {
    return res.json({ message: 'Logged out successfully' })
  }

  getProfile = (req: Request, res: Response) => {
    const user = req.user as jwt.JwtPayload
    const username = user.username

    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const profile = authModel.findUserByUsername(username)

    if (!profile) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({
      id: profile.id,
      fullname: profile.fullname,
      email: profile.email,
      username: profile.username,
      license: profile.license,
      expire: profile.expire
    })
  }

  updateDetail = (req: Request, res: Response) => {
    const userToken = req.user as jwt.JwtPayload
    const username = userToken?.username

    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = authModel.findUserByUsername(username)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { fullname, email, license, expire } = req.body

    if (email && email !== user.email) {
      const existedEmail = authModel.findUserByEmail(email)
      if (existedEmail) {
        return res.status(400).json({ message: 'Email already exists' })
      }
    }

    const updatedUser = authModel.updateUser(username, {
      fullname: fullname ?? user.fullname,
      email: email ?? user.email,
      license: license ?? user.license,
      expire: expire ?? user.expire
    })

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        username: updatedUser.username,
        license: updatedUser.license,
        expire: updatedUser.expire
      }
    })
  }
}

export const authController = new AuthController()
