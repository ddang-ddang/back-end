import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
const dbConfig = config.get('db');
const mapConfig2 = config.get('map');
const kakaoConfig2 = config.get('kakao');
const googleConfig2 = config.get('google');
const jwtConfig2 = config.get('jwt');

export const typeORMConfig: TypeOrmModuleOptions = {
  type: process.env.DB_TYPE || dbConfig.type,
  host: process.env.DB_HOST || dbConfig.host,
  port: process.env.DB_PORT || dbConfig.port,
  username: process.env.DB_USERNAME || dbConfig.username,
  password: process.env.DB_PASSWORD || dbConfig.password,
  database: process.env.DB_DATABASE || dbConfig.database,
  entities: ['dist/**/*.entity.js'],
  synchronize: process.env.DB_SYNCRONIZE || dbConfig.synchronize,
};

export const jwtConfig = {
  accessTokenSecret:
    process.env.JWT_ACCESS_TOKEN_SECRET || jwtConfig2.accessTokenSecret,
  accessTokenExp: process.env.JWT_ACCESS_TOKEN_EXP || jwtConfig2.accessTokenExp,
  refreshTokenSecret:
    process.env.JWT_REFRESH_TOKEN_SECRET || jwtConfig2.refreshTokenSecret,
  refreshTokenExp:
    process.env.JWT_REFRESH_TOKEN_EXP || jwtConfig2.refreshTokenExp,
};

export const mapConfig = {
  kakaoBaseUrl: process.env.KAKAO_API_KEY || mapConfig2.kakaoBaseUrl,
  kakaoApiKey: process.env.KAKAO_MAP_KEY || mapConfig2.kakaoApiKey,
  jusoBaseUrl: process.env.JUSO_API_KEY || mapConfig2.jusoBaseUrl,
  josoConfirmKey: process.env.JUSO_CONFIRM_KEY || mapConfig2.josoConfirmKey,
};

export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || googleConfig2.clientId,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || googleConfig2.clientSecret,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || googleConfig2.callbackUrl,
};

export const kakaoConfig = {
  clientId: process.env.KAKAO_CLIENT_ID || kakaoConfig2.clientId,
  clientSecret: process.env.KAKAO_CLIENT_SECRET || kakaoConfig2.clientSecret,
  callbackUrl: process.env.KAKAO_CALLBACK_URL || kakaoConfig2.callbackUrl,
};

export const configs = {
  typeORMConfig,
  jwtConfig: jwtConfig2,
  kakaoMap: mapConfig2,
  googleLogin: googleConfig2,
  kakaoLogin: kakaoConfig2,
};

export default configs;
