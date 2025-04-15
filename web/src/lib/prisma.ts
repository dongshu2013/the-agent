// 这是一个简化的Prisma客户端实现，用于构建时避免错误

// 模拟Prisma实例
class PrismaClient {
  user = {
    findUnique: async () => Promise.resolve(null),
    findFirst: async () => Promise.resolve(null),
    findMany: async () => Promise.resolve([]),
    create: async (data: any) => Promise.resolve(data.data),
    update: async (data: any) =>
      Promise.resolve({
        ...data.data,
        id: data.where?.id || "mock-id",
        api_key: "mock-api-key",
        api_key_enabled: true,
      }),
    delete: async () => Promise.resolve(null),
  };
}

// 导出单例Prisma客户端
export const prisma = new PrismaClient();
