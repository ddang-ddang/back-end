import { IsEmail, IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/swagger';

export class CreatePlayerDto {
  @IsNotEmpty()
  Id: number;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  mbti: string;
  @IsNotEmpty()
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

export class CreateIdDto extends PickType(CreatePlayerDto, [
  'email',
  'password',
] as const) {}

export class SigninDto extends PickType(CreatePlayerDto, [
  'Id',
  'email',
  'nickname',
] as const) {}

export class UpdateNickname extends PickType(CreatePlayerDto, [
  'email',
  'nickname',
] as const) {}
