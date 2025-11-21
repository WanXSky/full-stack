import { NotFoundError } from "../errors/notFoundError"
import { PrismaClient } from "@prisma/client"
import { UnauthorizedError } from "../errors/unauthorizedError"

const prisma = new PrismaClient()

export class CartService {
  static async getAllByUser(userId) {
    const cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        cart_items: {
          include: { product: true }
        }
      },
      user: true
    })

    if (!cart) throw new NotFoundError("Cart Item")
    return cart
  }

  static async getProductPrice(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) throw new NotFoundError("Product")
    return product.price
  }

  static async addItem(userId: number, productId: number, quantity: number) {
    let cart = await prisma.cart.findUnique({
      where: { user_id: userId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId }
      })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId }
    })

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: quantity + existingItem.quantity
        }
      })
    }

    return await prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id: productId,
        quantity,
        price_at_time: await this.getProductPrice(productId)
      }
    })
  }

  static async updateItem(productId: number, quantity: number, userId: number) {
    const cart = await prisma.cart.findFirst({
      where: { user_id: userId }
    })
    const item = await prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId }
    })

    if (!item) throw new NotFoundError("Cart Item")
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: item.id }
      })
      return "Item removed"
    }

    return await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity }
    })
  }

  static async deleteItem(userId: number, productId: number) {
    const cart = await prisma.cart.findFrist({
      where: { user_id: userId }
    })
    const item = await prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId }
    })
    if (!item) throw new UnauthorizedError()
    return await prisma.cartItem.delete({
      where: { id: item.id }
    })
  }

  static async clearCart(userId: number) {
    const cart = await prisma.cart.findFirst({
      where: { user_id: userId }
    })

    if (!cart) throw new NotFoundError("Cart")
    return await prisma.cartItem.deleteMany({
      where: { cart_id: cart.id }
    })
  }
}