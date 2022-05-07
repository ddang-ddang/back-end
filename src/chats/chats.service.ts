import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  create(createChatDto: CreateChatDto) {
    const message = { ...createChatDto };
    // TODO db에 저장하는 로직 추가
    return message;
  }

  identify(nickname: string, clientId: string) {
    // TODO
  }

  findAll() {
    return `This action returns all chats`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
