import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt"
import { generateToken } from "../utils/jwt"

const prisma = new PrismaClient()

export class AuthService {
    static async register(name: string, email: string, password: string) {
        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if(existing) throw new Error("Email aleardy Used")
        
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

        const isValid = await bcrypt.compare(password, user.password)

        if(!user || !isValid) throw new Error("Email or Password is Wrong")
        
        const token = generateToken(user.id)

        return { user: { id: user.id, email: user.email, name: user.name }, token }

    }
}