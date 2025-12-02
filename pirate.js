
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
        royalship: document.getElementById("lainedustajat")

    };

    let pirateship = {x: 200, y: 100 / 2 - 50};

    const camera = {x: 0, y: 0};

    const saaret = [
        {x: 800, y: 80, img: images.islandone},
        {x: 1600, y: 70, img: images.islandtwo},

        {x: 2400, y: 60, img: images.islandone},
        {x: 3200, y: 90, img: images.islandtwo},
        {x: 4000, y: 50, img: images.islandone},
        {x: 4800, y: 70, img: images.islandone},
        {x: 4800}
    ];

    const randomIslands = [...saaret].sort(() => Math.random() - 0.5);

    //poimitaan 4 ja merkitään 
    randomIslands.slice(0, 4).forEach(island => {
        island.hasTreasure = true;

        //aarre-kuvan koordinaatit
        island.treasureX = island.x + 50;
        island.treasureY = island.y - 20;
    });
    

    //liike
    let speed = 3;
    let angle = 0;
    let keys = {};

    
    document.addEventListener("keydown", e => keys[e.key] = true);
    document.addEventListener("keyup", e => keys[e.key] = false);

    function draw(wave) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //päivitä kamera
        camera.x = pirateship.x - canvas.width /2;

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

        //piirrä laiva
        ctx.drawImage(
            images.pirateship,
            pirateship.x - camera.x,
            pirateship.y + wave
        );
    }

    startButton.addEventListener("click", () => {
        if(!gameStarted) {
            gameStarted = true;
            startButton.disabled = true;
        }
    });

    function update() {
        //nuolinäppäimet
        if (!gameStarted) {
            requestAnimationFrame(update);
            return;
        }

        if (keys["ArrowLeft"]) pirateship.x -= speed;
        if (keys["ArrowRight"]) pirateship.x += speed;

        angle += 0.05; //nopeus
        let wave = Math.sin(angle) * 5;

        draw(wave);
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