<<<<<<< HEAD:back_end/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
=======
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
>>>>>>> origin/main:backend/src/users/users.module.ts
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
