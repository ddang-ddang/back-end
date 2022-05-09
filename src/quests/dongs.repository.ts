import { EntityRepository, Repository } from 'typeorm';
import { Dong } from './entities/dong.entity';
import { CreateDongDto } from './dto/create-dong.dto';

@EntityRepository(Dong)
export class DongsRepository extends Repository<Dong> {
  /* 동 찾기 함수 */
  findDong = async (
    date: string,
    regionSi: string,
    regionGu: string,
    regionDong: string
  ): Promise<Dong> => {
    return await this.findOne({
      where: { date, regionSi, regionGu, regionDong },
    });
  };

  createDong = async ({
    date,
    regionSi,
    regionGu,
    regionDong,
  }: CreateDongDto) => {
    return await this.save({
      date,
      regionSi,
      regionGu,
      regionDong,
    });
  };
}
