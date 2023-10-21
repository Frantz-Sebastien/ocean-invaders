//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//boat
let boatWidth = tileSize*2;
let boatHeight = tileSize;
let boatX = tileSize * columns/2 - tileSize;
let boatY = tileSize * rows - tileSize*2;

let boat = {
    x : boatX,
    y : boatY,
    width : boatWidth,
    height : boatHeight
}

let boatImg;
let boatVelocityX = tileSize; //boat moving speed

//deadfishs
let deadfishArray = [];
let deadfishWidth = tileSize*2;
let deadfishHeight = tileSize;
let deadfishX = tileSize;
let deadfishY = tileSize;
let deadfishImg;

let deadfishRows = 2;
let deadfishColumns = 3;
let deadfishCount = 0; //number of deadfishs to defeat
let deadfishVelocityX = 1; //deadfish moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial boat
    // context.fillStyle="green";
    // context.fillRect(boat.x, boat.y, boat.width, boat.height);

    //load images
    boatImg = new Image();
    boatImg.src = "./boat.png";
    boatImg.onload = function() {
        context.drawImage(boatImg, boat.x, boat.y, boat.width, boat.height);
    }

    deadfishImg = new Image();
    deadfishImg.src = "./deadfish.png";
    createdeadfishs();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveboat);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //boat
    context.drawImage(boatImg, boat.x, boat.y, boat.width, boat.height);

    //deadfish
    for (let i = 0; i < deadfishArray.length; i++) {
        let deadfish = deadfishArray[i];
        if (deadfish.alive) {
            deadfish.x += deadfishVelocityX;

            //if deadfish touches the borders
            if (deadfish.x + deadfish.width >= board.width || deadfish.x <= 0) {
                deadfishVelocityX *= -1;
                deadfish.x += deadfishVelocityX*2;

                //move all deadfishs up by one row
                for (let j = 0; j < deadfishArray.length; j++) {
                    deadfishArray[j].y += deadfishHeight;
                }
            }
            context.drawImage(deadfishImg, deadfish.x, deadfish.y, deadfish.width, deadfish.height);

            if (deadfish.y >= boat.y) {
                gameOver = true;
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with deadfishs
        for (let j = 0; j < deadfishArray.length; j++) {
            let deadfish = deadfishArray[j];
            if (!bullet.used && deadfish.alive && detectCollision(bullet, deadfish)) {
                bullet.used = true;
                deadfish.alive = false;
                deadfishCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (deadfishCount == 0) {
        //increase the number of deadfishs in columns and rows by 1
        score += deadfishColumns * deadfishRows * 100; //bonus points :)
        deadfishColumns = Math.min(deadfishColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        deadfishRows = Math.min(deadfishRows + 1, rows-4);  //cap at 16-4 = 12
        if (deadfishVelocityX > 0) {
            deadfishVelocityX += 0.2; //increase the deadfish movement speed towards the right
        }
        else {
            deadfishVelocityX -= 0.2; //increase the deadfish movement speed towards the left
        }
        deadfishArray = [];
        bulletArray = [];
        createdeadfishs();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);
}

function moveboat(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && boat.x - boatVelocityX >= 0) {
        boat.x -= boatVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && boat.x + boatVelocityX + boat.width <= board.width) {
        boat.x += boatVelocityX; //move right one tile
    }
}

function createdeadfishs() {
    for (let c = 0; c < deadfishColumns; c++) {
        for (let r = 0; r < deadfishRows; r++) {
            let deadfish = {
                img : deadfishImg,
                x : deadfishX + c*deadfishWidth,
                y : deadfishY + r*deadfishHeight,
                width : deadfishWidth,
                height : deadfishHeight,
                alive : true
            }
            deadfishArray.push(deadfish);
        }
    }
    deadfishCount = deadfishArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : boat.x + boatWidth*15/32,
            y : boat.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}