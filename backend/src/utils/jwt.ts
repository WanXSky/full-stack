import * as jwt from "jsonwebtoken"

export const generateToken = (user_id: number) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRETKEY!, { expiresIn: '1d' })
}