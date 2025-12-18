import jwt from 'jsonwebtoken'

const JWT_SECRET = 'SECRET_KEY'

export const signToken = (payload: any, expiresIn: any = '2h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET)
}
