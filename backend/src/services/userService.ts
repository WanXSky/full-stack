import { PrismaClient } from "@prisma/client"
import { NotFoundError } from "../errors/notFoundError"

const prisma = new PrismaClient()

export class User {
    static async getMe(userId: number) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                role: true
            }
        })
    }

    static async updateMe(userId, name, email, role) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                name, email, role
            }
        })
    }

    static async getUser(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if(!user) throw new NotFoundError("User")
        return user
    }
    
    static async getAllUser(search?: string) {
        const isSearch = search ? { name: { contains: search, mode: "insensitive" }} : {}
        return await prisma.user.findmany({
            where: isSearch,
            select: {
                name: true,
                email: true,
                role: true
            }
        })
    }
}