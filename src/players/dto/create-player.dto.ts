import { IsEmail, IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/swagger';

export class CreatePlayerDto {
  @IsNotEmpty()
  id: number;

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

  @IsNotEmpty()
  expPoints: number;

  @IsNotEmpty()
  points: number;

  @IsNotEmpty()
  provider: string;

  @IsNotEmpty()
  providerId: string;

  @IsNotEmpty()
  currentHashedRefreshToken: string;
}

export class InputPlayerDto extends PickType(CreatePlayerDto, [
  'email',
  'password',
  'nickname',
  'mbti',
  'profileImg',
] as const) {}

export class CreateBodyDto extends PickType(CreatePlayerDto, [
  'email',
  'password',
  'nickname',
  'mbti',
  'profileImg',
  'provider',
  'providerId',
  'currentHashedRefreshToken',
] as const) {}
export class CreateKakaoDto extends PickType(CreatePlayerDto, [
  'email',
  'password',
  'nickname',
  'mbti',
  'profileImg',
  'provider',
  'providerId',
] as const) {}

export class CreateLocalDto extends PickType(CreatePlayerDto, [
  'email',
  'password',
  'nickname',
  'mbti',
  'profileImg',
  'provider',
  'providerId',
] as const) {}

export class LoginDto extends PickType(CreatePlayerDto, [
  'email',
  'password',
] as const) {}

export class SigninDto extends PickType(CreatePlayerDto, [
  'id',
  'email',
  'nickname',
] as const) {}

export class payloadDto extends PickType(CreatePlayerDto, [
  'id',
  'email',
  'nickname',
  'mbti',
  'profileImg',
  'expPoints',
  'points',
] as const) {}

export class UpdateInfoDto extends PickType(CreatePlayerDto, [
  'email',
  'profileImg',
  'nickname',
] as const) {}

export class EmailDto extends PickType(CreatePlayerDto, ['email'] as const) {}

export class NicknameDto extends PickType(CreatePlayerDto, [
  'nickname',
] as const) {}

export class MbtiDto extends PickType(CreatePlayerDto, [
  'mbti',
  'id',
] as const) {}

export class PlayerIdDto extends PickType(CreatePlayerDto, ['id'] as const) {}

export class TokenPayloadDto extends PickType(CreatePlayerDto, [
  'id',
  'nickname',
  'email',
] as const) {}
