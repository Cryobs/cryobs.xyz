const cells = document.getElementsByClassName("cell");


const game_btn = document.getElementById("game-btn");
const timer_ui = document.getElementById("timer");
const bomb_count_ui = document.getElementById("bomb-count");


const isMobile = window.matchMedia("(pointer: coarse)").matches;
if(isMobile) console.log("mobile");

const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

const SMILE_DEFEAT = 
` ----- 
| X X |
| _-_ |
 -----
`;

const SMILE_DEFAULT = 
` ----- 
| o o |
| -_- |
 -----
`;


const SMILE_WIN = 
` ----- 
|-U-U-|
| -_- |
 -----
`;

const WIDTH = 9;
const HEIGHT = 9;
const MINES = 10;

let bomb_count = MINES;
let start_time = Date.now();
let game_timer_id = null;

const UNREVEALED = "#";
const BOMB = "*";
const EMPTY = ".";
const FLAG = "F";
const NUM_ADDON = "";

const GRID_SYM = "";

const N0 = 
` _ 
| |
|_|
`;

const N1 = 
`   
  |
  |
`;

const N2 = 
` _ 
 _|
|_ 
`;

const N3 = 
` _ 
 _|
 _|
`;

const N4 = 
` 
|_|
  |
`;

const N5 = 
` _
|_
 _|
`;

const N6 = 
` _
|_
|_|
`;
 
const N7 = 
` _
  |
  |
`;

const N8 = 
` _
|_|
|_|
`;

const N9 = 
` _
|_|
 _|
`;

const NM = 
`  
 _ 
   
`;

function renderNumbers(el, num) {
    const abs_num = Math.abs(num);

    let ones, tens, hundreds;

    if (num < 0) 
    {
        if (abs_num < 10)
        {
            ones = abs_num;
            tens = -1;
            hundreds = 0;
        } 
        else 
        {
            const truncated = abs_num % 100;
            ones = truncated % 10;
            tens = Math.floor(truncated / 10);
            hundreds = -1;
        }
    } 
    else 
    {
            const truncated = abs_num % 1000;
            ones = truncated % 10;
            tens = Math.floor(truncated / 10) % 10;
            hundreds = Math.floor(truncated / 100);
        
    }

    renderNumber(el.getElementsByClassName("ones")[0], ones);
    renderNumber(el.getElementsByClassName("tens")[0], tens);
    renderNumber(el.getElementsByClassName("hundreds")[0], hundreds);
}

function renderNumber(el, num)
{
    if (!el) return;

    if (num === -1)
    {
        el.innerText = NM;
        return;
    }

    num = Math.floor(Math.abs(num)) % 10;

    switch (num)
    {
        case 0: el.innerText = N0;break;
        case 1: el.innerText = N1;break;
        case 2: el.innerText = N2;break;
        case 3: el.innerText = N3;break;
        case 4: el.innerText = N4;break;
        case 5: el.innerText = N5;break;
        case 6: el.innerText = N6;break;
        case 7: el.innerText = N7;break;
        case 8: el.innerText = N8;break;
        case 9: el.innerText = N9;break;
    }
}

function updateTimer()
{
    const now = Date.now();
    const current_time = Math.floor((now - start_time) / 1000);
    renderNumbers(timer_ui, current_time);
}

function checkWin(field) 
{
    if (field === null) return false;

    let unrevealedCount = 0;

    for (const row of field) 
    {
        for (const cell of row) 
        {
            if (!cell.revealed) 
            {
                unrevealedCount++;
            }
        }
    }

    return unrevealedCount === MINES;
}

function win(field)
{
    clearInterval(game_timer_id);

    for (const row of field) 
    {
        for (const cell of row) 
        {
            if (cell.mine) 
            {
               cell.flagged = true; 
            }
        }
    }

    renderField(field);

    game_btn.innerText = SMILE_WIN;
    renderNumbers(bomb_count_ui, 0);
}

function add_grid(el)
{
    return;
    const grid_el = document.createTextNode(" ");
    el.appendChild(grid_el);
}

function defeat(field) {
    clearInterval(game_timer_id);
    for (const row of field) 
    {
        for (const cell of row) 
        {
            cell.revealed = true;
        }
    }
    renderField(field);


    const game_btn = document.getElementById("game-btn");
    game_btn.innerText = SMILE_DEFEAT;
}

function reveal(field, x, y) 
{
    if (
        x < 0 ||
        x >= field[0].length ||
        y < 0 ||
        y >= field.length 
    ) {
        return
    }                       
    const cell = field[y][x];


    if (cell.revealed ) 
    {
        if (cell.adjacentMines <= 0) return;

        let n_flags = 0;
        for (const [dx, dy] of directions) 
        {
            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 &&
                nx < field[0].length &&
                ny >= 0 &&
                ny < field.length &&
                field[ny][nx].flagged
            ) 
            {
                n_flags++;
            }
        }
        console.log("FLAGS:", n_flags, "MINES:", cell.adjacentMines);
        if (n_flags === cell.adjacentMines) 
        {
            for (const[dx, dy] of directions) 
            {
                const nx = x + dx;
                const ny = y + dy;

                if (
                    nx >= 0 &&
                    nx < field[0].length &&
                    ny >= 0 &&
                    ny < field.length &&
                    !field[ny][nx].revealed
                )
                {

                    console.log(
                        "CHORD:",
                        x, y,
                        "->",
                        nx, ny,
                        "flags:",
                        n_flags,
                        "required:",
                        cell.adjacentMines
                    );
                    reveal(field, nx, ny);
                }
            }
        }

        return;
    }

    if (cell.flagged) return;

    if (cell.mine) {
        defeat(field);
        return;
    }

    cell.revealed = true;

    if (checkWin(field))
    {
        win(field);
        return;
    }

    if (cell.adjacentMines !== 0) return;

    for (const[dx, dy] of directions) 
    {
        reveal(field, x + dx, y + dy);
    }

}


function createField(width, height, mines, safeX, safeY) 
{
    const field = [];
    for (let y=0; y<height; y++)
    {
        field[y] = [];
        for (let x=0; x<width; x++)
        {
            field[y][x] = {
                mine: false,
                adjacentMines: 0,
                revealed: false,
                flagged: false
            };
        }
    }

    for (let i=0; i<mines; i++)
    {
        const random_x = Math.floor(Math.random() * width);
        const random_y = Math.floor(Math.random() * height);
        if (field[random_y][random_x].mine || (random_x == safeX && random_y == safeY) )
        {
            i--;
            continue;
        }
        field[random_y][random_x].mine = true;

        for (const [dx, dy] of directions)  
        {
            const x = random_x + dx;
            const y = random_y + dy;

            if (
                x >= 0 &&
                x < width &&
                y >= 0 &&
                y < height
            ) {
                field[y][x].adjacentMines++;
            }
        }
    }

    return field;
}

function renderField (field) {
    const ui_field = document.getElementById("field");
    ui_field.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
    ui_field.replaceChildren();
    for (let y=0; y<HEIGHT; y++)
    {
        for (let x=0; x<WIDTH; x++)
        {
            let cell = document.createElement("span");
            cell.classList = "cell";

            let symbol = document.createElement("span");
            symbol.classList = "symbol";
            cell.appendChild(symbol);

            /* PC control */
            if (!isMobile)
            {
                cell.addEventListener("mousedown", (event) => {
                    if (event.button === 0) {
                        if (field === null) {
                            field = createField(WIDTH, HEIGHT, MINES, x, y);
                            
                            start_time = Date.now();
                            game_timer_id = setInterval(updateTimer, 1000);

                            updateTimer();
                        } 
                        console.log("CLICK:", x, y, field[y][x]);
                        reveal(field, x, y);
                        renderField(field);
                    }

                    if (event.button === 2) {
                        if (field === null) return;
                        if (field[y][x].revealed) return;
                        field[y][x].flagged = !field[y][x].flagged;

                        symbol.innerText = field[y][x].flagged ? FLAG : UNREVEALED; 

                        if (field[y][x].flagged) {
                            bomb_count--;
                            renderNumbers(bomb_count_ui, bomb_count);
                            symbol.classList.add("flag");
                        }
                        else  {
                            symbol.classList.remove("flag");
                            bomb_count++;
                            renderNumbers(bomb_count_ui, bomb_count);
                        }

                        renderField(field);
                    }
                });

            } 
            else 
            {
                /* Mobile control */
                let pressTimer;
                let startX;
                let startY;

                cell.addEventListener("pointerdown", (event) => {
                    if (event.pointerType !== "touch") return;

                    startX = event.clientX;
                    startY = event.clientY;

                    pressTimer = setTimeout(() => {
                        if (field[y][x].revealed) return;
                        if (field === null) return;
                        field[y][x].flagged = !field[y][x].flagged;

                        symbol.innerText = field[y][x].flagged ? FLAG : UNREVEALED; 

                        if (field[y][x].flagged) {
                            bomb_count--;
                            renderNumbers(bomb_count_ui, bomb_count);
                            symbol.classList.add("flag");
                        }
                        else  {
                            symbol.classList.remove("flag");
                            bomb_count++;
                            renderNumbers(bomb_count_ui, bomb_count);
                        }
                        pressTimer = null;
                    }, 500);
                });

                cell.addEventListener("pointermove", (event) => {
                    if (pressTimer === null) return;

                    const dx = event.clientX - startX;
                    const dy = event.clientY - startY;

                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 10)
                    {
                        clearTimeout(pressTimer);
                        pressTimer = null;
                    }
                });

                cell.addEventListener("pointerup", (event) => {
                    if (event.pointerType !== "touch") return;

                    if (pressTimer !== null) {
                        clearTimeout(pressTimer);
                        pressTimer = null;

                        if (field === null) {
                            field = createField(WIDTH, HEIGHT, MINES, x, y);

                            start_time = Date.now();
                            game_timer_id = setInterval(updateTimer, 1000);

                            updateTimer();

                        }
                        reveal(field, x, y);
                        renderField(field);
                    }
                })
            
                cell.addEventListener("pointercancel", (event) => {
                    if (pressTimer !== null) {
                        clearTimeout(pressTimer);
                        pressTimer = null;
                    }
                });

            }


            if (field === null)
            {
                symbol.innerText = UNREVEALED;
                ui_field.appendChild(cell);
                add_grid(ui_field);


                continue;
            }

            if (field[y][x].revealed && !field[y][x].mine)
            {
                symbol.classList.add("N" + field[y][x].adjacentMines);
            }

            if (field[y][x].flagged && !field[y][x].revealed) 
            {
                symbol.innerText = FLAG; 
                ui_field.appendChild(cell);
                add_grid(ui_field);
                symbol.classList.add("flag");
                
                continue;
            }
            if (field[y][x].revealed && !field[y][x].mine)  
            {
                symbol.innerText = field[y][x].adjacentMines == 0 ? EMPTY : field[y][x].adjacentMines + NUM_ADDON; 
                ui_field.appendChild(cell);
                add_grid(ui_field);
                continue;
            }
            if (field[y][x].mine && field[y][x].revealed) 
            {
                symbol.classList.add("bomb");
                symbol.innerText = BOMB;
                ui_field.appendChild(cell);
                add_grid(ui_field);
                continue;
            }

            symbol.innerText = UNREVEALED; 
            ui_field.appendChild(cell);
            add_grid(ui_field);
        }
        ui_field.appendChild(document.createElement("br"));
    }


}





let field = null;
renderField(field);

game_btn.addEventListener("click", (event) => {
    game_btn.innerText = SMILE_DEFAULT;
    bomb_count = MINES;
    renderNumbers(bomb_count_ui, bomb_count);
    renderNumbers(timer_ui, 0);
    clearInterval(game_timer_id);

    field = null;
    renderField(field);
});

renderNumbers(bomb_count_ui, MINES);
