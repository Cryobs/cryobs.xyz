
let tails = `
     _____
  _--     --_  
 |     .     |
|     /|      |
|      |      |
|     _|_     |
 |_         _| 
   --_____--   
`;

let transition = `



 _____________
|___|_____|___|



`;

let heads = `
     _____
  _--     --_  
 |   _---_   |
|   /     |   |
|  /      |   |
|   |_  _/    |
 |_  |   |  _| 
   --_____--   
`;


let coin = document.getElementById("coin");
let btnFlip = document.getElementById("btn-flip");


coin.innerText = "\n" + tails;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let isHeads = false;

btnFlip.addEventListener("click", async () => {
    btnFlip.disabled = true;
    const random = Math.floor(Math.random() * 10) + 1;

    for (let i = 0; i<random; i++)
    {
        coin.innerText = i == random -1 ? "\n" + transition : transition;
        if (i != random-1) coin.innerText += "\n";
        await sleep(100);

        isHeads = !isHeads;

        if (isHeads) coin.innerText =i == random -1 ? "\n" + heads : heads;
        else coin.innerText = i == random -1 ? "\n" + tails : tails;
        
        if (i != random-1) coin.innerText += "\n";

        await sleep(150);
    }


    btnFlip.disabled = false;

});

/*
btnFlip.addEventListener("click", async () => {
    const random = Math.floor(Math.random() * 2);

    coin.innerText = transition;

    await sleep(100);


    if (random == 0) coin.innerText = heads;
    else coin.innerText = tails;
});

*/
