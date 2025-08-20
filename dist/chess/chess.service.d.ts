import { CreateChessDto } from "./dto/create-game.dto";
import { UpdateChessDto } from "./dto/game-response.dto";
export declare class ChessService {
    create(createChessDto: CreateChessDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateChessDto: UpdateChessDto): string;
    remove(id: number): string;
}
