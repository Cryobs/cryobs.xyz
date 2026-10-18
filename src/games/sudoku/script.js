const sudoku = document.getElementById("sudoku")


const squares = [
    1838599n,
    14708792n,
    117670336n,
    246772580483072n,
];


class Map {

    map = 0n;

    set_bit(pos)
    {
        this.map |= 1n << BigInt(pos);
    }

    unset_bit(pos)
    {
        this.map &= ~(1n << BigInt(pos));
    }

    get_bit(pos)
    {
        return 1n & this.map >> BigInt(pos);
    }

    or_arr(arr)
    {
        for (let n=0; n<arr.length; n++)
        {
            this.map |= arr[n].map;
        }
    }


    /* sudoku */
    str()
    {
        return this.map
            .toString(2)
            .padStart(81, "0")
            .match(/.{9}/g)
            .map(row => row.split("").join(" "))
            .join("\n");
    }

    is_horizontal(pos)
    {
        let row = (this.map << BigInt(Math.floor(pos/9))) 
                    & 0b111111111n 
                    & ~(1n << BigInt(pos));

        return row == 0
    }

    is_vertical(pos)
    {
        let zero_col = new Map();
        for(let i = 0; i<9*9; i += 9) {
            zero_col.set_bit(i);
        }
        zero_col.map <<= BigInt(pos%9);
        return (this.map & zero_col.map & ~(1n << BigInt(pos%9))) == 0;
    }

    is_square(pos)
    {
        let sqr =  get_square(pos);

        return (this.map & sqr.map & ~(1n << BigInt(pos%9))) == 0;
    }


    gen_num()
    {
        /* TODO GENERATING NUMBERS AND XOR ALL NUMBERS */
        for (let i=0; i<9; i++)
        {
            let square = get_square(i);


        }
    }



}


let field = new Map();

let numbers = [
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map()
]


function get_square(pos)
{
    row = Math.floor(pos / 9 / 3);
    col = Math.floor(pos % 9 / 3);
    console.log("COL: " + col);
    console.log("ROW: " + row);

    let map = new Map();
    map.set_bit(0 + 9*row*3 + 3*col);
    map.set_bit(1 + 9*row*3 + 3*col);
    map.set_bit(2 + 9*row*3 + 3*col);

    map.set_bit(0 + 9*(row*3+1) + 3*col);
    map.set_bit(1 + 9*(row*3+1) + 3*col);
    map.set_bit(2 + 9*(row*3+1) + 3*col);

    map.set_bit(0 + 9*(row*3+2) + 3*col);
    map.set_bit(1 + 9*(row*3+2) + 3*col);
    map.set_bit(2 + 9*(row*3+2) + 3*col);

    return map;
}

field.set_bit(1);
field.set_bit(18 + 2);
console.log(field.str());
console.log(field.is_horizontal(1));
console.log(field.is_vertical(1));
console.log(field.is_square(1));
    