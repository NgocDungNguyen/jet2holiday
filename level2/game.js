        // LEVEL 2 - VERSION 2.0.1 - Fixed broken image rendering
        console.log('🎮 Level 2 Script Loaded - v2.0.1 (Fixed image rendering)');

        // Get game mode from URL parameter (passed from Level 1)
        const urlParams = new URLSearchParams(window.location.search);
        let gameMode = urlParams.get('mode') || 'single'; // 'single' or 'multiplayer'

        // Game Constants
        const PRE_RAIN_TIME = 10; // 5 seconds before rain starts
        const RAIN_DURATION = 60; // 30 seconds of rain
        const MAX_WATER_LEVEL = 50; // Lose if water reaches 40%
        const SEWER_COUNT = 3;
        const TRASH_PER_SEWER = 12; // More trash per sewer (increased from 5 to 8)
        const WATER_RISE_RATE = 0.8; // Water rises 1% per SECOND when all sewers blocked
        const WATER_DRAIN_RATE = 0.4; // Water drains 0.5% per SECOND per clear sewer
        const LIGHTNING_INTERVAL = 5000; // Lightning every 5 seconds

        // Frame rate control
        let lastFrameTime = Date.now();
        const targetFPS = 60;
        const frameDelay = 1000 / targetFPS;

        // Load Assets
        const assets = {
            background: new Image(),
            bin: new Image(),
            binOpen: new Image(),
            trashCar: new Image(),
            sewer: new Image(),
            bottle: new Image(),
            plastic: new Image(),
            cloud: new Image(),
            lightning: new Image(),
            // Boy sprites
            boyFront: new Image(),
            boyLeft: new Image(),
            boyRight: new Image(),
            boyLeftWalk1: new Image(),
            boyLeftWalk2: new Image(),
            boyLeftRun1: new Image(),
            boyLeftRun2: new Image(),
            boyLeftBow: new Image(),
            boyLeftLying: new Image(),
            boyRightWalk1: new Image(),
            boyRightWalk2: new Image(),
            boyRightRun1: new Image(),
            boyRightRun2: new Image(),
            boyRightBow: new Image(),
            boyRightLying: new Image(),
            // Girl sprites
            girlFront: new Image(),
            girlLeft: new Image(),
            girlRight: new Image(),
            girlLeftWalk1: new Image(),
            girlLeftWalk2: new Image(),
            girlLeftRun1: new Image(),
            girlLeftRun2: new Image(),
            girlLeftBow: new Image(),
            girlLeftLying: new Image(),
            girlRightWalk1: new Image(),
            girlRightWalk2: new Image(),
            girlRightRun1: new Image(),
            girlRightRun2: new Image(),
            girlRightBow: new Image(),
            girlRightLying: new Image()
        };

        assets.background.src = 'assets/City.png';
        assets.bin.src = 'assets/bin.png';
        assets.binOpen.src = 'assets/Bin_Open.png';
        assets.trashCar.src = 'assets/Trash_Car.png';
        assets.sewer.src = 'assets/Sew.png';
        assets.bottle.src = 'assets/Bottle.png';
        assets.plastic.src = 'assets/Plastic.png';
        assets.cloud.src = 'assets/Cloud.png';
        assets.lightning.src = 'assets/Lightning.png';

        // Load Boy sprites
        assets.boyFront.src = 'assets/Boy_Front.png';
        assets.boyLeft.src = 'assets/Boy_Left.png';
        assets.boyRight.src = 'assets/Boy_Right.png';
        assets.boyLeftWalk1.src = 'assets/Boy_Left_Walk1.png';
        assets.boyLeftWalk2.src = 'assets/Boy_Left_Walk2.png';
        assets.boyLeftRun1.src = 'assets/Boy_Left_Run1.png';
        assets.boyLeftRun2.src = 'assets/Boy_Left_Run2.png';
        assets.boyLeftBow.src = 'assets/Boy_Left_Bow.png';
        assets.boyRightWalk1.src = 'assets/Boy_Right_Walk1.png';
        assets.boyRightWalk2.src = 'assets/Boy_Right_Walk2.png';
        assets.boyRightRun1.src = 'assets/Boy_Right_Run1.png';
        assets.boyRightRun2.src = 'assets/Boy_Right_Run2.png';
        assets.boyRightBow.src = 'assets/Boy_Right_Bow.png';
        assets.boyLeftLying.src = 'assets/Boy_Left_Lying.png';
        assets.boyRightLying.src = 'assets/Boy_Right_Lying.png';

        // Load Girl sprites
        assets.girlFront.src = 'assets/Girl_Front.png';
        assets.girlLeft.src = 'assets/Girl_Left.png';
        assets.girlRight.src = 'assets/Girl_Right.png';
        assets.girlLeftWalk1.src = 'assets/Girl_Left_Walk1.png';
        assets.girlLeftWalk2.src = 'assets/Girl_Left_Walk2.png';
        assets.girlLeftRun1.src = 'assets/Girl_Left_Run1.png';
        assets.girlLeftRun2.src = 'assets/Girl_Left_Run2.png';
        assets.girlLeftBow.src = 'assets/Girl_Left_Bow.png';
        assets.girlLeftLying.src = 'assets/Girl_Left_Lying.png';
        assets.girlRightWalk1.src = 'assets/Girl_Right_Walk1.png';
        assets.girlRightWalk2.src = 'assets/Girl_Right_Walk2.png';
        assets.girlRightRun1.src = 'assets/Girl_Right_Run1.png';
        assets.girlRightRun2.src = 'assets/Girl_Right_Run2.png';
        assets.girlRightBow.src = 'assets/Girl_Right_Bow.png';
        assets.girlRightLying.src = 'assets/Girl_Right_Lying.png';

        // Asset Loading Tracking
        let totalAssets = 0;
        let loadedAssets = 0;

        // Count total assets to load
        for (let key in assets) {
            if (assets[key] instanceof Image) {
                totalAssets++;
            }
        }

        // Track loading progress
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingBar = document.getElementById('loadingBar');
        const loadingText = document.getElementById('loadingText');

        function updateLoadingProgress() {
            const progress = Math.floor((loadedAssets / totalAssets) * 100);
            loadingBar.style.width = progress + '%';
            loadingBar.textContent = progress + '%';
            loadingText.textContent = `Loading assets... ${loadedAssets}/${totalAssets}`;

            console.log(`Loading progress: ${loadedAssets}/${totalAssets} (${progress}%)`);

            if (loadedAssets >= totalAssets) {
                console.log('All assets loaded! Showing start screen...');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Show appropriate screen after loading
                    if (gameMode === 'single') {
                        startScreen.style.display = 'flex';
                    } else {
                        startScreen.style.display = 'flex';
                    }
                    initUI();
                    console.log('Start screen should now be visible');
                }, 500); // Small delay to show 100%
            }
        }

        // Add load event listeners to all image assets
        for (let key in assets) {
            if (assets[key] instanceof Image) {
                assets[key].addEventListener('load', () => {
                    loadedAssets++;
                    console.log(`✓ Loaded: ${key}`);
                    updateLoadingProgress();
                });

                assets[key].addEventListener('error', (e) => {
                    console.error(`✗ FAILED to load asset: ${key} (${assets[key].src})`);
                    loadedAssets++; // Count as loaded to prevent stuck loading
                    updateLoadingProgress();
                });
            }
        }

        // Load Audio
        const rainSound = new Audio('SFX/Rain.mp3');
        rainSound.loop = true;
        rainSound.volume = 1.0;

        const thunderSound = new Audio('SFX/Thunder.mp3');
        thunderSound.volume = 1.0;

        const successSound = new Audio('SFX/Success.mp3');
        successSound.volume = 1.0;

        const catchSound = new Audio('SFX/Catch.mp3');
        catchSound.volume = 0.8;

        // Game State
        let gameState = {
            phase: 'preRain',
            preRainTimeLeft: PRE_RAIN_TIME,
            rainTimeLeft: RAIN_DURATION,
            waterLevel: 0,
            p1Trash: 0,
            p2Trash: 0,
            totalTrash: 0,
            trashOnRoad: 0, // Track trash dropped on road (not in bins)
            sewersCleared: 0,
            gameActive: false,
            gameOver: false,
            lastLightning: 0,
            winner: null
        };

        // DOM Elements
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const characterScreen = document.getElementById('characterScreen');
        const selectBoy = document.getElementById('selectBoy');
        const selectGirl = document.getElementById('selectGirl');
        const backToLevel1 = document.getElementById('backToLevel1');
        const startScreen = document.getElementById('startScreen');
        const endScreen = document.getElementById('endScreen');
        const startBtn = document.getElementById('startBtn');
        const retryBtn = document.getElementById('retryBtn');
        const backBtn = document.getElementById('backBtn');
        const countdownValue = document.getElementById('countdownValue');
        const rainTimeValue = document.getElementById('rainTimeValue');
        const waterLevelValue = document.getElementById('waterLevelValue');
        const sewersClear = document.getElementById('sewersClear');
        const p1TrashUI = document.getElementById('p1Trash');
        const p2TrashUI = document.getElementById('p2Trash');
        const player2UI = document.getElementById('player2UI');
        const endTitle = document.getElementById('endTitle');
        const endStats = document.getElementById('endStats');
        const endFact = document.getElementById('endFact');
        const modeTitle = document.getElementById('modeTitle');
        const missionDesc = document.getElementById('missionDesc');
        const controlsDisplay = document.getElementById('controlsDisplay');
        const singleControls = document.getElementById('singleControls');
        const multiControls = document.getElementById('multiControls');

        // Key press tracking to prevent holding keys
        let spacePressed = false;
        let enterPressed = false;

        // Character selection
        let selectedCharacter = 'boy'; // 'boy' or 'girl' for single player

        // IMPORTANT: Boy and Girl characters have IDENTICAL animation and movement settings
        // Only the sprite images differ - all speeds, transitions, and timings are the same

        // Game Objects
        let player1 = {
            x: 200,
            y: 550, // Standing on ground at y=500
            baseY: 550, // Ground level (moved down to give more room for water)
            width: 45,
            height: 80, // Reduced from 90 to 80 pixels (more realistic proportion)
            baseSpeed: 1, // SAME for both Boy and Girl
            speed: 1,
            carrying: null,
            isBoy: true,
            // Animation states
            direction: 'front', // 'front', 'left', 'right'
            movementState: 'idle', // 'idle', 'walk', 'run', 'bow', 'lying', 'dead'
            animationFrame: 0,
            frameCounter: 0,
            idleTimer: 0,
            walkRunTransitionFrame: 35, // SAME for both Boy and Girl
            animationSpeed: 15, // SAME for both Boy and Girl
            bowTimer: 0,
            bowDuration: 25, // SAME for both Boy and Girl
            // Stamina system
            stamina: 100,
            maxStamina: 100,
            staminaRegenRate: 0.15, // Regenerates per frame when not acting - SAME for both
            staminaDrainMove: 0.08, // Drain when moving - SAME for both
            staminaDrainBow: 2, // Drain when picking/dropping - SAME for both
            staminaDrainUnderwater: 0.25, // Extra drain when underwater - SAME for both
            // Jumping
            velocityY: 0,
            isJumping: false,
            jumpPower: -8, // Reduced from -8 for more realistic jump height - SAME for both
            gravity: 0.3, // Increased for more realistic falling speed - SAME for both Boy and Girl
            // Health/Drowning
            health: 100,
            maxHealth: 100,
            underwaterTimer: 0, // Seconds spent fully underwater (uses deltaTime)
            drownThreshold: 5.0, // 5 seconds to drown (time-based, not frame-based) - SAME for both
            isDrowning: false,
            isDead: false,
            deathAnimTimer: 0,
            deathAnimDuration: 120 // 2 second slow fall animation - SAME for both
        };

        // Player 2 has IDENTICAL settings to Player 1 for fair multiplayer
        let player2 = {
            x: 600,
            y: 550, // Standing on ground at y=500
            baseY: 550, // Ground level (moved down to give more room for water)
            width: 45,
            height: 80, // Reduced from 90 to 80 pixels (more realistic proportion)
            baseSpeed: 1, // IDENTICAL to Player 1
            speed: 1,
            carrying: null,
            isBoy: false, // Only difference: sprite selection
            // Animation states
            direction: 'front',
            movementState: 'idle',
            animationFrame: 0,
            frameCounter: 0,
            idleTimer: 0,
            walkRunTransitionFrame: 35, // IDENTICAL to Player 1
            animationSpeed: 15, // IDENTICAL to Player 1
            bowTimer: 0,
            bowDuration: 25, // IDENTICAL to Player 1
            // Stamina system
            stamina: 100,
            maxStamina: 100,
            staminaRegenRate: 0.15, // IDENTICAL to Player 1
            staminaDrainMove: 0.08, // IDENTICAL to Player 1
            staminaDrainBow: 2, // IDENTICAL to Player 1
            staminaDrainUnderwater: 0.25, // IDENTICAL to Player 1
            // Jumping
            velocityY: 0,
            isJumping: false,
            jumpPower: -8, // IDENTICAL to Player 1 - realistic jump height
            gravity: 0.3, // IDENTICAL to Player 1 - realistic falling speed
            // Health/Drowning
            health: 100,
            maxHealth: 100,
            underwaterTimer: 0, // Seconds spent fully underwater (uses deltaTime)
            drownThreshold: 5.0, // IDENTICAL to Player 1 (time-based, not frame-based)
            isDrowning: false,
            isDead: false,
            deathAnimTimer: 0,
            deathAnimDuration: 120 // IDENTICAL to Player 1 - 2 second slow fall animation
        };

        let sewers = [];
        let bins = [];
        let trashItems = [];
        let clouds = [];
        let rainDrops = [];
        let lightningFlash = false;

        // Initialize UI based on game mode
        function initUI() {
            const controlsList = document.getElementById('controlsList');

            if (gameMode === 'multiplayer') {
                modeTitle.textContent = 'LEVEL 2 - MULTIPLAYER MODE';

                // Update controls list for multiplayer
                if (controlsList) {
                    controlsList.innerHTML = `
                        <li><strong style="color: #3498db;">PLAYER 1 (BOY):</strong></li>
                        <li><span class="key">A</span> / <span class="key">D</span> = Move LEFT/RIGHT</li>
                        <li><span class="key">W</span> = JUMP / Swim Up</li>
                        <li><span class="key">SPACEBAR</span> = Pick Up / Drop Trash</li>
                        <li style="margin-top: 8px;"><strong style="color: #e91e63;">PLAYER 2 (GIRL):</strong></li>
                        <li><span class="key">←</span> / <span class="key">→</span> = Move LEFT/RIGHT</li>
                        <li><span class="key">↑</span> = JUMP / Swim Up</li>
                        <li><span class="key">ENTER</span> = Pick Up / Drop Trash</li>
                    `;
                }

                player2UI.style.display = 'block';
            } else {
                modeTitle.textContent = 'LEVEL 2 - SINGLE PLAYER';

                // Controls list already set in HTML for single player
                player2UI.style.display = 'none';
            }
        }

        function createSewers() {
            sewers = [];
            const sewerY = 530; // Adjusted to match new ground level (500 + 30 offset)
            const sewerPositions = [150, 400, 650];

            sewerPositions.forEach((x) => {
                sewers.push({
                    x: x,
                    y: sewerY,
                    width: 55,
                    height: 30,
                    blocked: true,
                    trashCount: 0
                });
            });
        }

        function createBins() {
            bins = [];
            // Left bin (regular bin)
            bins.push({
                x: 30,
                y: 440, // Adjusted to match new ground level (500 - 60 offset)
                baseY: 440, // Original ground position
                baseX: 30, // Store original X position for boundary checks
                width: 70,
                height: 120,
                type: 'bin', // 'bin' or 'trashCar'
                isOpen: false,
                openTimer: 0,
                isFloating: false,
                floatOffset: 0,
                floatSpeed: 0.5, // Reduced speed for smoother movement
                floatDirection: 1,
                floatDuration: 0, // Current duration in direction
                floatDurationTarget: 180 + Math.random() * 120 // Random 3-5 seconds (180-300 frames at 60fps)
            });
            // Right bin (trash car)
            bins.push({
                x: 695,
                y: 440, // Adjusted to match new ground level (500 - 60 offset)
                baseY: 440,
                baseX: 695, // Store original X position for boundary checks
                width: 70,
                height: 120,
                type: 'trashCar',
                isOpen: false,
                openTimer: 0,
                isFloating: false,
                floatOffset: 0,
                floatSpeed: 0.5, // Reduced speed for smoother movement
                floatDirection: -1,
                floatDuration: 0,
                floatDurationTarget: 180 + Math.random() * 120 // Random 3-5 seconds
            });
        }

        function createInitialTrash() {
            trashItems = [];
            const trashTypes = ['bottle', 'plastic'];

            sewers.forEach((sewer, sewerIndex) => {
                for (let i = 0; i < TRASH_PER_SEWER; i++) {
                    const type = trashTypes[Math.floor(Math.random() * trashTypes.length)];
                    const offsetX = (Math.random() - 0.5) * 50;
                    const offsetY = (Math.random() - 0.5) * 25;

                    trashItems.push({
                        x: sewer.x + offsetX,
                        y: sewer.y + offsetY,
                        width: 32,
                        height: 32,
                        type: type,
                        onSewer: sewerIndex,
                        canPickup: false,
                        // Initial trash doesn't fall (already on ground/sewer)
                        isFalling: false,
                        velocityY: 0,
                        gravity: 0.008,
                        groundY: sewer.y + offsetY
                    });
                    sewer.trashCount++;
                }
            });

            gameState.totalTrash = trashItems.length;
        }

        function createClouds() {
            clouds = [];
            for (let i = 0; i < 6; i++) {
                clouds.push({
                    x: Math.random() * 800,
                    y: Math.random() * 80,
                    width: 140 + Math.random() * 80,
                    height: 70 + Math.random() * 40,
                    speed: 0.4 + Math.random() * 0.6
                });
            }
        }

        function createRainDrop() {
            if (gameState.phase === 'raining') {
                for (let i = 0; i < 4; i++) {
                    rainDrops.push({
                        x: Math.random() * 800,
                        y: -10,
                        speed: 9 + Math.random() * 5,
                        length: 18 + Math.random() * 12
                    });
                }
            }
        }

        function initGame() {
            console.log('initGame() called - mode:', gameMode);

            gameState = {
                phase: 'preRain',
                preRainTimeLeft: PRE_RAIN_TIME,
                rainTimeLeft: RAIN_DURATION,
                waterLevel: 0,
                p1Trash: 0,
                p2Trash: 0,
                totalTrash: 0,
                trashOnRoad: 0,
                sewersCleared: 0,
                gameActive: true,
                gameOver: false,
                lastLightning: 0,
                winner: null
            };

            // Reset players
            if (gameMode === 'single') {
                player1.x = 400;
                player1.y = player1.baseY; // Use baseY (500)
                player1.carrying = null;
                player1.isBoy = (selectedCharacter === 'boy');
                player1.direction = 'front';
                player1.movementState = 'idle';
                player1.animationFrame = 0;
                player1.frameCounter = 0;
                player1.idleTimer = 0;
                player1.bowTimer = 0;
                // Reset physics
                player1.velocityY = 0;
                player1.isJumping = false;
                player1.stamina = 100;
                player1.underwaterTimer = 0;
                player1.isDrowning = false;
                player1.isDead = false;
                player1.deathAnimTimer = 0;
                player1.speed = player1.baseSpeed;
            } else {
                player1.x = 200;
                player1.y = player1.baseY; // Use baseY (500)
                player1.carrying = null;
                player1.isBoy = true;
                player1.direction = 'front';
                player1.movementState = 'idle';
                player1.animationFrame = 0;
                player1.frameCounter = 0;
                player1.idleTimer = 0;
                player1.bowTimer = 0;
                // Reset physics
                player1.velocityY = 0;
                player1.isJumping = false;
                player1.stamina = 100;
                player1.underwaterTimer = 0;
                player1.isDrowning = false;
                player1.isDead = false;
                player1.deathAnimTimer = 0;
                player1.speed = player1.baseSpeed;

                player2.x = 600;
                player2.y = player2.baseY; // Use baseY (500)
                player2.carrying = null;
                player2.isBoy = false;
                player2.direction = 'front';
                player2.movementState = 'idle';
                player2.animationFrame = 0;
                player2.frameCounter = 0;
                player2.idleTimer = 0;
                player2.bowTimer = 0;
                // Reset physics
                player2.velocityY = 0;
                player2.isJumping = false;
                player2.stamina = 100;
                player2.underwaterTimer = 0;
                player2.isDrowning = false;
                player2.isDead = false;
                player2.deathAnimTimer = 0;
                player2.speed = player2.baseSpeed;
            }

            createSewers();
            createBins();
            createInitialTrash();

            console.log('Game initialized:', {
                sewers: sewers.length,
                bins: bins.length,
                trashItems: trashItems.length,
                player1: { x: player1.x, y: player1.y, isBoy: player1.isBoy },
                player2: gameMode === 'multiplayer' ? { x: player2.x, y: player2.y, isBoy: player2.isBoy } : 'N/A'
            });

            // Don't create clouds yet - they should spawn when rain starts
            clouds = [];
            rainDrops = [];
            lightningFlash = false;

            // Reset frame timer
            lastFrameTime = Date.now();

            updateUI();
            startScreen.style.display = 'none';
            endScreen.style.display = 'none';
            characterScreen.style.display = 'none'; // Hide character screen when game starts

            requestAnimationFrame(gameLoop);
        }

        function updatePlayer(player, deltaTime) {
            if (player.isDead) {
                // Handle death animation - character falls to ground and stays there
                if (player.deathAnimTimer < player.deathAnimDuration) {
                    player.deathAnimTimer++;

                    // Falling animation - slowly fall down to ground level
                    if (player.y < player.baseY) {
                        player.y += 1; // Fall down very slowly (reduced from 2 to 1 for smoother animation)
                        // Don't go past ground level
                        if (player.y > player.baseY) {
                            player.y = player.baseY;
                        }
                    }
                } else {
                    // After death animation, ensure character is on ground
                    player.y = player.baseY;
                }
                return;
            }

            // Calculate water level from bottom of canvas
            const waterHeight = (gameState.waterLevel / 100) * 600;
            const waterY = 600 - waterHeight;

            // Calculate player's head position
            // Player sprite: feet at player.y, head at player.y - height
            // The actual head/face is about 85% up from the feet (top 15% is hair/top of head)
            const playerTopY = player.y - player.height; // Top of character sprite
            const playerHeadY = player.y - (player.height * 0.85); // Face/nose level (85% up from feet)

            // Add 1.2x buffer zone: water must be 1.2x above head before drowning countdown starts
            // This gives more realistic drowning mechanic - water needs to be significantly over the head
            const headHeight = player.height * 0.85; // Distance from feet to head
            const bufferDistance = headHeight * 0.2; // 20% extra buffer (to reach 1.2x total)
            const drowningThresholdY = playerHeadY - bufferDistance; // Water must be above this point

            // Check if player is deep enough underwater to start drowning (water is 1.2x above head)
            const isDeepUnderwater = waterY < drowningThresholdY;

            // Check if player is at least partially underwater (for physics)
            const isUnderwater = playerHeadY > waterY;

            // Gravity and jumping physics with underwater resistance
            if (!player.isDead) {
                // Apply gravity (stronger when underwater for water resistance)
                if (isUnderwater) {
                    player.velocityY += player.gravity * 1.5; // 50% stronger gravity underwater (water drag)
                } else {
                    player.velocityY += player.gravity;
                }

                player.y += player.velocityY;

                // Ground collision
                if (player.y >= player.baseY) {
                    player.y = player.baseY;
                    player.velocityY = 0;
                    player.isJumping = false;
                }
            }

            // Stamina regeneration (always regenerate when not jumping)
            if (!player.isJumping) {
                player.stamina = Math.min(player.maxStamina, player.stamina + player.staminaRegenRate);
            }

            // Speed adjustments
            // Underwater slows movement
            if (isDeepUnderwater) {
                player.speed = player.baseSpeed * 0.5; // 50% slower underwater
            } else {
                player.speed = player.baseSpeed; // Normal speed above water
            }

            // Low stamina affects speed
            if (player.stamina < 20) {
                player.speed *= 0.3; // Very slow when exhausted
            } else if (player.stamina < 50) {
                player.speed *= 0.6; // Moderate slowdown
            }

            // DROWNING MECHANICS - Must be deep underwater (1.2x above head) for 4 seconds
            if (isDeepUnderwater) {
                // Increment underwater timer using deltaTime for consistent timing across all frame rates
                player.underwaterTimer += deltaTime;

                // Check if drowning threshold exceeded (4.0 seconds of real time)
                if (player.underwaterTimer >= player.drownThreshold) {
                    player.isDrowning = true;
                    player.isDead = true;
                    player.movementState = 'lying';
                    player.deathAnimTimer = 0;

                    // End game after 3 second delay (let player see the lying down animation)
                    setTimeout(() => {
                        endGame();
                    }, 3000);
                }
            } else {
                // IMPORTANT: Reset timer immediately when not deep underwater (getting oxygen)
                player.underwaterTimer = 0;
            }
        }

        function updateGame(deltaTime) {
            if (!gameState.gameActive) return;

            // Update players (stamina, jumping, drowning)
            updatePlayer(player1, deltaTime);
            if (gameMode === 'multiplayer') {
                updatePlayer(player2, deltaTime);
            }

            // Update bow timer for both players
            if (player1.bowTimer > 0) {
                player1.bowTimer--;
                if (player1.bowTimer === 0) {
                    player1.movementState = 'idle';
                }
            }

            if (gameMode === 'multiplayer' && player2.bowTimer > 0) {
                player2.bowTimer--;
                if (player2.bowTimer === 0) {
                    player2.movementState = 'idle';
                }
            }

            // Use deltaTime for frame-independent updates (deltaTime is in seconds)
            if (gameState.phase === 'preRain') {
                gameState.preRainTimeLeft -= deltaTime;

                if (gameState.preRainTimeLeft <= 0) {
                    gameState.phase = 'raining';
                    gameState.preRainTimeLeft = 0;

                    // When rain starts: spawn clouds and play rain sound
                    createClouds();
                    rainSound.play().catch(err => console.log('Rain sound error:', err));
                }
            } else if (gameState.phase === 'raining') {
                gameState.rainTimeLeft -= deltaTime;

                if (gameState.rainTimeLeft <= 0) {
                    gameState.rainTimeLeft = 0;
                    endGame();
                    return;
                }

                // Only create rain drops occasionally (not every frame)
                if (Math.random() < 0.3) {
                    createRainDrop();
                }

                updateWaterLevel(deltaTime);

                // Lightning and thunder system (every 3 seconds during rain)
                const now = Date.now();
                if (now - gameState.lastLightning >= LIGHTNING_INTERVAL) {
                    console.log('⚡ Lightning strike triggered!');

                    // Step 1: Play thunder sound immediately
                    thunderSound.currentTime = 0;
                    thunderSound.play().catch(err => console.log('Thunder error:', err));

                    // Step 2: Show lightning 0.2 seconds AFTER thunder starts
                    setTimeout(() => {
                        lightningFlash = true;
                        console.log('⚡ Lightning flash = true');
                        setTimeout(() => {
                            lightningFlash = false;
                            console.log('⚡ Lightning flash = false');
                        }, 200); // Lightning visible for 0.2s
                    }, 200);

                    gameState.lastLightning = now;
                }

                if (gameState.waterLevel >= MAX_WATER_LEVEL) {
                    endGame();
                    return;
                }
            }

            clouds.forEach(cloud => {
                cloud.x += cloud.speed;
                if (cloud.x > 800 + cloud.width) cloud.x = -cloud.width;
            });

            rainDrops = rainDrops.filter(drop => {
                drop.y += drop.speed;
                return drop.y < 600;
            });

            // Update bins (floating and opening animation)
            bins.forEach(bin => {
                // Handle bin opening timer
                if (bin.openTimer > 0) {
                    bin.openTimer--;
                    if (bin.openTimer === 0) {
                        bin.isOpen = false;
                    }
                }

                // Calculate water height for floating effect
                const waterHeight = (gameState.waterLevel / 100) * 600;
                const waterY = 600 - waterHeight;

                // Calculate bin's center point
                const binCenterY = bin.baseY + (bin.height / 2);

                // Only start floating when water reaches the CENTER of the bin
                if (waterY <= binCenterY) {
                    // Water has reached center - bin starts floating
                    // Lift bin up exactly with water level (bin stays half-submerged)
                    bin.y = waterY - (bin.height / 2);
                    bin.isFloating = true;

                    // Calculate next position
                    const nextOffset = bin.floatOffset + (bin.floatSpeed * bin.floatDirection);
                    const nextX = bin.baseX + nextOffset;

                    // Boundary check - keep bins within screen (with 10px margin)
                    const leftBoundary = 10;
                    const rightBoundary = 800 - bin.width - 10;

                    // If next position would go out of bounds, reverse direction
                    if (nextX < leftBoundary || nextX > rightBoundary) {
                        bin.floatDirection *= -1;
                        bin.floatDuration = 0;
                        bin.floatDurationTarget = 180 + Math.random() * 120; // New random 3-5 seconds
                    } else {
                        // Move normally
                        bin.floatOffset = nextOffset;
                    }

                    // Timed random direction changes (3-5 seconds each direction)
                    bin.floatDuration++;

                    // Change to random direction after duration expires
                    if (bin.floatDuration >= bin.floatDurationTarget) {
                        // Random direction: -1 (left) or 1 (right)
                        bin.floatDirection = Math.random() > 0.5 ? 1 : -1;
                        bin.floatDuration = 0;
                        bin.floatDurationTarget = 180 + Math.random() * 120; // New random 3-5 seconds
                    }

                } else {
                    // Water hasn't reached center yet - bin stays on ground, covered by water
                    bin.y = bin.baseY;
                    bin.floatOffset = 0;
                    bin.isFloating = false;
                    bin.floatDuration = 0;
                    bin.floatDirection = Math.random() > 0.5 ? 1 : -1; // Random initial direction
                }
            });

            // Update falling trash items (gravity animation for dropped trash)
            trashItems.forEach(trash => {
                if (trash.isFalling) {
                    // Apply gravity to velocity
                    trash.velocityY += trash.gravity;

                    // Update position
                    trash.y += trash.velocityY;

                    // Check if reached ground
                    if (trash.y >= trash.groundY) {
                        trash.y = trash.groundY; // Stop at ground level
                        trash.velocityY = 0;
                        trash.isFalling = false; // Stop falling
                    }
                }
            });

            updateSewerStatus();
            checkInteractions();
        }

        function updateWaterLevel(deltaTime) {
            if (gameState.phase !== 'raining') return;

            const blockedSewers = sewers.filter(s => s.blocked).length;
            const clearSewers = SEWER_COUNT - blockedSewers;

            // Realistic water logic:
            // - Water only rises when sewers are BLOCKED (can't drain)
            // - Water drains when sewers are CLEAR
            // - If all sewers clear: water drains fast, no rising
            // - If all sewers blocked: water rises fast (realistic flooding!)

            let netChange = 0;

            if (blockedSewers > 0) {
                // Water rises proportional to number of blocked sewers
                const waterInflow = WATER_RISE_RATE * (blockedSewers / SEWER_COUNT) * deltaTime;
                netChange += waterInflow;
            }

            if (clearSewers > 0) {
                // Water drains proportional to number of clear sewers
                const waterDrain = clearSewers * WATER_DRAIN_RATE * deltaTime;
                netChange -= waterDrain;
            }

            gameState.waterLevel += netChange;
            gameState.waterLevel = Math.max(0, Math.min(100, gameState.waterLevel));
        }

        function updateSewerStatus() {
            let clearedCount = 0;

            sewers.forEach(sewer => {
                sewer.trashCount = trashItems.filter(t => t.onSewer === sewers.indexOf(sewer)).length;
                sewer.blocked = sewer.trashCount > 0;
                if (!sewer.blocked) clearedCount++;
            });

            gameState.sewersCleared = clearedCount;
        }

        function checkInteractions() {
            // Player 1 interactions
            if (!player1.carrying) {
                trashItems.forEach(trash => {
                    if (isColliding(player1, trash)) {
                        trash.canPickup = true;
                        trash.pickupBy = 1;
                    } else if (trash.pickupBy === 1) {
                        trash.canPickup = false;
                        trash.pickupBy = null;
                    }
                });
            }

            if (player1.carrying) {
                bins.forEach(bin => {
                    if (isColliding(player1, bin)) {
                        bin.canDrop = true;
                        bin.dropBy = 1;
                    } else if (bin.dropBy === 1) {
                        bin.canDrop = false;
                        bin.dropBy = null;
                    }
                });
            }

            // Player 2 interactions (multiplayer only)
            if (gameMode === 'multiplayer') {
                if (!player2.carrying) {
                    trashItems.forEach(trash => {
                        if (isColliding(player2, trash) && trash.pickupBy !== 1) {
                            trash.canPickup = true;
                            trash.pickupBy = 2;
                        } else if (trash.pickupBy === 2) {
                            trash.canPickup = false;
                            trash.pickupBy = null;
                        }
                    });
                }

                if (player2.carrying) {
                    bins.forEach(bin => {
                        if (isColliding(player2, bin) && bin.dropBy !== 1) {
                            bin.canDrop = true;
                            bin.dropBy = 2;
                        } else if (bin.dropBy === 2) {
                            bin.canDrop = false;
                            bin.dropBy = null;
                        }
                    });
                }
            }
        }

        function pickupOrDrop(playerNum) {
            if (!gameState.gameActive) return;

            const player = playerNum === 1 ? player1 : player2;

            // Skip if player is already in bow animation
            if (player.bowTimer > 0) return;

            if (!player.carrying) {
                // Try to pick up trash from sewer
                for (let i = 0; i < trashItems.length; i++) {
                    const trash = trashItems[i];
                    if (isColliding(player, trash)) {
                        // Trigger bow animation
                        player.movementState = 'bow';
                        player.bowTimer = player.bowDuration;

                        // Pick up trash after brief delay
                        setTimeout(() => {
                            if (trashItems.includes(trash)) {
                                player.carrying = trash;
                                trashItems.splice(trashItems.indexOf(trash), 1);
                            }
                        }, 250); // 250ms delay for bow animation
                        return;
                    }
                }
            } else {
                // Check if near a bin first
                let nearBin = false;
                for (let bin of bins) {
                    // Calculate actual bin X position (baseX + floatOffset for floating bins)
                    const actualBinX = bin.baseX + bin.floatOffset;

                    // Use more generous collision detection for floating bins
                    // Expand the collision box horizontally and vertically for easier targeting
                    const expandedBin = {
                        x: actualBinX - 20, // 20px extra on left
                        y: bin.y - 30, // 30px extra on top (easier to drop from above)
                        width: bin.width + 40, // 40px total horizontal expansion
                        height: bin.height + 50 // 50px total vertical expansion (easier when jumping)
                    };

                    if (isColliding(player, expandedBin)) {
                        nearBin = true;

                        // Open the bin first
                        bin.isOpen = true;
                        bin.openTimer = 45; // Keep open for 30 frames (0.5 seconds)

                        // Trigger bow animation
                        player.movementState = 'bow';
                        player.bowTimer = player.bowDuration;

                        // Drop trash in bin after brief delay
                        setTimeout(() => {
                            if (player.carrying) {
                                player.carrying = null;
                                if (playerNum === 1) gameState.p1Trash++;
                                else gameState.p2Trash++;

                                // Play catch sound effect
                                catchSound.currentTime = 0;
                                catchSound.play().catch(err => console.log('Catch sound error:', err));
                            }
                        }, 250); // 250ms delay for bow animation
                        return;
                    }
                }

                // If not near bin, drop trash on road (penalty)
                if (!nearBin) {
                    // Trigger bow animation
                    player.movementState = 'bow';
                    player.bowTimer = player.bowDuration;

                    // Drop trash on road after brief delay
                    setTimeout(() => {
                        if (player.carrying) {
                            // Drop trash at player's current position with falling animation
                            const groundY = 530; // Ground level where trash should land

                            trashItems.push({
                                x: player.x,
                                y: player.y, // Start at player's current Y position (could be mid-air)
                                width: player.carrying.width,
                                height: player.carrying.height,
                                type: player.carrying.type,
                                onSewer: -1,
                                canPickup: false,
                                // Gravity physics for falling animation
                                isFalling: player.y < groundY, // Only fall if above ground
                                velocityY: 0, // Start with no downward velocity
                                gravity: 0.008, // Very slow gravity for visible falling animation
                                groundY: groundY // Store where to stop falling
                            });
                            player.carrying = null;
                            gameState.trashOnRoad++;
                        }
                    }, 250); // 250ms delay for bow animation
                }
            }
        }

        function isColliding(obj1, obj2) {
            return obj1.x < obj2.x + obj2.width &&
                   obj1.x + obj1.width > obj2.x &&
                   obj1.y < obj2.y + obj2.height &&
                   obj1.y + obj1.height > obj2.y;
        }

        function updateUI() {
            countdownValue.textContent = Math.ceil(gameState.preRainTimeLeft) + 's';
            rainTimeValue.textContent = Math.ceil(gameState.rainTimeLeft) + 's';
            waterLevelValue.textContent = Math.floor(gameState.waterLevel) + '%';
            sewersClear.textContent = gameState.sewersCleared;
            p1TrashUI.textContent = gameState.p1Trash;
            if (gameMode === 'multiplayer') {
                p2TrashUI.textContent = gameState.p2Trash;
            }
            // Landscape overlay sync
            document.getElementById('gameplay2Trash').textContent    = gameState.p1Trash;
            document.getElementById('gameplay2Rain').textContent     = Math.ceil(gameState.rainTimeLeft);
            document.getElementById('gameplay2WaterVal').textContent = Math.round(gameState.waterLevel);
            document.getElementById('gameplay2TrashP2').textContent  = gameState.p2Trash;
        }

        function endGame() {
            gameState.gameActive = false;
            gameState.gameOver = true;

            rainSound.pause();
            rainSound.currentTime = 0;

            const totalTrashCleared = gameState.p1Trash + gameState.p2Trash;
            const trashPenalty = gameState.trashOnRoad * 2; // 2 points penalty per trash on road
            const victory = gameState.waterLevel < MAX_WATER_LEVEL && gameState.sewersCleared === SEWER_COUNT;

            if (gameMode === 'single') {
                if (victory) {
                    endTitle.textContent = '🎉 MISSION SUCCESS! 🎉';
                    endTitle.style.color = '#2ecc71';
                    successSound.currentTime = 0;
                    successSound.play().catch(err => console.log('Success sound error:', err));

                    const finalScore = gameState.p1Trash - trashPenalty;
                    let statsHTML = `
                        <p><strong>🗑️ Trash Cleared:</strong> ${gameState.p1Trash} pieces</p>`;

                    if (gameState.trashOnRoad > 0) {
                        statsHTML += `
                        <p><strong>⚠️ Trash Left on Road:</strong> ${gameState.trashOnRoad} pieces (-${trashPenalty} points)</p>
                        <p><strong>📊 Final Score:</strong> ${finalScore} points</p>`;
                    }

                    statsHTML += `
                        <p><strong>🕳️ Sewers Cleared:</strong> ${gameState.sewersCleared} / 3</p>
                        <p><strong>💧 Final Water Level:</strong> ${Math.floor(gameState.waterLevel)}%</p>
                    `;

                    endStats.innerHTML = statsHTML;

                    endFact.innerHTML = `
                        <img src="assets/sew.jpg" alt="Hanoi Flood Prevention" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                        <strong>🌍 HANOI SAVED!</strong><br>
• 80% of Hanoi's flooding is caused by blocked sewers<br>
• One blocked drain can flood multiple city blocks<br>
• Clear sewers reduce flood incidents by 40%<br>
<em style="color: #2ecc71;">You prevented disaster! 🎉</em>`;

                    // Show Next Level button on victory
                    nextLevelBtn.style.display = 'inline-block';
                } else {
                    endTitle.textContent = '💔 MISSION FAILED!';
                    endTitle.style.color = '#e74c3c';

                    endStats.innerHTML = `
                        <p><strong>🗑️ Trash Cleared:</strong> ${gameState.p1Trash} pieces</p>
                        <p><strong>🕳️ Sewers Cleared:</strong> ${gameState.sewersCleared} / 3</p>
                        <p><strong>💧 Final Water Level:</strong> ${Math.floor(gameState.waterLevel)}%</p>
                    `;

                    if (gameState.waterLevel >= MAX_WATER_LEVEL) {
                        endFact.innerHTML = `<strong>⚠️ FLOODED!</strong><br>
• Blocked sewers turn streets into rivers in 15 minutes<br>
• 80% of flooding is preventable with proper waste management<br>
<em style="color: #e74c3c;">Clear sewers faster next time!</em>`;
                    } else {
                        endFact.innerHTML = `<strong>⏰ TOO SLOW!</strong><br>
• Quick action is crucial during heavy rain<br>
• Prepare before the rain starts!<br>
<em style="color: #f39c12;">Try again and work faster!</em>`;
                    }
                }
            } else {
                // Multiplayer mode
                const p1FinalScore = gameState.p1Trash - trashPenalty;
                const p2FinalScore = gameState.p2Trash - trashPenalty;

                if (p1FinalScore > p2FinalScore) {
                    gameState.winner = 1;
                } else if (p2FinalScore > p1FinalScore) {
                    gameState.winner = 2;
                } else {
                    gameState.winner = 0;
                }

                if (victory && gameState.winner !== 0) {
                    endTitle.textContent = gameState.winner === 1 ? '🎉 PLAYER 1 WINS! 🎉' : '🎉 PLAYER 2 WINS! 🎉';
                    endTitle.style.color = gameState.winner === 1 ? '#3498db' : '#e91e63';
                    successSound.currentTime = 0;
                    successSound.play().catch(err => console.log('Success sound error:', err));

                    let multiStatsHTML = `
                        <p><strong>👦 Player 1:</strong> ${gameState.p1Trash} trash cleared</p>
                        <p><strong>👧 Player 2:</strong> ${gameState.p2Trash} trash cleared</p>`;

                    if (gameState.trashOnRoad > 0) {
                        multiStatsHTML += `
                        <p><strong>⚠️ Trash Left on Road:</strong> ${gameState.trashOnRoad} pieces (-${trashPenalty} penalty for both)</p>
                        <p><strong>📊 Final Scores:</strong> P1: ${p1FinalScore}, P2: ${p2FinalScore}</p>`;
                    }

                    multiStatsHTML += `
                        <p><strong>🕳️ Sewers Cleared:</strong> ${gameState.sewersCleared} / 3</p>
                        <p><strong>💧 Water Level:</strong> ${Math.floor(gameState.waterLevel)}%</p>
                    `;

                    endStats.innerHTML = multiStatsHTML;

                    endFact.innerHTML = `
                        <img src="assets/sew.jpg" alt="Hanoi Flood Prevention" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                        <strong>🏆 EXCELLENT TEAMWORK!</strong><br>
• ${totalTrashCleared} pieces removed from sewers - Hanoi saved!<br>
• Real Hanoi cleanups cleared 200+ tons in 2024<br>
<em style="color: #3498db;">🌍 Community action saves cities!</em>`;

                    // Show Next Level button on multiplayer victory
                    nextLevelBtn.style.display = 'inline-block';
                } else if (victory && gameState.winner === 0) {
                    endTitle.textContent = '🤝 TIE GAME - HANOI SAVED!';
                    endTitle.style.color = '#f39c12';

                    endStats.innerHTML = `
                        <p><strong>👦 Player 1:</strong> ${gameState.p1Trash} trash</p>
                        <p><strong>👧 Player 2:</strong> ${gameState.p2Trash} trash</p>
                        <p>Both players performed equally! Great teamwork!</p>
                    `;

                    endFact.innerHTML = `
                        <img src="assets/sew.jpg" alt="Hanoi Flood Prevention" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                        <strong>🤝 PERFECT TEAMWORK!</strong><br>
• ${totalTrashCleared} pieces cleared together - Hanoi saved!<br>
<em style="color: #2ecc71;">Together we build flood-proof cities! 💪</em>`;

                    // Show Next Level button on tie victory
                    nextLevelBtn.style.display = 'inline-block';
                } else {
                    endTitle.textContent = '💔 MISSION FAILED!';
                    endTitle.style.color = '#e74c3c';

                    endStats.innerHTML = `
                        <p><strong>👦 Player 1:</strong> ${gameState.p1Trash} trash</p>
                        <p><strong>👧 Player 2:</strong> ${gameState.p2Trash} trash</p>
                        <p><strong>💧 Water Level:</strong> ${Math.floor(gameState.waterLevel)}% - TOO HIGH!</p>
                    `;

                    endFact.innerHTML = `<strong>⚠️ FLOODED!</strong><br>
• Work faster to clear sewers before water rises<br>
• Coordinate better to save the city!<br>
<em style="color: #e74c3c;">Try again!</em>`;
                }
            }

            endScreen.style.display = 'block';
        }

        // Get character sprite based on player state
        function getCharacterSprite(player) {
            const prefix = player.isBoy ? 'boy' : 'girl';

            // If dead/lying, show lying animation
            if (player.movementState === 'lying' || player.isDead) {
                return assets[prefix + (player.direction === 'left' ? 'LeftLying' : 'RightLying')];
            }

            // If bowing, show bow animation
            if (player.movementState === 'bow') {
                return assets[prefix + (player.direction === 'left' ? 'LeftBow' : 'RightBow')];
            }

            // If front/idle, show front
            if (player.direction === 'front' || player.movementState === 'idle') {
                return assets[prefix + 'Front'];
            }

            // Otherwise show movement animation based on state
            const dir = player.direction === 'left' ? 'Left' : 'Right';

            // For walking and running, cycle between frame 1 and 2
            switch(player.movementState) {
                case 'walk':
                    return player.animationFrame === 0 ? assets[prefix + dir + 'Walk1'] : assets[prefix + dir + 'Walk2'];
                case 'run':
                    return player.animationFrame === 0 ? assets[prefix + dir + 'Run1'] : assets[prefix + dir + 'Run2'];
                default:
                    return assets[prefix + dir];
            }
        }

        function drawGame() {
            ctx.clearRect(0, 0, 800, 600);

            // Background
            if (assets.background.complete && assets.background.naturalWidth > 0) {
                ctx.drawImage(assets.background, 0, 0, 800, 600);
            } else {
                const gradient = ctx.createLinearGradient(0, 0, 0, 600);
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(0.6, '#708090');
                gradient.addColorStop(1, '#505050');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 800, 600);
            }

            // Clouds during rain
            if (gameState.phase === 'raining' && assets.cloud.complete && assets.cloud.naturalWidth > 0) {
                clouds.forEach(cloud => {
                    ctx.globalAlpha = 0.75;
                    ctx.drawImage(assets.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
                    ctx.globalAlpha = 1.0;
                });
            }

            // Lightning - Draw multiple bolts for better visibility
            if (lightningFlash && assets.lightning.complete && assets.lightning.naturalWidth > 0) {
                // Flash the entire screen briefly
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(0, 0, 800, 600);

                // Draw 2-3 lightning bolts at random positions
                const boltCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 bolts
                for (let i = 0; i < boltCount; i++) {
                    ctx.globalAlpha = 0.9;
                    const lightningX = Math.random() * 700;
                    ctx.drawImage(assets.lightning, lightningX, 0, 100, 220);
                }
                ctx.globalAlpha = 1.0;
            }

            // Rain drops
            if (gameState.phase === 'raining') {
                ctx.strokeStyle = 'rgba(174, 194, 224, 0.7)';
                ctx.lineWidth = 2;
                rainDrops.forEach(drop => {
                    ctx.beginPath();
                    ctx.moveTo(drop.x, drop.y);
                    ctx.lineTo(drop.x, drop.y + drop.length);
                    ctx.stroke();
                });
            }

            // Sewers (draw before water so they appear submerged)
            sewers.forEach(sewer => {
                // Draw sewer image
                if (assets.sewer.complete && assets.sewer.naturalWidth > 0) {
                    ctx.drawImage(assets.sewer, sewer.x - 27, sewer.y - 15, sewer.width, sewer.height);
                } else {
                    // Fallback: Draw sewer grate with bars
                    ctx.fillStyle = sewer.blocked ? '#2c3e50' : '#27ae60';
                    ctx.fillRect(sewer.x - 27, sewer.y - 15, sewer.width, sewer.height);

                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 6; i++) {
                        const barX = sewer.x - 27 + (i * 10);
                        ctx.beginPath();
                        ctx.moveTo(barX, sewer.y - 15);
                        ctx.lineTo(barX, sewer.y + 15);
                        ctx.stroke();
                    }
                }

                // Show checkmark if cleared
                if (!sewer.blocked) {
                    ctx.fillStyle = '#27ae60';
                    ctx.font = 'bold 22px Arial';
                    ctx.fillText('✓', sewer.x - 10, sewer.y - 25);
                }
            });

            // Bins (draw before water so they can be partially submerged)
            bins.forEach(bin => {
                // Apply floating offset to x position (use baseX for accurate positioning)
                const drawX = bin.baseX + bin.floatOffset;

                // Choose correct image based on bin type and state
                let binImage;
                if (bin.type === 'trashCar') {
                    binImage = assets.trashCar;
                } else {
                    // Regular bin - show open or closed
                    binImage = bin.isOpen ? assets.binOpen : assets.bin;
                }

                // FIX v2.0: Check naturalWidth to avoid broken images
                if (binImage && binImage.complete && binImage.naturalWidth > 0) {
                    ctx.drawImage(binImage, drawX, bin.y, bin.width, bin.height);
                } else {
                    // Fallback: Draw gray rectangle if image failed to load
                    ctx.fillStyle = '#7f8c8d';
                    ctx.fillRect(drawX, bin.y, bin.width, bin.height);
                }

                if (bin.canDrop) {
                    ctx.strokeStyle = '#2ecc71';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(drawX - 5, bin.y - 5, bin.width + 10, bin.height + 10);
                }
                bin.canDrop = false;
            });

            // Trash
            trashItems.forEach(trash => {
                const img = trash.type === 'bottle' ? assets.bottle : assets.plastic;
                if (img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, trash.x - 16, trash.y - 16, trash.width, trash.height);
                } else {
                    ctx.fillStyle = trash.type === 'bottle' ? '#3498db' : '#e67e22';
                    ctx.fillRect(trash.x - 16, trash.y - 16, trash.width, trash.height);
                }

                if (trash.canPickup) {
                    const highlightColor = trash.pickupBy === 1 ? '#3498db' : '#e91e63';
                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(trash.x - 19, trash.y - 19, trash.width + 6, trash.height + 6);
                }
            });

            // Player 1
            const p1Sprite = getCharacterSprite(player1);
            if (p1Sprite && p1Sprite.complete && p1Sprite.naturalWidth > 0) {
                // Draw sprite: x centered, y is feet position, sprite drawn upward (y - height)
                ctx.drawImage(p1Sprite, player1.x - (player1.width / 2), player1.y - player1.height, player1.width, player1.height);
            } else {
                ctx.fillStyle = player1.isBoy ? '#3498db' : '#e91e63';
                ctx.fillRect(player1.x - (player1.width / 2), player1.y - player1.height, player1.width, player1.height);
            }

            if (player1.carrying) {
                const carryImg = player1.carrying.type === 'bottle' ? assets.bottle : assets.plastic;
                if (carryImg.complete && carryImg.naturalWidth > 0) {
                    ctx.drawImage(carryImg, player1.x - 16, player1.y - player1.height - 10, 32, 32);
                }
            }

            // Player 2 (multiplayer only)
            if (gameMode === 'multiplayer') {
                const p2Sprite = getCharacterSprite(player2);
                if (p2Sprite && p2Sprite.complete && p2Sprite.naturalWidth > 0) {
                    // Draw sprite: x centered, y is feet position, sprite drawn upward (y - height)
                    ctx.drawImage(p2Sprite, player2.x - (player2.width / 2), player2.y - player2.height, player2.width, player2.height);
                } else {
                    ctx.fillStyle = '#e91e63';
                    ctx.fillRect(player2.x - (player2.width / 2), player2.y - player2.height, player2.width, player2.height);
                }

                if (player2.carrying) {
                    const carryImg = player2.carrying.type === 'bottle' ? assets.bottle : assets.plastic;
                    if (carryImg.complete && carryImg.naturalWidth > 0) {
                        ctx.drawImage(carryImg, player2.x - 16, player2.y - player2.height - 10, 32, 32);
                    }
                }
            }

            // Water level (draw LAST so it overlays everything for realistic flooding effect)
            if (gameState.waterLevel > 0) {
                const waterHeight = (gameState.waterLevel / 100) * 600;
                const waterY = 600 - waterHeight;

                const waterGradient = ctx.createLinearGradient(0, waterY, 0, 600);
                waterGradient.addColorStop(0, 'rgba(52, 152, 219, 0.5)');
                waterGradient.addColorStop(1, 'rgba(41, 128, 185, 0.7)');

                ctx.fillStyle = waterGradient;
                ctx.fillRect(0, waterY, 800, waterHeight);

                // Waves
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x < 800; x += 20) {
                    const waveY = waterY + Math.sin((x + Date.now() / 200) / 10) * 4;
                    if (x === 0) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }

            // Draw Stamina and Health UI
            // Player 1 - Top left
            drawPlayerUI(player1, 20, 20, 'Player 1');

            // Player 2 - Top right (multiplayer only)
            if (gameMode === 'multiplayer') {
                drawPlayerUI(player2, 580, 20, 'Player 2');
            }
        }

        function drawPlayerUI(player, x, y, label) {
            // Label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(label, x, y);

            // Stamina bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(x, y + 5, 200, 20);

            // Stamina bar (color changes based on level)
            let staminaColor;
            const staminaPercent = player.stamina / player.maxStamina;
            if (staminaPercent > 0.6) {
                staminaColor = '#2ecc71'; // Green
            } else if (staminaPercent > 0.3) {
                staminaColor = '#f39c12'; // Yellow
            } else {
                staminaColor = '#e74c3c'; // Red
            }

            ctx.fillStyle = staminaColor;
            ctx.fillRect(x, y + 5, 200 * staminaPercent, 20);

            // Stamina text
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`Stamina: ${Math.floor(player.stamina)}`, x + 5, y + 20);

            // Underwater timer (only show when deep underwater - 1.2x above head)
            const waterY = 600 - (gameState.waterLevel / 100) * 600;
            const playerHeadY = player.y - (player.height * 0.85); // Match the head calculation in updatePlayer
            const headHeight = player.height * 0.85;
            const bufferDistance = headHeight * 0.2; // 20% buffer
            const drowningThresholdY = playerHeadY - bufferDistance;
            const isDeepUnderwater = waterY < drowningThresholdY;

            if (isDeepUnderwater && player.underwaterTimer > 0) {
                // Drowning warning bar
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(x, y + 30, 200, 20);

                // Time remaining until drowning (uses deltaTime, so timer is in seconds)
                const drownPercent = Math.min(1, player.underwaterTimer / player.drownThreshold);
                ctx.fillStyle = drownPercent > 0.66 ? '#e74c3c' : '#f39c12'; // Red when close to drowning
                ctx.fillRect(x, y + 30, 200 * drownPercent, 20);

                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                const timeLeft = Math.max(0, (player.drownThreshold - player.underwaterTimer).toFixed(1));
                ctx.fillText(`UNDERWATER! ${timeLeft}s`, x + 5, y + 45);
            }

            // Death message
            if (player.isDead) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.font = 'bold 16px Arial';
                ctx.fillText('DROWNED!', x, y + 65);
            }
        }

        function gameLoop() {
            // Calculate delta time (time since last frame)
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
            lastFrameTime = currentTime;

            try {
                if (gameState.gameActive) {
                    handleInput();
                    updateGame(deltaTime); // Pass delta time for frame-independent updates
                    updateUI();
                }
                drawGame();
                renderSplitScreen();
            } catch (error) {
                console.error('Game loop error:', error);
            }

            requestAnimationFrame(gameLoop);
        }

        // Event Listeners
        // Character selection (for single player mode only)
        selectBoy.addEventListener('click', () => {
            console.log('Boy character selected');
            selectedCharacter = 'boy';
            player1.isBoy = true;
            characterScreen.style.display = 'none';
            initGame();
        });

        selectGirl.addEventListener('click', () => {
            console.log('Girl character selected');
            selectedCharacter = 'girl';
            player1.isBoy = false;
            characterScreen.style.display = 'none';
            initGame();
        });

        backToLevel1.addEventListener('click', () => {
            window.location.href = '../level1/Level1.html?mode=' + gameMode;
        });

        // Show appropriate screen on load
        window.addEventListener('load', () => {
            // Initialize multiplayer player characters
            if (gameMode === 'multiplayer') {
                // Multiplayer: Boy is P1, Girl is P2
                player1.isBoy = true;
                player2.isBoy = false;
            }
            // Note: Loading screen will handle showing the start screen once assets are loaded
        });

        startBtn.addEventListener('click', () => {
            console.log('Start button clicked, gameMode:', gameMode);
            if (gameMode === 'single') {
                // Show character selection for single player
                startScreen.style.display = 'none';
                characterScreen.style.display = 'flex';
                console.log('Showing character selection screen');
            } else {
                // Start game directly for multiplayer
                console.log('Starting multiplayer game directly');
                initGame();
            }
        });
        retryBtn.addEventListener('click', () => {
            endScreen.style.display = 'none';
            if (gameMode === 'single') {
                characterScreen.style.display = 'flex';
            } else {
                startScreen.style.display = 'flex';
            }
        });
        backBtn.addEventListener('click', () => window.location.href = '../level1/Level1.html?mode=' + gameMode);

        const nextLevelBtn = document.getElementById('nextLevelBtn');
        nextLevelBtn.addEventListener('click', () => {
            window.location.href = '../level3/Level3.html?mode=' + gameMode;
        });

        const keys = {};
        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;

            // Spacebar for Player 1 - only trigger once per press
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (!spacePressed) {
                    spacePressed = true;
                    pickupOrDrop(1);
                }
            }
            // Enter for Player 2 (multiplayer only) - only trigger once per press
            if (e.key === 'Enter' && gameMode === 'multiplayer') {
                e.preventDefault();
                if (!enterPressed) {
                    enterPressed = true;
                    pickupOrDrop(2);
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;

            // Reset the key press flags when keys are released
            if (e.key === ' ' || e.key === 'Spacebar') {
                spacePressed = false;
            }
            if (e.key === 'Enter') {
                enterPressed = false;
            }
        });

        // Virtual joystick + split-screen mobile controls
        function VirtualJoystick(baseEl, knobEl, opts) {
            let active = false, touchId = null, cx = 0, cy = 0, R = 44;
            function getCenter() {
                const rect = baseEl.getBoundingClientRect();
                cx = rect.left + rect.width / 2;
                cy = rect.top + rect.height / 2;
                R = rect.width / 2;
            }
            function apply(dx, dy) {
                const dist = Math.sqrt(dx*dx + dy*dy);
                const cDist = Math.min(dist, R);
                const ang = Math.atan2(dy, dx);
                knobEl.style.transform = `translate(${Math.cos(ang)*cDist}px, ${Math.sin(ang)*cDist}px)`;
                const thr = R * (opts.deadzone || 0.30);
                const k = opts.keys;
                if (opts.axisX) { k[opts.leftKey] = dx < -thr; k[opts.rightKey] = dx > thr; }
                if (opts.axisY) { k[opts.upKey] = dy < -thr; if (!opts.noDown) k[opts.downKey] = dy > thr; }
                else if (opts.upOnly) { k[opts.upKey] = dy < -thr; }
            }
            function reset() {
                active = false; touchId = null;
                knobEl.style.transform = 'translate(0px, 0px)';
                const k = opts.keys;
                if (opts.axisX) { k[opts.leftKey] = false; k[opts.rightKey] = false; }
                if (opts.axisY) { k[opts.upKey] = false; if (!opts.noDown) k[opts.downKey] = false; }
                if (opts.upOnly) k[opts.upKey] = false;
            }
            baseEl.addEventListener('touchstart', (e) => {
                e.preventDefault(); if (active) return;
                touchId = e.changedTouches[0].identifier; active = true;
                getCenter(); apply(e.changedTouches[0].clientX - cx, e.changedTouches[0].clientY - cy);
            }, { passive: false });
            window.addEventListener('touchmove', (e) => {
                if (!active) return;
                for (const t of e.changedTouches) {
                    if (t.identifier === touchId) { e.preventDefault(); apply(t.clientX - cx, t.clientY - cy); break; }
                }
            }, { passive: false });
            const onEnd = (e) => { for (const t of e.changedTouches) { if (t.identifier === touchId) { reset(); break; } } };
            window.addEventListener('touchend', onEnd, { passive: false });
            window.addEventListener('touchcancel', onEnd, { passive: false });
        }

        const jsSP2 = new VirtualJoystick(document.getElementById('js2Single'), document.getElementById('jsKnob2Single'),
            { axisX: true, upOnly: true, leftKey: 'a', rightKey: 'd', upKey: 'w', keys });
        const js2P1 = new VirtualJoystick(document.getElementById('js2P1'), document.getElementById('jsKnob2P1'),
            { axisX: true, upOnly: true, leftKey: 'a', rightKey: 'd', upKey: 'w', keys });
        const js2P2 = new VirtualJoystick(document.getElementById('js2P2'), document.getElementById('jsKnob2P2'),
            { axisX: true, upOnly: true, leftKey: 'ArrowLeft', rightKey: 'ArrowRight', upKey: 'ArrowUp', keys });

        function wireActionBtn2(btnId, player) {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (player === 1 && !spacePressed) { spacePressed = true; pickupOrDrop(1); }
                else if (player === 2 && !enterPressed) { enterPressed = true; pickupOrDrop(2); }
            }, { passive: false });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (player === 1) spacePressed = false; else enterPressed = false;
            }, { passive: false });
            btn.addEventListener('mousedown', () => {
                if (player === 1 && !spacePressed) { spacePressed = true; pickupOrDrop(1); }
                else if (player === 2 && !enterPressed) { enterPressed = true; pickupOrDrop(2); }
            });
            btn.addEventListener('mouseup', () => { if (player === 1) spacePressed = false; else enterPressed = false; });
        }
        wireActionBtn2('act2Single', 1);
        wireActionBtn2('act2P1',     1);
        wireActionBtn2('act2P2',     2);

        function renderSplitScreen() {
            const displayCanvas = document.getElementById('displayCanvas');
            if (!displayCanvas) return;
            const isMobile = window.innerWidth <= 900;
            if (gameMode !== 'multiplayer' || !isMobile) {
                displayCanvas.style.display = 'none';
                return;
            }
            displayCanvas.style.display = 'block';
            const dw = displayCanvas.width  = window.innerWidth;
            const dh = displayCanvas.height = window.innerHeight;
            const dCtx = displayCanvas.getContext('2d');
            dCtx.clearRect(0, 0, dw, dh);
            const hw = dw / 2;
            const scale = Math.min(hw / canvas.height, dh / canvas.width);
            dCtx.save();
            dCtx.translate(hw / 2, dh / 2);
            dCtx.rotate(Math.PI / 2);
            dCtx.scale(scale, scale);
            dCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
            dCtx.restore();
            dCtx.fillStyle = 'rgba(255,255,255,0.25)';
            dCtx.fillRect(hw - 1, 0, 2, dh);
            dCtx.save();
            dCtx.translate(hw + hw / 2, dh / 2);
            dCtx.rotate(-Math.PI / 2);
            dCtx.scale(scale, scale);
            dCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
            dCtx.restore();
        }

        function updateMobileUI2() {
            const isLandscape = window.innerHeight < window.innerWidth && window.innerHeight < 600;
            const isMobile    = window.innerWidth <= 768 || isLandscape;

            const sp     = document.getElementById('controlZone2');
            const mp1    = document.getElementById('controlZoneP1_2');
            const mp2    = document.getElementById('controlZoneP2_2');
            const div    = document.getElementById('multiDivider2');
            const overlay = document.getElementById('gameplayUI2');
            const p2Info  = document.getElementById('gameplay2P2');

            [sp, mp1, mp2, div].forEach(el => { if (el) el.style.display = 'none'; });
            if (!isMobile) { if (overlay) overlay.style.display = 'none'; return; }

            if (gameMode === 'multiplayer') {
                if (mp1) mp1.style.display = 'flex';
                if (mp2) mp2.style.display = 'flex';
                if (div) div.style.display = isLandscape ? 'block' : 'none';
                if (p2Info) p2Info.style.display = 'block';
            } else {
                if (sp) sp.style.display = 'flex';
                if (p2Info) p2Info.style.display = 'none';
            }
            if (overlay) overlay.style.display = isLandscape ? 'flex' : 'none';
        }

        window.addEventListener('resize',            updateMobileUI2);
        window.addEventListener('orientationchange', updateMobileUI2);
        updateMobileUI2();

        function handleInput() {
            if (!gameState.gameActive) return;

            // Helper function to update player animation based on movement
            function updatePlayerAnimation(player, movingLeft, movingRight) {
                if (player.bowTimer > 0) {
                    // Currently bowing, don't change animation
                    return;
                }

                if (movingLeft || movingRight) {
                    // Reset idle timer when moving
                    player.idleTimer = 0;

                    // Determine direction
                    if (movingLeft && !movingRight) {
                        if (player.direction !== 'left') {
                            // Changing direction, show Left/Right static pose first
                            player.direction = 'left';
                            player.frameCounter = 0;
                            player.animationFrame = 0;
                        }
                    } else if (movingRight && !movingLeft) {
                        if (player.direction !== 'right') {
                            // Changing direction, show Left/Right static pose first
                            player.direction = 'right';
                            player.frameCounter = 0;
                            player.animationFrame = 0;
                        }
                    }

                    // Increment frame counter
                    player.frameCounter++;

                    // Determine if walking or running based on how long moving
                    if (player.frameCounter < player.walkRunTransitionFrame) {
                        player.movementState = 'walk';
                    } else {
                        player.movementState = 'run';
                    }

                    // Cycle animation frames (Walk1->Walk2->Walk1... or Run1->Run2->Run1...)
                    // Change frame every animationSpeed frames
                    if (player.frameCounter % player.animationSpeed === 0) {
                        player.animationFrame = player.animationFrame === 0 ? 1 : 0;
                    }

                } else {
                    // Not moving - increment idle timer
                    player.idleTimer++;

                    // After 3 seconds (assuming 60fps: 3 * 60 = 180 frames), return to front
                    if (player.idleTimer >= 180) {
                        player.direction = 'front';
                        player.movementState = 'idle';
                    } else {
                        // Show static Left/Right pose while idle < 3 seconds
                        player.movementState = 'idle';
                    }

                    player.frameCounter = 0;
                    player.animationFrame = 0;
                }
            }

            // Player 1 controls
            if (gameMode === 'single') {
                // In single player, can use A/D or arrows
                const p1Left = keys['a'] || keys['A'] || keys['ArrowLeft'];
                const p1Right = keys['d'] || keys['D'] || keys['ArrowRight'];
                const p1Jump = keys['w'] || keys['W'] || keys['ArrowUp'];

                if (p1Left && !player1.isDead) {
                    player1.x -= player1.speed;
                }
                if (p1Right && !player1.isDead) {
                    player1.x += player1.speed;
                }

                // Jump if on ground and not dead - ONLY jumping drains stamina
                if (p1Jump && !player1.isJumping && player1.y >= player1.baseY && !player1.isDead && player1.stamina >= 5) {
                    player1.velocityY = player1.jumpPower;
                    player1.isJumping = true;
                    player1.stamina = Math.max(0, player1.stamina - 5);
                }

                updatePlayerAnimation(player1, p1Left, p1Right);
            } else {
                // In multiplayer, Player 1 uses A/D and W only
                const p1Left = keys['a'] || keys['A'];
                const p1Right = keys['d'] || keys['D'];
                const p1Jump = keys['w'] || keys['W'];

                if (p1Left && !player1.isDead) {
                    player1.x -= player1.speed;
                }
                if (p1Right && !player1.isDead) {
                    player1.x += player1.speed;
                }

                // Jump if on ground and not dead - ONLY jumping drains stamina
                if (p1Jump && !player1.isJumping && player1.y >= player1.baseY && !player1.isDead && player1.stamina >= 5) {
                    player1.velocityY = player1.jumpPower;
                    player1.isJumping = true;
                    player1.stamina = Math.max(0, player1.stamina - 5);
                }

                updatePlayerAnimation(player1, p1Left, p1Right);

                // Player 2 uses arrows
                const p2Left = keys['ArrowLeft'];
                const p2Right = keys['ArrowRight'];
                const p2Jump = keys['ArrowUp'];

                if (p2Left && !player2.isDead) {
                    player2.x -= player2.speed;
                }
                if (p2Right && !player2.isDead) {
                    player2.x += player2.speed;
                }

                // Jump if on ground and not dead - ONLY jumping drains stamina
                if (p2Jump && !player2.isJumping && player2.y >= player2.baseY && !player2.isDead && player2.stamina >= 5) {
                    player2.velocityY = player2.jumpPower;
                    player2.isJumping = true;
                    player2.stamina = Math.max(0, player2.stamina - 5);
                }

                updatePlayerAnimation(player2, p2Left, p2Right);

                player2.x = Math.max(22, Math.min(778, player2.x));
            }

            player1.x = Math.max(22, Math.min(778, player1.x));
        }

        // Initialize UI and start continuous rendering
        initUI();

        // Start game loop immediately for continuous rendering
        // (game logic only runs when gameState.gameActive is true)
        requestAnimationFrame(gameLoop);
