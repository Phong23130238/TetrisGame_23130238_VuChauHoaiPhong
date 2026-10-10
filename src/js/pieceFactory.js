import Piece from "./piece.js";
import PIECES from "./config/pieces.js";
import COLORS from "./config/colors.js";
import {getRandomItem} from "./utils/random.js";

export default class PieceFactory {
    static createRandomPiece(){
        const type = getRandomItem(Object.keys(PIECES));
        const shape = PIECES[type];
        const color = getRandomItem(COLORS);

        return new Piece(type, shape, color);
    }
}