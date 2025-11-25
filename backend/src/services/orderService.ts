import { PrismaClient, OrderStatus } from "@prisma/client"
import { NotFoundError } from "../errors/notFoundError"
import { ValidationError } from "../errors/validationError"
const prisma = new PrismaClient()

export class OrderService {
    static async checkout(userId: number, selectedIds: number[]) {
      if(!selectedIds || selectedIds.length === 0) throw new ValidationError("No Item selected")
      const cart = await prisma.cart.findUnique({ where: { user_id: userId } })
      if(!cart) throw new NotFoundError("Cart")
      const items = await prisma.cartItem.findMany({
        where: { cart_id: cart.id, id: { in: selectedIds } },
        include: { product: true }
      })
      if(items.length === 0) throw new NotFoundError("Cart Items")
      for(const item of items) {
        if(item.product.stock < item.quantity) {
          throw new ValidationError(`${item.product.name} Out of stock`)
        }
      }
      const total = items.reduce((sum, item) => {
        const price = Number(item.product.price)
        return sum + price * item.quantity
      }, 0)
      
      return await prisma.$transaction(async(tx) => {
        const order = await tx.order.create({
          data: {
            total_price: total,
            status: OrderStatus.PENDING,
            user_id: userId
          }
        })

        const orderItems = items.map((item) => ({
          quantity: item.quantity,
          price_at_time: item.product.price,
          order_id: order.id,
          product_id: item.product_id
        }))

        await tx.orderItem.createMany({ data: orderItems })

        for(const item of items) {
          await tx.product.update({
            where: { id: item.product_id },
            data: { stock: { decrement: item.quantity}}
          })
        }

        await tx.cartItem.deleteMany({
          where: { id: { in: selectedIds } }
        })

        return order
      })
    }
    
    static async getAllOrders(userId: number) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })
      if(!user) throw new NotFoundError("User")
      const condition = user.role === "USER" ? { user_id: userId } : {}
      const order = await prisma.order.findMany({
        where: condition,
        select: {
          id: true,
          total_price: true,
          status: true,
          updated_at: true,
          order_items: {
            take: 1,
            include: {
              product: {
                select: { image_url: true }
              }
            }
          }
        },
        orderBy: { created_at: "desc" }
      })
      
      return order
    }
    
    static async getDetailOrder(userId: number, orderId: number) {
      const orderDetail = await prisma.order.findFirst({
        where: { id: orderId, user_id: userId  },
        include: {
          order_items: {
            include: { product: true }
          }
        }
      })
      
      if(!orderDetail) throw new NotFoundError("Order")
      
      return orderDetail
    }
    
    static async updateStatusOrder(orderId: number, newStatus: OrderStatus) {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      })
      if(!order) throw new NotFoundError("Order")
      
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
        [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED,OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
        [OrderStatus.COMPLETED]: [],
        [OrderStatus.CANCELLED]: []
      }
      
      if(!validTransitions[order.status].includes(newStatus)) {
        throw new ValidationError(`Invalid status transition`)
      }
      
      return await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
      })
    }
}