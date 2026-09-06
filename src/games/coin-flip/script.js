
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


const coin = document.getElementById("coin");
const btnFlip = document.getElementById("btn-flip");
const statistics = document.getElementById("statistics");
const stat_style = getComputedStyle(statistics);
const coin_probability = document.getElementById("coin-probability");

coin.innerText = "\n" + tails;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let isHeads = false;
let count = 0;
let heads_count = 0;
let tails_count = 0;

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

    isHeads ? heads_count++ : tails_count++;
    count++;

    statistics.innerHTML += `<p>[${count}]: ${isHeads ? 'Heads' : 'Tails'}</p>`;
    statistics.scrollTop += 50;

    let heads_prob = parseInt(heads_count / count * 100);
    let tails_prob = parseInt(tails_count / count * 100);

    coin_probability.innerText = heads_prob + "% / " + tails_prob + "%";


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
