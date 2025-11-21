import express from "express"
import router from "./routes"
import { PrismaClient } from "@prisma/client"

const app = express()
const PORT = 3000
const prisma = new PrismaClient()

app.use(express.json())

app.get('/health', async (req, res) => {
    try {
        await prisma.$connect()
        res.json({ status: "OK", database: "Connected"})
    } catch(err) {
        res.status(500).json({ status: "Error", database: "Disconnected"})
    } finally {
        await prisma.$disconnect()
    }
})

app.use('/api', router)