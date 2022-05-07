import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('FeedController');
  constructor(private readonly chatsService: ChatsService) {}

  @SubscribeMessage('createChat')
  async create(@MessageBody() createChatDto: CreateChatDto) {
    const message = await this.chatsService.create(createChatDto);
    this.server.emit('message', message);
    return message;
  }

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody('nickname') nickname: string,
    @ConnectedSocket() client: Socket
  ) {
    return this.chatsService.identify(nickname, client.id);
  }

  @SubscribeMessage('findAllChats')
  findAll() {
    return this.chatsService.findAll();
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatsService.remove(id);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected`);
  }

  handleDisconnction(client: Socket) {
    this.logger.log(`Client connected`);
  }
}
