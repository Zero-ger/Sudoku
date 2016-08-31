var http = require("http");
var cheerio = require("cheerio");

var example =  [[0,9,0,2,0,5,4,0,0],
            [0,0,5,0,6,8,1,0,7],
            [7,3,0,0,0,0,0,5,0],
            [9,6,0,5,0,7,0,0,4],
            [0,8,0,0,3,0,0,2,0],
            [3,0,0,1,0,9,0,6,8],
            [0,4,0,0,0,0,0,3,1],
            [2,0,6,8,1,0,9,0,0],
            [0,0,3,4,0,6,0,7,0]];

function Sudoku(field){
    this._count = 0;
    this.solved = false;
    this.lastCell = [];
    this.field = field || this._TEMPLATE;

}

Sudoku.prototype._MAXLOG = 100;

Sudoku.prototype._TEMPLATE =   [[0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0],
                                [0,0,0,0,0,0,0,0,0]];

Sudoku.prototype._sectors = [[0,2], [3,5], [6,8]];

Sudoku.prototype._checkNum = function(i,j) { //Number checks
    for (var k = 0; k <= 8; k++){
        if (k != i && this.field[k][j] == this.field[i][j]) return false;
        if (k != j && this.field[i][k] == this.field[i][j]) return false;
    }
    for (k = this._sectors[Math.floor(i/3)][0]; k <= this._sectors[Math.floor(i/3)][1]; k++)
        for (var l = this._sectors[Math.floor(j/3)][0]; l <= this._sectors[Math.floor(j/3)][1]; l++)
            if (k != i && l != j && this.field[k][l] == this.field[i][j]) return false;
    return true;
};

Sudoku.prototype._getLastZeroNum = function() { //Search last zero number
    for (var k = 8; k >= 0; k--)
        for (var l = 8; l >= 0; l--)
            if (!this.field[k][l]) {
                this.lastCell = [k,l];
                return;
            }
};

Sudoku.prototype._rec = function(i,j){ //Recursion
    while(i<9){
        while(j<9){
            if (!this.field[i][j]){
                for (var k = 1; k <= 9; k++){
                    this.field[i][j] = k;
                    if (this._checkNum(i,j)) {
                        //this._log(i,j,k,0);
                        if (i == this.lastCell[0] && j == this.lastCell[1]) {
                            this.solved = true;
                            return;
                        }
                        if (j != 8) this._rec(i, j + 1);
                        else if (i != 8) this._rec(i + 1, 0);
                        if (this.solved) return;
                    }
                    this.field[i][j] = 0;
                }
                return;
            }
            j++;
        }
        i++;
        j = 0;
    }
};

Sudoku.prototype._log = function(i,j,k,l){ // for debugging
    if (this._count<this._MAXLOG) {
        if (l) console.log(i + " " + j + " " + k + " Error");
        else   {
            console.log(i + " " + j + " " + k + " correct");
            //console.log(this.field);
        }
        this._count++;
    }
};

Sudoku.prototype.solver = function(){ //solver sudoku and console.log answer
    this._getLastZeroNum();
    //console.log(this.lastCell);
    this._rec(0, 0);
    //console.log(this.solved);
    console.log("Answer:");
    console.log(this.field);
};

var sudoku = new Sudoku();
function solver(data){
    sudoku.field = data;
    sudoku.solver();
}

function matrixArray(){ //Initialization array
    var arr = new Array();
    for (var i = 0; i < 9; i++){
        arr[i] = new Array();
        for (var j = 0; j < 9; j++){
            arr[i][j] = 0;
        }
    }
    return arr;
}

var options = {
    host: 'www.sudoku.name',
    path: "/index-ru.php"
};

http.get(options, function(res) { //client request
    var body = '';
    res.on('data', function(chunk) {
        body += chunk;
    });
    res.on('end', function() {
        var $ = cheerio.load(body);
        var cell = $(".i3");
        var mas = matrixArray();
        cell.each(function(i,cell){
            var c = $(cell).attr("value");
            if (c) mas[Math.floor(i/9)][i%9] = +c;
        });
        console.log("Data:");
        console.log(mas);
        solver(mas);
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});


