<<<<<<< HEAD:back_end/src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

=======
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
>>>>>>> origin/main:backend/src/prisma/prisma.module.ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
