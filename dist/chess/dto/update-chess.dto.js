"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChessDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_game_dto_1 = require("./create-game.dto");
class UpdateChessDto extends (0, swagger_1.PartialType)(create_game_dto_1.CreateChessDto) {
}
exports.UpdateChessDto = UpdateChessDto;
//# sourceMappingURL=update-chess.dto.js.map