import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { StorageModule } from '@Provider/storage';
import { AuthenticationModule } from '@Provider/authentication';
import { InterestsModule } from '@Feature/interests';
import { PersonalitiesModule } from '@Feature/personalities';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities';
import { RatesModule } from '@Feature/rates';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    StorageModule,
    InterestsModule,
    PersonalitiesModule,
    RatesModule,
    AuthenticationModule,
  ],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
