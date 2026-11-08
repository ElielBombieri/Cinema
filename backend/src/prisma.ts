import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Defina DATABASE_URL no arquivo .env");
}

const adapter = new PrismaPg({ connectionString: url });

export const prisma = new PrismaClient({ adapter });
