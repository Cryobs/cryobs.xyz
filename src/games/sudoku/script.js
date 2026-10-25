const sudoku = document.getElementById("sudoku")

const bold_border = "<span class='bold_border'>+===+===+===+===+===+===+===+===+===+</span>";
const thin_border = "<span class='bold_border'>|</span>---+---+---<span class='bold_border'>|</span>---+---+---<span class='bold_border'>|</span>---+---+---<span class='bold_border'>|</span>";

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
        return (this.map & 0b111111111n << BigInt(Math.floor(pos/9) * 9)) === 0n
    }

    is_vertical(pos)
    {
        const col = pos % 9;
        let mask = 0n

        for(let row = 0; row < 9; row++) {
            mask |= 1n << BigInt(row * 9 + col);
        }

        return (this.map & mask) === 0n;
    }

    is_square(pos)
    {
        let sqr = get_square(pos);

        return (this.map & sqr.map) === 0n;
    }

    find_first_bit()
    {
        if (this.map === 0n)
            return -1;

        let bit = this.map & -this.map;
        let pos = 0;

        while (bit > 1n)
        {
            bit >>= 1n;
            pos++;
        }

        return pos;
    }


}


function generate(numbers, pos=0)
{
    if (pos === 81)
    {
        return true;
    }

    /* shuffle numbers */
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 8; i > 0; i--)
    {
        let r = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[r]] = [nums[r], nums[i]];
    }

    for (const d of nums)
    {
        const bitmap = numbers[d];

        if (
            !bitmap.is_horizontal(pos) ||
            !bitmap.is_vertical(pos) ||
            !bitmap.is_square(pos)
        ) 
        {
            continue
        }

        bitmap.set_bit(pos);

        if (generate(numbers, pos + 1))
        {
            return true;
        }

        bitmap.unset_bit(pos);
    }

    return false;
}

function solve(numbers, zero_map=numbers[0])
{

    if (zero_map.map === 0n)
    {
        return true;
    }

    const pos = zero_map.find_first_bit();
    for (let n = 1; n <= 9; n++)
    {
        const bitmap = numbers[n]
        if (
            !bitmap.is_horizontal(pos) ||
            !bitmap.is_vertical(pos) ||
            !bitmap.is_square(pos)
        )
        {
            continue;
        }

        bitmap.set_bit(pos);
        zero_map.unset_bit(pos);

        if (solve(numbers, zero_map))
        {
            return true
        }

        bitmap.unset_bit(pos);
        zero_map.set_bit(pos);

    }

    return false

}

function count_solutions(numbers, zero_map=numbers[0], result={ count: 0 })
{

    if (result.count >= 2)
    {
        return result.count;
    }

    if (zero_map.map === 0n)
    {
        result.count++;
        return result.count;
    }

    const pos = zero_map.find_first_bit();

    for (let n = 1; n <= 9; n++)
    {
        const bitmap = numbers[n];

        if (
            !bitmap.is_horizontal(pos) ||
            !bitmap.is_vertical(pos) ||
            !bitmap.is_square(pos)
        )
        {
            continue;
        }

        bitmap.set_bit(pos);
        zero_map.unset_bit(pos);

        count_solutions(numbers, zero_map, result);

        bitmap.unset_bit(pos);
        zero_map.set_bit(pos);

        if (result.count >= 2)
        {
            return result.count;
        }
    }

    return result.count;
}


function get_square(pos)
{
    const row = Math.floor(pos / 9 / 3);
    const col = Math.floor(pos % 9 / 3);

    let map = new Map();

    for (let r = row * 3; r < row * 3 + 3; r++)
    {
        for (let c = col * 3; c < col * 3 + 3; c++)
        {
            map.set_bit(r * 9 + c);
        }
    }

    return map;
}


/*
let numbers = Array.from(
    {length: 10},
    () => new Map()
);

if (generate(numbers)) 
{
    let output = bold_border + "\n";

    for (let r = 0; r < 9; r++)
    {
        output += "<span class='bold_border'>|</span> "
        for (let c = 0; c < 9; c++)
        {
            const pos = r * 9 + c;

            const digit = numbers.findIndex(
                bitmap => bitmap.get_bit(pos) === 1n
            );

            output += `<span class="number" id="s${r}${c}">${digit}</span>` + 
                (((c+1) % 3 === 0) ? " <span class='bold_border'>|</span> " : " : ");
        }
        output += "\n" + 
            (((r+1) % 3 === 0) ? bold_border : thin_border) + 
            "\n";

    }

    sudoku.innerHTML = output;
}
*/

const puzzle = [
    0,8,0, 0,0,0, 0,0,3,
    7,0,0, 0,0,0, 0,6,2,
    0,0,0, 3,0,7, 0,0,0,

    8,0,0, 9,0,2, 0,3,0,
    9,0,4, 0,8,0, 7,0,0,
    2,0,6, 0,7,0, 5,0,0,

    0,9,0, 0,0,0, 0,0,7,
    3,1,0, 0,0,0, 0,5,6,
    0,0,0, 7,3,4, 0,0,0
];

const numbers = Array.from(
    { length: 10 },
    () => new Map()
);

for (let pos = 0; pos < 81; pos++)
{
    const digit = puzzle[pos];

    if (digit === 0)
        numbers[0].set_bit(pos);
    else
        numbers[digit].set_bit(pos);
}

console.log("Before:");
console.log(numbers[0].str());


const start = performance.now();
const solved = count_solutions(numbers);
const end = performance.now();

console.log("Solved:", solved);

console.log("Time:", (end - start).toFixed(3), "ms");

let output = bold_border + "\n";

for (let r = 0; r < 9; r++)
{
    output += "<span class='bold_border'>|</span> "
    for (let c = 0; c < 9; c++)
    {
        const pos = r * 9 + c;

        const digit = numbers.findIndex(
            bitmap => bitmap.get_bit(pos) === 1n
        );

        output += `<span class="number" id="s${r}${c}">${digit}</span>` + 
            (((c+1) % 3 === 0) ? " <span class='bold_border'>|</span> " : " : ");
    }
    output += "\n" + 
        (((r+1) % 3 === 0) ? bold_border : thin_border) + 
        "\n";

}

sudoku.innerHTML = output;