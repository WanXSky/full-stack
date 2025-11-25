import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt"
import { generateToken } from "../utils/jwt"
import { UnauthorizedError } from "../errors/unauthorizedError"
import { ValidationError } from "../errors/validationError"

const prisma = new PrismaClient()

export class AuthService {
    static async register(name: string, email: string, password: string) {
        const existing = await prisma.user.findUnique({
            where: { email }
        })
        if(existing) throw new ValidationError("Email aleardy Used")
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword }
        })

        return user
    }

    static async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if(!user) throw new ValidationError("Email or Password is Wrong")
        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid) throw new ValidationError("Email or Password is Wrong")
        
        const token = generateToken(user.id)

        return { user: { id: user.id, email: user.email, name: user.name }, token }

    }
}