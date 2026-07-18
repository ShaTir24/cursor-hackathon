import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [AuthModule, CatalogueModule, UsersModule],
})
export class AppModule {}
