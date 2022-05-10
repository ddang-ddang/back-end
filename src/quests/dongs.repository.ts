import { EntityRepository, Repository } from 'typeorm';
import { Dong } from './entities/dong.entity';
import { CreateDongDto } from './dto/create-dong.dto';

@EntityRepository(Dong)
export class DongsRepository extends Repository<Dong> {
  /* 동 생성 */
  createAndSave = async ({ regionSi, regionGu, regionDong }: CreateDongDto) => {
    const today = new Date();
    const date =
      today.getFullYear() +
      '-' +
      ('0' + (today.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + today.getDate()).slice(-2);
    return await this.save({
      date,
      regionSi,
      regionGu,
      regionDong,
    });
  };

  /* 전체 동 조회 */
  findByAddrs = async ({ regionSi, regionGu, regionDong }): Promise<Dong> => {
    const today = new Date();
    const date =
      today.getFullYear() +
      '-' +
      ('0' + (today.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + today.getDate()).slice(-2);
    return await this.findOne({
      where: { date, regionSi, regionGu, regionDong },
    });
  };
}
