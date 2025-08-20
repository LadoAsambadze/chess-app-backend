import { Injectable } from "@nestjs/common";
import { CreateChessDto } from "./dto/create-game.dto";
import { UpdateChessDto } from "./dto/game-response.dto";

@Injectable()
export class ChessService {
  create(createChessDto: CreateChessDto) {
    return "This action adds a new chess";
  }

  findAll() {
    return `This action returns all chess`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chess`;
  }

  update(id: number, updateChessDto: UpdateChessDto) {
    return `This action updates a #${id} chess`;
  }

  remove(id: number) {
    return `This action removes a #${id} chess`;
  }
}
