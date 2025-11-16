import jwt from 'jsonwebtoken'

const JWT_SECRET = 'SECRET_KEY'

export const signToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET)
}
