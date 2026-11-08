import type { PrismaClient } from "../../generated/prisma/client.js";
import type { Tx } from "./transacao.js";

export type Db = Tx | PrismaClient;
