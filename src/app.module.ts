import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import path from 'path';

const envFilePath = path.join(
  __dirname,
  `../.env.${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}`,
);

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
