
window.onload = function () {
    const canvas = document.getElementById("outer");
    const ctx = canvas.getContext("2d");

    const worldWidth = 5000;
    const worldHeight = canvas.height;

    const startButton = document.getElementById("Start")

    let gameStarted = false;

    const images = {
        islandone: document.getElementById("islandone"),
        islandtwo: document.getElementById("islandtwo"),
        treasure: document.getElementById("treasure"),
        pirateship: document.getElementById("pirateship"),
        merimaisema: document.getElementById("merimaisema"),
        royalship: document.getElementById("lainedustajat"),

    };

    let pirateship = {x: 200, y: 100 / 2 - 50};
    let playerHP = 100;

    let enemies = [
    { x: 3000, y: 80, hp: 300 },
    { x: 4800, y: 90, hp: 300 } 
    ];

    let qteActive = false;
    let qteKey = null;
    let qteTimer = 0;
    let qteDuration = 50; 
    let qteTarget = null;
    let qteX = 0;
    let qteY = 0;

    const camera = {x: 0, y: 0};

    const saaret = [
        {x: 800, y: 80, img: images.islandone},
        {x: 1600, y: 70, img: images.islandtwo},

        {x: 2400, y: 60, img: images.islandone},
        {x: 3200, y: 90, img: images.islandtwo},
        {x: 4000, y: 50, img: images.islandone},
        {x: 4500, y: 70, img: images.islandone},
        {x: 4900, y: 100, img: images.islandtwo},
    ];

    const randomIslands = [...saaret].sort(() => Math.random() - 0.5);

    //poimitaan 4 ja merkitään 
    randomIslands.slice(0, 4).forEach(island => {
        island.hasTreasure = true;
        island.hadTreasure = true;

        //aarre-kuvan koordinaatit
        island.treasureX = island.x + 50;
        island.treasureY = island.y - 20;
    });
    
    //liike
    let speed = 3;
    let angle = 0;
    let keys = {};

    //QTE käsittely
    document.addEventListener("keydown", e => {
    if (!qteActive) return;
        if (e.repeat) return;
            const key = e.key.toUpperCase();
    if (key === qteKey) {
        if (qteTarget) qteTarget.hp -= 30;
    } else {
        playerHP -= 20;
    }
    qteActive = false;
});

    //Uudelleen aloitus
    function resetGame() {
        pirateship = { x: 200, y: 100 / 2 - 50 };
        playerHP = 100;

        enemies = [
        { x: 3000, y: 80, hp: 300 },
        { x: 4800, y: 120, hp: 300 }
        ];

        qteActive = false;
        qteKey = null;
        qteTimer = 0;
        qteTarget = null;

        keys = {};
        angle = 0;

        gameStarted = true;
    }

    document.addEventListener("keydown", e => keys[e.key] = true);
    document.addEventListener("keyup", e => keys[e.key] = false);

    function draw(wave) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //päivitä kamera
        camera.x = pirateship.x - canvas.width / 2.5;

        let repeatCount = Math.ceil(worldWidth / images.merimaisema.width);

        for (let i = 0; i < repeatCount; i++) {
            ctx.drawImage(
                images.merimaisema, 
                i * images.merimaisema.width - camera.x,
                0
            );
        }

        //piirrä saaret
        for (const s of saaret) {
            ctx.drawImage(s.img, s.x - camera.x, s.y);

            //piirrä aarre
            if (s.hasTreasure) {
                ctx.drawImage(
                    images.treasure,
                    s.treasureX - camera.x,
                    s.treasureY,
                    60, 
                    60
                );
            }
        }

        // Viholliset
        for (const enemy of enemies) {
            if (enemy.hp > 0) {
            ctx.drawImage(
                images.royalship,
                enemy.x - camera.x,
                enemy.y + wave
            );

        // Vihollisen HP palkki
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x - camera.x, enemy.y - 20, 100, 10);

        ctx.fillStyle = "lime";
        ctx.fillRect(
            enemy.x - camera.x,
            enemy.y - 20,
            (enemy.hp / 300) * 100,
            10
        );

        ctx.strokeStyle = "black";
        ctx.strokeRect(enemy.x - camera.x, enemy.y - 20, 100, 10);
        }
    }

        //piirrä laiva
        ctx.drawImage(
            images.pirateship,
            pirateship.x - camera.x,
            pirateship.y + wave
        );

        // Pelaajan HP
        ctx.fillStyle = "red";
        ctx.fillRect(20, 20, 200, 20);

        ctx.fillStyle = "lime";
        ctx.fillRect(20, 20, (playerHP / 100) * 200, 20);

        ctx.strokeStyle = "black"; 
        ctx.strokeRect(20, 20, 200, 20);

        // QTE UI
        if (qteActive) {
            ctx.fillStyle = "rgba(8, 5, 5, 0.6)";
            ctx.fillRect(qteX, qteY, 150, 120);

            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Paina nopeasti!", qteX + 75, qteY + 40);

            ctx.font = "50px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(qteKey, qteX + 75, qteY + 90);

            ctx.textAlign = "left";
        }
    }

    // Victory näyttö
    function drawVictory(collected) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "yellow";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("VICTORY!", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`Keräsit ${collected} aarretta`, canvas.width / 2, canvas.height / 2 + 20);

        ctx.font = "20px Arial";
        ctx.fillText("Klikkaa Start aloittaaksesi uudelleen", canvas.width / 2, canvas.height / 2 + 60);
    }

    // Game Over näyttö
    function drawGameOver() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Klikkaa Start aloittaaksesi uudelleen", canvas.width / 2, canvas.height / 2 + 50);
    }

    startButton.addEventListener("click", () => {
        resetGame();  

        saaret.forEach(s => {
            s.hasTreasure = false;
            s.hadTreasure = false;
        });

        saaret.sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .forEach(s => {
                s.hasTreasure = true;
                s.hadTreasure = true;

                s.treasureX = s.x + 50;
                s.treasureY = s.y - 20;
        });

        gameStarted = true;
        startButton.disabled = true;
    });

    function update() {
        angle += 0.05; //nopeus
        let wave = Math.sin(angle) * 5;

        if (gameStarted) {

        // QTE logiikka
        for (const enemy of enemies) {
            let distance = Math.abs(pirateship.x - enemy.x);
            if (!qteActive && enemy.hp > 0 && distance < 300) {
                const qteKeys = ["Q","W","E","A","S","D"];
                qteKey = qteKeys[Math.floor(Math.random() * qteKeys.length)];
                qteActive = true;
                qteTarget = enemy;
                qteTimer = qteDuration;
                qteX = Math.random() * (canvas.width - 150);
                qteY = Math.random() * (canvas.height - 120);
                break;
            }
        }

        //nuolinäppäimet
        if (!qteActive) {
            if (keys["ArrowLeft"]) pirateship.x -= speed;
            if (keys["ArrowRight"]) pirateship.x += speed;
        }

        // QTE ajastin
        if (qteActive) {
            qteTimer--;
            if (qteTimer <= 0) {
                playerHP -= 20;
                qteActive = false;
            }
        }

        // Häviö
        if (playerHP <= 0) {
            gameStarted = false;
            drawGameOver();  
            startButton.disabled = false;
        }

        // Voitto
        else if (pirateship.x >= worldWidth) {
            gameStarted = false;
            let collected = saaret.filter(s => s.hadTreasure && !s.hasTreasure).length;
            drawVictory(collected);
            startButton.disabled = false;
        }
    
        if (gameStarted) {
            draw(wave);
        }
    }

    requestAnimationFrame(update);
}

    canvas.addEventListener("click", e => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (const island of saaret) {
            
            if (!island.hasTreasure) continue;
            //aarre kuvan ruutu kameran koordinaatiossa
            const treasureScreenX = island.treasureX - camera.x;
            const treasureScreenY = island.treasureY;

            const w = images.treasure.width;
            const h = images.treasure.height;

            //tarkista aarteen klikkaus
            const clicked = 
                clickX >= treasureScreenX &&
                clickX <= treasureScreenX + w &&
                clickY >= treasureScreenY &&
                clickY <= treasureScreenY + h;

            if (!clicked) continue;

            //laivan läheisyys tarkistus
            const dx = pirateship.x - island.x;
            const dy = pirateship.y - island.y;
            const distance = Math.sqrt(dx*dx + dy*dy)

            if (distance < 150) {
                //kerää 
                island.hasTreasure = false;
                console.log("Aarre kerätty!");
            } else {
                console.log("Laiva liian kaukana kerätäkseen aarretta");
            }
        }
    });


    let loaded = 0;
    const total = Object.keys(images).length;

    for (const id in images) {
        const img = images[id];
        if(img.complete) {
            loaded++;
            if(loaded === total) update();
        } else {
            img.onload = () => {
                loaded++;
                if (loaded === total) update();
            };
        }
    }
};
