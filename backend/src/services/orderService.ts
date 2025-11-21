import { PrismaClient } from "@prisma/client"
import { NotFoundError } from "../errors/notFoundError"
import { ValidationError } from "../errors/validationError"
const prisma = new PrismaClient()

export class OrderService {
    static async checkout(userId: number, selectedItemIds: number[]) {
        if (!selectedItemIds || selectedItemIds.length === 0) throw new ValidationError("Selected Items Null or not set")

        const cart = await prisma.cart.findUnique({
            where: { user_id: userId }
        })
        if (!cart) throw new NotFoundError("Cart")
        const items = await prisma.cartItem.findMany({
            where: { id: { in: selectedItemIds }, cart_id: cart.id },
            include: { product: true }
        })

        if (items.length === 0) throw new NotFoundError("Items")
        const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)
        const order = await prisma.order.create({
            data: { user_id: userId, total_price: total, status: "PENDING" }
        })

    }
}