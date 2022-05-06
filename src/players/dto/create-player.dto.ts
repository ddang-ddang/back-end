import { IsEmail } from 'class-validator';
import { PickType } from '@nestjs/swagger';

export class CreatePlayerDto {
  @IsEmail()
  email: string;

  password: string;

  nickname: string;

  mbti: string;

  profileImg: string;
}

// export class CreateNameDto extends PickType(CreateUserDto, [
//   'nickname',
// ] as const) {}
// export class CreateIdDto extends PickType(CreateUserDto, [
//   'user_id',
// ] as const) {}
export class CreateBodyDto extends PickType(CreatePlayerDto, [
  'email',
  'password',
  'nickname',
  'mbti',
  'profileImg',
] as const) {}
