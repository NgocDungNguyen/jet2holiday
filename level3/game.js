        // Get game mode from URL
        const urlParams = new URLSearchParams(window.location.search);
        const gameMode = urlParams.get("mode") || "single";

        // Game Constants
        const LEVEL_TIME = 60; // 1 minute
        const HOUSES_COUNT = 5;
        const ITEMS_PER_HOUSE = 3; // medic, food, water
        const LIGHTNING_INTERVAL = 5000; // Lightning every 3 seconds

        // Game State
        let gameState = {
            timeLeft: LEVEL_TIME,
            deliveriesMade: 0,
            totalDeliveries: HOUSES_COUNT * ITEMS_PER_HOUSE,
            housesCompleted: 0,
            familiesSaved: 0,
            gameActive: false,
            gameOver: false,
            // Multiplayer stats
            p1Deliveries: 0,
            p2Deliveries: 0,
            p1Families: 0,
            p2Families: 0,
            winner: null
        };

        // DOM Elements
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const startScreen = document.getElementById('startScreen');
        const endScreen = document.getElementById('endScreen');
        const startBtn = document.getElementById('startBtn');
        const retryBtn = document.getElementById('retryBtn');
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        const backBtn = document.getElementById('backBtn');
        const backBtnStart = document.getElementById('backBtnStart');

        // Load Assets
        const assets = {
            mountain: new Image(),
            base: new Image(),
            house: new Image(),
            family: new Image(),
            drone: new Image(),
            medic: new Image(),
            food: new Image(),
            bottle: new Image(),
            cloud: new Image(),
            lightning: new Image()
        };

        assets.mountain.src = "assets/mountain.png";
        assets.base.src = "assets/base.png";
        assets.house.src = "assets/house.png";
        assets.family.src = "assets/family.png";
        assets.drone.src = "assets/drone.png";
        assets.medic.src = "assets/medic.png";
        assets.food.src = "assets/FOOD.png";
        assets.bottle.src = "assets/Bottle.png";
        assets.cloud.src = "assets/Cloud.png";
        assets.lightning.src = "assets/Lightning.png";

        // UI Elements
        const timeValue = document.getElementById('timeValue');
        const deliveriesCount = document.getElementById('deliveriesCount');
        const batteryValue = document.getElementById('batteryValue');
        const cargoStatus = document.getElementById('cargoStatus');
        const housesSaved = document.getElementById('housesSaved');
        const familiesSaved = document.getElementById('familiesSaved');
        const progressFill = document.getElementById('progressFill');
        const missionProgress = document.getElementById('missionProgress');

        // End Screen Elements
        const endTitle = document.getElementById('endTitle');
        const finalTime = document.getElementById('finalTime');
        const finalDeliveries = document.getElementById('finalDeliveries');
        const finalHouses = document.getElementById('finalHouses');
        const finalFamilies = document.getElementById('finalFamilies');
        const endFact = document.getElementById('endFact');

        // Game Objects
        let drone = {
            x: 100,
            y: 500,
            width: 100, // 2x bigger (was 50)
            height: 70, // 2x bigger (was 35)
            speed: 3.5,
            carrying: null,
            battery: 100
        };

        // Player 2 drone (multiplayer only)
        let drone2 = {
            x: 100,
            y: 400,
            width: 100,
            height: 70,
            speed: 3.5,
            carrying: null,
            battery: 100
        };

        let mountainBase = {
            x: 50,
            y: 50,
            width: 200, // Original size
            height: 180 // Original size
        };

        let houses = [];
        let supplyPiles = {
            medic: [],
            food: [],
            water: []
        };
        let families = [];
        let lastTime = 0;
        let clouds = [];
        let rainDrops = [];
        let lightningFlash = false;
        let lastLightningTime = 0;

        // Create houses with families
        function createHouses() {
            houses = [];
            families = [];

            // 5 houses distributed evenly underground
            const housePositions = [
                { x: 120, y: 420 },
                { x: 260, y: 440 },
                { x: 400, y: 420 },
                { x: 540, y: 450 },
                { x: 680, y: 430 }
            ];

            for (let i = 0; i < HOUSES_COUNT; i++) {
                const house = {
                    x: housePositions[i].x,
                    y: housePositions[i].y,
                    width: 160, // 2x bigger (was 80)
                    height: 200, // 2x bigger (was 100)
                    items: {
                        medic: false,
                        food: false,
                        water: false
                    },
                    isComplete: false
                };

                houses.push(house);

                // Create family on roof - positioned closer to house
                families.push({
                    x: housePositions[i].x + 50, // Centered horizontally
                    y: housePositions[i].y - 60, // Closer to roof (was -40)
                    width: 60, // 2x bigger (was 30)
                    height: 80, // 2x bigger (was 40)
                    house: house,
                    isSaved: false
                });
            }
        }

        // Create supply piles at mountain base
        function createSupplies() {
            supplyPiles = {
                medic: [],
                food: [],
                water: []
            };

            // Create medic supplies (5 items in a row) - original size
            for (let i = 0; i < HOUSES_COUNT; i++) {
                supplyPiles.medic.push({
                    x: 70 + (i * 35),
                    y: 130,
                    width: 25, // Original size
                    height: 30, // Original size
                    type: 'medic',
                    available: true
                });
            }

            // Create food supplies (5 items in a row) - original size
            for (let i = 0; i < HOUSES_COUNT; i++) {
                supplyPiles.food.push({
                    x: 140 + (i * 35),
                    y: 130,
                    width: 30, // Original size
                    height: 25, // Original size
                    type: 'food',
                    available: true
                });
            }

            // Create water supplies (5 items in a row) - original size
            for (let i = 0; i < HOUSES_COUNT; i++) {
                supplyPiles.water.push({
                    x: 70 + (i * 35),
                    y: 90,
                    width: 20, // Original size
                    height: 30, // Original size
                    type: 'water',
                    available: true
                });
            }
        }

        // Create weather effects
        function createClouds() {
            clouds = [];
            for (let i = 0; i < 6; i++) {
                clouds.push({
                    x: Math.random() * 800,
                    y: Math.random() * 150 + 20,
                    width: 120,
                    height: 60,
                    speed: 0.3 + Math.random() * 0.4
                });
            }
        }

        function createRainDrop() {
            rainDrops.push({
                x: Math.random() * 800,
                y: 0,
                speed: 8 + Math.random() * 4,
                length: 10 + Math.random() * 10
            });
        }

        // Initialize Game
        function initGame() {
            gameState = {
                timeLeft: LEVEL_TIME,
                deliveriesMade: 0,
                totalDeliveries: HOUSES_COUNT * ITEMS_PER_HOUSE,
                housesCompleted: 0,
                familiesSaved: 0,
                gameActive: true,
                gameOver: false,
                p1Deliveries: 0,
                p2Deliveries: 0,
                p1Families: 0,
                p2Families: 0,
                winner: null
            };

            drone = {
                x: 250,
                y: 250,
                width: 100,
                height: 70,
                speed: 3,
                carrying: null,
                battery: 100
            };

            drone2 = {
                x: 250,
                y: 350,
                width: 100,
                height: 70,
                speed: 3,
                carrying: null,
                battery: 100
            };

            createHouses();
            createSupplies();
            createClouds();
            rainDrops = [];
            lightningFlash = false;
            lastLightningTime = 0;

            // Update UI based on game mode
            if (gameMode === 'multiplayer') {
                document.getElementById('levelTitle').textContent = 'LEVEL 3: MULTIPLAYER RESCUE';
                document.getElementById('singlePlayerStats').style.display = 'none';
                document.getElementById('player1Stats').style.display = 'block';
                document.getElementById('player2Stats').style.display = 'block';
                document.getElementById('modeTitle').textContent = 'Level 3: MULTIPLAYER - Emergency Humanitarian Response';
                document.getElementById('controlsDisplay').innerHTML = `
                    <div style="color: #3498db;"><strong>👦 PLAYER 1:</strong> <span class="key">WASD</span> Fly | <span class="key">SPACEBAR</span> Pick Up/Drop</div>
                    <div style="color: #e74c3c; margin-top: 8px;"><strong>👧 PLAYER 2:</strong> <span class="key">↑←↓→</span> Fly | <span class="key">ENTER</span> Pick Up/Drop</div>
                `;
                document.getElementById('controlsText').innerHTML = `
                    <span style="color: #3498db;"><strong>P1:</strong> <span class="key">WASD</span> + <span class="key">SPACE</span></span> |
                    <span style="color: #e74c3c;"><strong>P2:</strong> <span class="key">↑←↓→</span> + <span class="key">ENTER</span></span>
                `;
                document.getElementById('missionDesc').innerHTML = `
                    <strong>COMPETITION MODE:</strong> Race to deliver the most supplies!<br>
                    Each family needs all 3 items (🏥 Medical, 🍞 Food, 💧 Water).<br>
                    Player who saves the most families wins!<br><br>
                    <em style="color: #f39c12;">⚠️ Both drones share the same battery recharge station at base!</em>
                `;
            } else {
                document.getElementById('levelTitle').textContent = 'LEVEL 3: FLOOD RESCUE DRONE';
                document.getElementById('singlePlayerStats').style.display = 'block';
                document.getElementById('player1Stats').style.display = 'none';
                document.getElementById('player2Stats').style.display = 'none';
            }

            updateUI();
            startScreen.style.display = 'none';
            endScreen.style.display = 'none';

            // Start rain background music
            const rainMusic = document.getElementById('rainMusic');
            rainMusic.currentTime = 0;
            rainMusic.volume = 0.2;
            rainMusic.play();

            lastTime = Date.now();
            // Start game loop
            requestAnimationFrame(gameLoop);
        }

        // Update Game State
        function updateGame(deltaTime) {
            if (!gameState.gameActive) return;

            // Update timer
            gameState.timeLeft -= deltaTime;

            // Update drone battery
            drone.battery -= deltaTime * 0.5;
            if (drone.battery <= 0) {
                drone.battery = 0;
                if (gameMode === 'single') {
                    endGame(false, "DRONE BATTERY DEPLETED");
                    return;
                }
            }

            // Update player 2 battery in multiplayer
            if (gameMode === 'multiplayer') {
                drone2.battery -= deltaTime * 0.5;
                if (drone2.battery <= 0) {
                    drone2.battery = 0;
                }

                // Check if both drones are depleted in multiplayer
                if (drone.battery <= 0 && drone2.battery <= 0) {
                    endGame(false, "BOTH DRONES DEPLETED");
                    return;
                }

                // Check if drone2 is at base for recharging
                if (isColliding(drone2, mountainBase)) {
                    drone2.battery = Math.min(100, drone2.battery + deltaTime * 5);
                }
            }

            // Check if drone is at base for recharging
            if (isColliding(drone, mountainBase)) {
                drone.battery = Math.min(100, drone.battery + deltaTime * 5);
            }

            // Check win condition
            if (gameState.housesCompleted >= HOUSES_COUNT) {
                endGame(true);
                return;
            }

            // Check lose condition (time out)
            if (gameState.timeLeft <= 0) {
                endGame(false, "TIME'S UP");
                return;
            }

            // Update weather effects
            clouds.forEach(cloud => {
                cloud.x += cloud.speed;
                if (cloud.x > 800 + cloud.width) cloud.x = -cloud.width;
            });

            // Create rain drops
            if (Math.random() < 0.3) {
                createRainDrop();
            }

            rainDrops = rainDrops.filter(drop => {
                drop.y += drop.speed;
                return drop.y < 600;
            });

            // Lightning effect
            const currentTime = Date.now();
            if (currentTime - lastLightningTime > LIGHTNING_INTERVAL) {
                // Thunder plays first
                document.getElementById('thunderSound').currentTime = 0;
                document.getElementById('thunderSound').play();

                // Lightning shows 0.2s after thunder
                setTimeout(() => {
                    lightningFlash = true;
                    setTimeout(() => {
                        lightningFlash = false;
                    }, 150);
                }, 200);

                lastLightningTime = currentTime;
            }

            // Update UI
            updateUI();
        }

        // Check Drone Interactions
        function checkInteractions() {
            // Check Player 1 drone
            checkDroneInteraction(drone, 1);

            // Check Player 2 drone (multiplayer only)
            if (gameMode === 'multiplayer') {
                checkDroneInteraction(drone2, 2);
            }
        }

        function checkDroneInteraction(droneObj, playerNum) {
            // If drone is carrying something, try to drop it
            if (droneObj.carrying) {
                // Check if drone is over a house
                for (let house of houses) {
                    if (isColliding(droneObj, house)) {
                        // Check if house needs this item type
                        if (!house.items[droneObj.carrying]) {
                            // Deliver item to house
                            house.items[droneObj.carrying] = true;
                            droneObj.carrying = null;
                            gameState.deliveriesMade++;

                            // Track per-player deliveries in multiplayer
                            if (gameMode === 'multiplayer') {
                                if (playerNum === 1) gameState.p1Deliveries++;
                                else gameState.p2Deliveries++;
                            }

                            // Play catch sound for delivery
                            document.getElementById('catchSound').currentTime = 0;
                            document.getElementById('catchSound').play();

                            // Check if house is now complete
                            if (house.items.medic && house.items.food && house.items.water && !house.isComplete) {
                                house.isComplete = true;
                                gameState.housesCompleted++;

                                // Track which player saved the family (last delivery wins)
                                if (gameMode === 'multiplayer') {
                                    if (playerNum === 1) gameState.p1Families++;
                                    else gameState.p2Families++;
                                }

                                // Find and save the family
                                const family = families.find(f => f.house === house);
                                if (family) {
                                    family.isSaved = true;
                                    gameState.familiesSaved++;
                                }
                            }
                            return;
                        }
                    }
                }
            } else {
                // Drone is empty, try to pick up supplies
                for (let type of ['medic', 'food', 'water']) {
                    for (let supply of supplyPiles[type]) {
                        if (supply.available && isColliding(droneObj, supply)) {
                            // Pick up supply
                            droneObj.carrying = supply.type;
                            supply.available = false;
                            return;
                        }
                    }
                }
            }
        }

        // Collision Detection
        function isColliding(obj1, obj2) {
            return obj1.x < obj2.x + obj2.width &&
                   obj1.x + obj1.width > obj2.x &&
                   obj1.y < obj2.y + obj2.height &&
                   obj1.y + obj1.height > obj2.y;
        }

        // Update UI
        function updateUI() {
            timeValue.textContent = Math.max(0, Math.ceil(gameState.timeLeft));
            deliveriesCount.textContent = gameState.deliveriesMade + '/' + gameState.totalDeliveries;
            housesSaved.textContent = gameState.housesCompleted + '/' + HOUSES_COUNT;
            familiesSaved.textContent = gameState.familiesSaved + '/' + HOUSES_COUNT;

            if (gameMode === 'multiplayer') {
                // Update multiplayer stats
                document.getElementById('p1Battery').textContent = Math.floor(drone.battery);
                document.getElementById('p2Battery').textContent = Math.floor(drone2.battery);
                document.getElementById('p1Deliveries').textContent = gameState.p1Deliveries;
                document.getElementById('p2Deliveries').textContent = gameState.p2Deliveries;
                document.getElementById('p1Families').textContent = gameState.p1Families;
                document.getElementById('p2Families').textContent = gameState.p2Families;
            } else {
                // Update single player stats
                batteryValue.textContent = Math.floor(drone.battery);

                // Update cargo status
                if (drone.carrying) {
                    cargoStatus.textContent = drone.carrying.toUpperCase();
                } else {
                    cargoStatus.textContent = 'EMPTY';
                }
            }

            const progress = (gameState.deliveriesMade / gameState.totalDeliveries) * 100;
            progressFill.style.width = progress + '%';
            missionProgress.textContent = Math.round(progress);

            // Landscape overlay sync
            document.getElementById('gameplay3TimeVal').textContent     = Math.ceil(gameState.timeLeft);
            document.getElementById('gameplay3DeliveryVal').textContent = gameState.deliveriesMade;
            document.getElementById('gameplay3BatVal').textContent      = Math.round(drone.battery);
            document.getElementById('gameplay3P2Bat').textContent       = Math.round(drone2.battery);
        }

        // End Game
        function endGame(victory, reason = "") {
            gameState.gameActive = false;
            gameState.gameOver = true;

            // Stop rain music
            document.getElementById('rainMusic').pause();

            // Determine winner in multiplayer
            if (gameMode === 'multiplayer') {
                if (gameState.p1Families > gameState.p2Families) {
                    gameState.winner = 1;
                } else if (gameState.p2Families > gameState.p1Families) {
                    gameState.winner = 2;
                } else {
                    gameState.winner = 0; // Tie
                }
            }

            if (victory) {
                if (gameMode === 'multiplayer') {
                    // Multiplayer victory messages
                    if (gameState.winner === 1) {
                        endTitle.textContent = '🎉 PLAYER 1 WINS! 🎉';
                        endTitle.style.color = '#3498db';
                    } else if (gameState.winner === 2) {
                        endTitle.textContent = '🎉 PLAYER 2 WINS! 🎉';
                        endTitle.style.color = '#e74c3c';
                    } else {
                        endTitle.textContent = '🤝 TIE - BOTH HEROES! 🤝';
                        endTitle.style.color = '#f39c12';
                    }

                    endFact.innerHTML = `
                        <img src="assets/save.jpg" alt="Disaster Relief" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                        <strong>🏆 MULTIPLAYER RESCUE SUCCESS!</strong><br><br>
                        <strong>👦 PLAYER 1:</strong> ${gameState.p1Families} families saved (${gameState.p1Deliveries} deliveries)<br>
                        <strong>👧 PLAYER 2:</strong> ${gameState.p2Families} families saved (${gameState.p2Deliveries} deliveries)<br><br>
                        <strong>🇻🇳 TEAMWORK IN DISASTER RESPONSE:</strong><br>
                        "Together, you saved <strong>${gameState.familiesSaved} families</strong>! Real disaster relief requires
                        coordination between multiple agencies, volunteers, and responders. In the 2024 Typhoon Yagi response,
                        hundreds of drones, helicopters, and ground teams worked simultaneously to reach isolated communities."<br><br>
                        <em style="color: #2ecc71;">🌍 Competition makes us better, but cooperation saves lives!</em>
                    `;
                } else {
                    // Single player victory
                    endTitle.textContent = '🎉 MISSION ACCOMPLISHED! 🎉';
                    endTitle.style.color = '#2ecc71';
                    endFact.innerHTML = `
                        <img src="assets/save.jpg" alt="Disaster Relief" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                        <strong>🇻🇳 VIETNAM DISASTER RELIEF - REAL HEROES:</strong><br><br>
                        "You saved <strong>${gameState.familiesSaved} families</strong>! In September 2024, <strong>Super Typhoon Yagi</strong> struck northern Vietnam
                        as the strongest storm in 30 years, causing catastrophic flooding in Hanoi, Hai Phong, and Quang Ninh provinces.
                        The disaster claimed over <strong>300 lives</strong> and displaced <strong>thousands of families</strong>."<br><br>
                        <strong>💪 UNITY IN CRISIS - VIETNAMESE RESILIENCE:</strong><br>
                        "The Vietnamese military and citizens demonstrated extraordinary courage - soldiers used boats and helicopters
                        to rescue trapped families in remote areas, while volunteers organized supply chains delivering food and medicine.
                        Communities showed incredible solidarity, helping neighbors and strangers without hesitation."<br><br>
                        <strong>🚁 TECHNOLOGY SAVES LIVES:</strong><br>
                        "Emergency drones delivered critical supplies to isolated mountain communities where roads were destroyed.
                        Mobile apps coordinated rescue efforts. Vietnam's combination of traditional resilience and modern technology
                        demonstrates how communities can overcome disaster together.<br>
                        <em style="color: #3498db;">🌍 Your gameplay reflects the real heroism of disaster responders worldwide!</em>"
                    `;
                }
                nextLevelBtn.style.display = 'inline-block';
                document.getElementById('successSound').play();
            } else {
                if (gameMode === 'multiplayer') {
                    endTitle.textContent = '💔 MISSION FAILED';
                    if (reason) endTitle.innerHTML += `<br><small>${reason}</small>`;
                    endTitle.style.color = '#e74c3c';

                    endFact.innerHTML = `
                        <strong>⚠️ NOT ENOUGH TIME:</strong><br>
                        <strong>👦 Player 1:</strong> ${gameState.p1Families} families (${gameState.p1Deliveries} deliveries)<br>
                        <strong>👧 Player 2:</strong> ${gameState.p2Families} families (${gameState.p2Deliveries} deliveries)<br><br>
                        <strong>🌊 DISASTER RESPONSE NEEDS SPEED:</strong><br>
                        "You needed to work faster and more efficiently. In real disasters, coordination and speed are everything.
                        Try again and develop better strategies for delivery routes and battery management!"
                    `;
                } else {
                    endTitle.textContent = '💔 MISSION FAILED';
                    if (reason) endTitle.innerHTML += `<br><small>${reason}</small>`;
                    endTitle.style.color = '#e74c3c';
                    endFact.innerHTML = `
                        <strong>🌊 VIETNAM'S CLIMATE CHALLENGE:</strong><br>
                        "Central and northern Vietnam face <strong>severe flooding annually</strong> during monsoon season (August-November).
                        In 2024, Typhoon Yagi was the <strong>strongest storm in 30 years</strong>, devastating entire communities and
                        affecting over <strong>200,000 people</strong> in mountainous regions."<br><br>
                        <strong>⏱️ THE GOLDEN 72 HOURS:</strong><br>
                        "The first <strong>72 hours</strong> after a disaster are critical for saving lives - this is when emergency aid
                        has maximum impact. Every second counts in humanitarian response. Climate change is increasing flood intensity
                        and frequency in Southeast Asia.<br><br>
                        <em style="color: #e74c3c;">💪 Try again - those families are depending on you!</em>"
                    `;
                }
                nextLevelBtn.style.display = 'none';
            }

            finalTime.textContent = Math.max(0, Math.ceil(gameState.timeLeft));
            finalDeliveries.textContent = gameState.deliveriesMade + '/' + gameState.totalDeliveries;
            finalHouses.textContent = gameState.housesCompleted + '/' + HOUSES_COUNT;
            finalFamilies.textContent = gameState.familiesSaved + '/' + HOUSES_COUNT;

            endScreen.style.display = 'block';
        }

        // Draw Game
        function drawGame() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw sky gradient (darker for storm)
            const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
            skyGrad.addColorStop(0, "#5a6f80");
            skyGrad.addColorStop(1, "#7a8a9a");
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, 400);

            // Draw clouds
            if (assets.cloud.complete && assets.cloud.naturalWidth > 0) {
                clouds.forEach(cloud => {
                    ctx.globalAlpha = 0.7;
                    ctx.drawImage(assets.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
                    ctx.globalAlpha = 1.0;
                });
            }

            // Lightning flash
            if (lightningFlash && assets.lightning.complete && assets.lightning.naturalWidth > 0) {
                // Flash the entire screen
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(0, 0, 800, 600);

                // Draw 2-3 lightning bolts
                const boltCount = 2 + Math.floor(Math.random() * 2);
                for (let i = 0; i < boltCount; i++) {
                    ctx.globalAlpha = 0.8;
                    const x = Math.random() * 600 + 100;
                    ctx.drawImage(assets.lightning, x, 0, 80, 300);
                }
                ctx.globalAlpha = 1.0;
            }

            // Draw rain
            ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
            ctx.lineWidth = 1;
            rainDrops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - 2, drop.y + drop.length);
                ctx.stroke();
            });

            // Draw mountain background (above water) - original size
            if (assets.mountain.complete && assets.mountain.naturalWidth > 0) {
                ctx.drawImage(assets.mountain, 30, 0, 240, 200); // Original size
            }

            // Draw base (above water) - original size
            if (assets.base.complete && assets.base.naturalWidth > 0) {
                ctx.drawImage(assets.base, 80, 150, 140, 60); // Original size
            }

            // Draw supply piles at base
            for (let type in supplyPiles) {
                supplyPiles[type].forEach(s => {
                    if (s.available) {
                        const img = type === 'medic' ? assets.medic : (type === 'food' ? assets.food : assets.bottle);
                        if (img.complete) {
                            ctx.drawImage(img, s.x, s.y, s.width, s.height);
                        }
                    }
                });
            }

            // Draw flooded area (water)
            const waterGrad = ctx.createLinearGradient(0, 450, 0, 600);
            waterGrad.addColorStop(0, "rgba(52, 152, 219, 0.7)");
            waterGrad.addColorStop(1, "rgba(41, 128, 185, 0.9)");
            ctx.fillStyle = waterGrad;
            ctx.fillRect(0, 450, canvas.width, 150);

            // Draw water surface waves
            ctx.strokeStyle = '#2980b9';
            ctx.lineWidth = 2;
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, 450);
                ctx.lineTo(i + 10, 445);
                ctx.lineTo(i + 20, 450);
                ctx.stroke();
            }

            // Draw houses
            houses.forEach((h, i) => {
                if (assets.house.complete && assets.house.naturalWidth > 0) {
                    ctx.drawImage(assets.house, h.x, h.y, h.width, h.height);
                }

                // Draw delivery status indicators (2x bigger)
                const statusY = h.y - 35;
                ctx.fillStyle = h.items.medic ? "#2ecc71" : "#e74c3c";
                ctx.fillRect(h.x + 20, statusY, 24, 24);
                ctx.fillStyle = h.items.food ? "#2ecc71" : "#e74c3c";
                ctx.fillRect(h.x + 60, statusY, 24, 24);
                ctx.fillStyle = h.items.water ? "#2ecc71" : "#e74c3c";
                ctx.fillRect(h.x + 100, statusY, 24, 24);

                // Status labels (2x bigger font)
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Courier New';
                ctx.fillText('M', h.x + 26, statusY + 18);
                ctx.fillText('F', h.x + 66, statusY + 18);
                ctx.fillText('W', h.x + 104, statusY + 18);

                // Draw family on roof
                const f = families[i];
                if (assets.family.complete && assets.family.naturalWidth > 0) {
                    ctx.drawImage(assets.family, f.x, f.y, f.width, f.height);
                }
            });

            // Draw drone 1
            if (assets.drone.complete && assets.drone.naturalWidth > 0) {
                ctx.drawImage(assets.drone, drone.x, drone.y, drone.width, drone.height);
            }

            // Draw Player 1 outline
            if (gameMode === 'multiplayer') {
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 3;
                ctx.strokeRect(drone.x, drone.y, drone.width, drone.height);
            }

            // Draw carried item for drone 1 (2x bigger)
            if (drone.carrying) {
                const ix = drone.x + 25;
                const iy = drone.y + 75;
                const img = drone.carrying === 'medic' ? assets.medic : (drone.carrying === 'food' ? assets.food : assets.bottle);
                if (img.complete) {
                    ctx.drawImage(img, ix, iy, 50, 50); // 2x bigger (was 25, 25)
                }
            }

            // Draw drone 2 (multiplayer only)
            if (gameMode === 'multiplayer') {
                if (assets.drone.complete && assets.drone.naturalWidth > 0) {
                    ctx.drawImage(assets.drone, drone2.x, drone2.y, drone2.width, drone2.height);
                }

                // Draw Player 2 outline
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 3;
                ctx.strokeRect(drone2.x, drone2.y, drone2.width, drone2.height);

                // Draw carried item for drone 2
                if (drone2.carrying) {
                    const ix = drone2.x + 25;
                    const iy = drone2.y + 75;
                    const img = drone2.carrying === 'medic' ? assets.medic : (drone2.carrying === 'food' ? assets.food : assets.bottle);
                    if (img.complete) {
                        ctx.drawImage(img, ix, iy, 50, 50);
                    }
                }

                // Draw battery indicator for drone 2
                const battery2Width = 40;
                const battery2Height = 8;
                const battery2X = drone2.x + drone2.width/2 - battery2Width/2;
                const battery2Y = drone2.y - 15;

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect(battery2X, battery2Y, battery2Width, battery2Height);

                ctx.fillStyle = drone2.battery > 50 ? '#2ecc71' : drone2.battery > 20 ? '#f39c12' : '#e74c3c';
                ctx.fillRect(battery2X, battery2Y, (battery2Width * drone2.battery) / 100, battery2Height);
            }

            // Draw battery indicator for drone 1
            const batteryWidth = 40;
            const batteryHeight = 8;
            const batteryX = drone.x + drone.width/2 - batteryWidth/2;
            const batteryY = drone.y - 15;

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(batteryX, batteryY, batteryWidth, batteryHeight);

            ctx.fillStyle = drone.battery > 50 ? '#2ecc71' : drone.battery > 20 ? '#f39c12' : '#e74c3c';
            ctx.fillRect(batteryX, batteryY, (batteryWidth * drone.battery) / 100, batteryHeight);
        }

        // Game Loop
        function gameLoop() {
            if (gameState.gameActive && !gameState.gameOver) {
                const currentTime = Date.now();
                const deltaTime = (currentTime - lastTime) / 1000;
                lastTime = currentTime;

                handleInput();
                updateGame(deltaTime);
                drawGame();
                requestAnimationFrame(gameLoop);
            }
        }

        // Event Listeners
        startBtn.addEventListener('click', initGame);
        retryBtn.addEventListener('click', initGame);
        nextLevelBtn.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
        backBtn.addEventListener('click', function() {
            window.location.href = '../level2/Level2.html?mode=' + gameMode;
        });
        backBtnStart.addEventListener('click', function() {
            window.location.href = '../level2/Level2.html?mode=' + gameMode;
        });

        // Keyboard Controls
        const keys = {};

        window.addEventListener('keydown', function(e) {
            keys[e.key] = true;

            // Spacebar - Player 1 interact
            if (e.key === ' ' && gameState.gameActive) {
                checkDroneInteraction(drone, 1);
                e.preventDefault();
            }

            // Enter - Player 2 interact (multiplayer only)
            if (e.key === 'Enter' && gameState.gameActive && gameMode === 'multiplayer') {
                checkDroneInteraction(drone2, 2);
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', function(e) {
            keys[e.key] = false;
        });

        // Mobile touch controls
        function handleMobileBtn3(id, key) {
            const btn = document.getElementById(id);
            if (!btn) return;
            const press   = (e) => { e.preventDefault(); keys[key] = true; };
            const release = (e) => { e.preventDefault(); keys[key] = false; };
            btn.addEventListener('touchstart',  press,   { passive: false });
            btn.addEventListener('touchend',    release, { passive: false });
            btn.addEventListener('touchcancel', release, { passive: false });
            btn.addEventListener('mousedown',   press);
            btn.addEventListener('mouseup',     release);
        }

        function handleMobileActionBtn3(id, droneRef, playerNum) {
            const btn = document.getElementById(id);
            if (!btn) return;
            let held = false;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!held && gameState.gameActive) {
                    held = true;
                    checkDroneInteraction(droneRef(), playerNum);
                }
            }, { passive: false });
            btn.addEventListener('touchend',    (e) => { e.preventDefault(); held = false; }, { passive: false });
            btn.addEventListener('touchcancel', (e) => { e.preventDefault(); held = false; }, { passive: false });
            btn.addEventListener('mousedown', () => {
                if (!held && gameState.gameActive) { held = true; checkDroneInteraction(droneRef(), playerNum); }
            });
            btn.addEventListener('mouseup', () => { held = false; });
        }

        // Wire single player buttons
        handleMobileBtn3('mob3Left',  'a');
        handleMobileBtn3('mob3Up',    'w');
        handleMobileBtn3('mob3Down',  's');
        handleMobileBtn3('mob3Right', 'd');
        handleMobileActionBtn3('mob3Action', () => drone, 1);

        // Wire multiplayer P1 buttons
        handleMobileBtn3('mob3P1Left',  'a');
        handleMobileBtn3('mob3P1Up',    'w');
        handleMobileBtn3('mob3P1Down',  's');
        handleMobileBtn3('mob3P1Right', 'd');
        handleMobileActionBtn3('mob3P1Action', () => drone, 1);

        // Wire multiplayer P2 buttons
        handleMobileBtn3('mob3P2Left',  'ArrowLeft');
        handleMobileBtn3('mob3P2Up',    'ArrowUp');
        handleMobileBtn3('mob3P2Down',  'ArrowDown');
        handleMobileBtn3('mob3P2Right', 'ArrowRight');
        handleMobileActionBtn3('mob3P2Action', () => drone2, 2);

        function updateMobileUI3() {
            const isLandscape = window.innerHeight < window.innerWidth && window.innerHeight < 600;
            const isMobile    = window.innerWidth <= 768 || isLandscape;

            const ctrl1   = document.getElementById('mobileControls3');
            const ctrlP1  = document.getElementById('mobileControls3P1');
            const ctrlP2  = document.getElementById('mobileControls3P2');
            const overlay = document.getElementById('gameplayUI3');
            const p2Info  = document.getElementById('gameplay3P2Info');

            if (!isMobile) {
                ctrl1.style.display   = 'none';
                ctrlP1.style.display  = 'none';
                ctrlP2.style.display  = 'none';
                overlay.style.display = 'none';
                return;
            }

            if (gameMode === 'multiplayer') {
                ctrl1.style.display  = 'none';
                ctrlP1.style.display = 'grid';
                ctrlP2.style.display = 'grid';
                if (p2Info) p2Info.style.display = 'block';
            } else {
                ctrl1.style.display  = isLandscape ? 'grid' : 'flex';
                ctrlP1.style.display = 'none';
                ctrlP2.style.display = 'none';
                if (p2Info) p2Info.style.display = 'none';
            }

            overlay.style.display = isLandscape ? 'flex' : 'none';
        }

        window.addEventListener('resize',            updateMobileUI3);
        window.addEventListener('orientationchange', updateMobileUI3);
        updateMobileUI3();

        // Handle continuous key presses for movement
        function handleInput() {
            // Player 1 controls (WASD)
            if ((keys['a'] || keys['A']) && drone.x > 0) {
                drone.x -= drone.speed;
            }
            if ((keys['d'] || keys['D']) && drone.x < canvas.width - drone.width) {
                drone.x += drone.speed;
            }
            if ((keys['w'] || keys['W']) && drone.y > 50) {
                drone.y -= drone.speed;
            }
            if ((keys['s'] || keys['S']) && drone.y < canvas.height - drone.height - 40) {
                drone.y += drone.speed;
            }

            // Player 2 controls (Arrow keys) - multiplayer only
            if (gameMode === 'multiplayer') {
                if (keys['ArrowLeft'] && drone2.x > 0) {
                    drone2.x -= drone2.speed;
                }
                if (keys['ArrowRight'] && drone2.x < canvas.width - drone2.width) {
                    drone2.x += drone2.speed;
                }
                if (keys['ArrowUp'] && drone2.y > 50) {
                    drone2.y -= drone2.speed;
                }
                if (keys['ArrowDown'] && drone2.y < canvas.height - drone2.height - 40) {
                    drone2.y += drone2.speed;
                }
            }
        }

        // Draw initial screen
        drawGame();
