import { PrismaClient } from "@prisma/client"
import { NotFoundError } from "../errors/notFoundError"

const prisma = new PrismaClient()
// /products && /product?search=Sepatu
export class ProductService {
  static async getAll(search?: string) {
    const isSearch = search ? { name: { contains: search, mode: "insensitive" } }: {}
    return await prisma.product.findMany({
      where: isSearch,
      select: {
        name: true,
        price: true,
        image_url: true
      }
    })
  }
  
  // /products/:id
  static async getDetail(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId  },
      select: {
        name: true,
        price: true,
        image_url: true,
        description: true,
        stock: true
      }
    })
    
    if(!product) throw new NotFoundError("Product")
    return product
  }
  
  static async create(name: string, stock: number, price: number, image_url: string, description: string) {
    return await prisma.product.create({
      data: {
        name,
        stock,
        price,
        image_url,
        description
      }
    })
  }
  
  static async update(productId: number, name: string, price: number, stock: number, image_url: string, description: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if(!product) throw new NotFoundError("Product")
    return await prisma.product.update({
      where: { id: productId },
      data: {
        name, price, stock, image_url, description
      }
    })
  }
  
  static async delete(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if(!product) throw new NotFoundError("Product")
    return await prisma.product.delete({
      where: { id: productId }
    })
  }
}