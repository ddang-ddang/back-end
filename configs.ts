import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const serverConfig = {
  port: parseInt(process.env.SERVER_PORT),
};

export const typeORMConfig: TypeOrmModuleOptions = {
  type: process.env.DB_TYPE === 'mariadb' ? 'mariadb' : 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity.js'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true' ? true : false,
  // synchronize: false,
};

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  accessTokenExp: process.env.JWT_ACCESS_TOKEN_EXP,
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  refreshTokenExp: process.env.JWT_REFRESH_TOKEN_EXP,
};

export const mapConfig = {
  kakaoBaseUrl: process.env.KAKAO_API_KEY,
  kakaoApiKey: process.env.KAKAO_MAP_KEY,
  jusoBaseUrl: process.env.JUSO_API_KEY,
  josoConfirmKey: process.env.JUSO_CONFIRM_KEY,
};

export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
};

export const kakaoConfig = {
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  callbackUrl: process.env.KAKAO_CALLBACK_URL,
};

export const configs = {
  typeORMConfig,
  jwtConfig: jwtConfig,
  kakaoMap: mapConfig,
  googleLogin: googleConfig,
  kakaoLogin: kakaoConfig,
  serverConfig,
};

export default configs;
