export default class PieceUI {
    render(piece, container){
        container.innerHTML = "";
        const size = 4;
        const offsetX = Math.floor((size - piece.shape[0].length) / 2);
        const offsetY = Math.floor((size - piece.shape.length) / 2);

        for(let row = 0; row < size; row++){
            for(let col = 0; col < size; col++){
                const cell = document.createElement("div");
                cell.classList.add("piece-cell");
                const shapeRow = row - offsetY;
                const shapeCol = col - offsetX;
                if (this.isFilled(piece.shape, shapeRow, shapeCol)){
                    cell.style.backgroundColor = piece.color;
                }
                container.appendChild(cell);
            }
        }
    }

    isFilled(shape, row, col){
        return shape[row]?.[col] === 1;
    }
}