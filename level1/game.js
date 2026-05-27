// Game Constants - CHALLENGE MODE
const LEVEL_TIME = 60; // 1 minute survival challenge
const MIN_SCORE_TO_PASS = 50; // Minimum score needed to pass (can't go below this)
const OCEAN_SURFACE = 200; // 20% of canvas height (600 * 0.2) - no objects above this line

// Load Assets
const assets = {
    boat1Left: new Image(),
    boat1Right: new Image(),
    boat2Left: new Image(),
    boat2Right: new Image(),
    bottle: new Image(),
    fish: new Image(),
    grabber: new Image(),
    plastic: new Image(),
    turtle: new Image(),
    crab: new Image(),
    shrimp: new Image(),
    background: new Image(),
    cycle: new Image()
};

// Load all images from assets folder
assets.boat1Left.src = 'assets/VN_Boat1_Left.png';
assets.boat1Right.src = 'assets/VN_Boat1_Right.png';
assets.boat2Left.src = 'assets/VN_Boat2_Left.png';
assets.boat2Right.src = 'assets/VN_Boat2_Right.png';
assets.bottle.src = 'assets/Bottle.png';
assets.fish.src = 'assets/Fish.png';
assets.grabber.src = 'assets/Grabber.png';
assets.plastic.src = 'assets/Plastic.png';
assets.turtle.src = 'assets/Turtle.png';
assets.crab.src = 'assets/Crab.png';
assets.shrimp.src = 'assets/Shrimp.png';
assets.background.src = 'assets/Island.png';
assets.cycle.src = 'assets/cycle.png';

// Load Background Music
const bgMusic = new Audio('SFX/Sea.mp3');
bgMusic.loop = true; // Loop forever
bgMusic.volume = 1.0; // Maximum volume (200% louder - browser max is 1.0)

// Load Catch Sound Effect
const catchSound = new Audio('SFX/Catch.mp3');
catchSound.volume = 1.0; // Maximum volume (200% louder)

// Load Success Sound Effect
const successSound = new Audio('SFX/Success.mp3');
successSound.volume = 1.0; // Maximum volume

let assetsLoaded = 0;
const totalAssets = Object.keys(assets).length;

// Track asset loading
Object.values(assets).forEach(img => {
    img.onload = () => {
        assetsLoaded++;
    };
});

// Game Mode
let gameMode = 'single'; // 'single' or 'multiplayer'

// Game State
let gameState = {
    p1Score: 0,
    p1Trash: 0,
    p2Score: 0,
    p2Trash: 0,
    timeLeft: LEVEL_TIME,
    fishProtected: 0,
    collisions: 0,
    gameActive: false,
    gameOver: false,
    winner: null
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const modeScreen = document.getElementById('modeScreen');
const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');
const singlePlayerBtn = document.getElementById('singlePlayerBtn');
const multiPlayerBtn = document.getElementById('multiPlayerBtn');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const retryBtn = document.getElementById('retryBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const modeDescription = document.getElementById('modeDescription');
const controlsInfo = document.getElementById('controlsInfo');
const missionInfo = document.getElementById('missionInfo');

// UI Elements
const p1Score = document.getElementById('p1Score');
const p2Score = document.getElementById('p2Score');
const p1Trash = document.getElementById('p1Trash');
const p2Trash = document.getElementById('p2Trash');
const timeValue = document.getElementById('timeValue');
const fishProtected = document.getElementById('fishProtected');
const collisionCount = document.getElementById('collisionCount');

// End Screen Elements
const endTitle = document.getElementById('endTitle');
const p1FinalScore = document.getElementById('p1FinalScore');
const p2FinalScore = document.getElementById('p2FinalScore');
const p1FinalTrash = document.getElementById('p1FinalTrash');
const p2FinalTrash = document.getElementById('p2FinalTrash');
const finalFish = document.getElementById('finalFish');
const performanceRating = document.getElementById('performanceRating');
const endFact = document.getElementById('endFact');

// Game Objects - Two Players
let boat1 = {
    x: canvas.width / 4,
    y: OCEAN_SURFACE - 10,
    width: 160,
    height: 80,
    speed: 3,
    canMove: true,
    color: '#3498db', // Blue for P1
    direction: 'left', // Current direction: 'left' or 'right'
    targetDirection: 'left', // Target direction for smooth transition
    flipProgress: 0, // 0 to 1, for smooth flip animation
    isFlipping: false
};

let boat2 = {
    x: (canvas.width / 4) * 3,
    y: OCEAN_SURFACE - 10,
    width: 160,
    height: 80,
    speed: 3,
    canMove: true,
    color: '#e74c3c', // Red for P2
    direction: 'left', // Current direction: 'left' or 'right'
    targetDirection: 'left', // Target direction for smooth transition
    flipProgress: 0, // 0 to 1, for smooth flip animation
    isFlipping: false
};

let grabber1 = {
    angle: 0,
    length: 60,
    maxLength: 400,
    extensionSpeed: 2.5,
    retractionSpeed: 2.5,
    swingSpeed: 0.01,
    state: 'swinging',
    carrying: null,
    tipX: 0,
    tipY: 0,
    player: 1
};

let grabber2 = {
    angle: 0,
    length: 60,
    maxLength: 400,
    extensionSpeed: 2.5,
    retractionSpeed: 2.5,
    swingSpeed: 0.01,
    state: 'swinging',
    carrying: null,
    tipX: 0,
    tipY: 0,
    player: 2
};

let trashItems = [];
let marineLife = [];
let effects = [];

// Trash Types - HIGHER POINTS, EASIER TO CATCH
const TRASH_TYPES = {
    BOTTLE: { points: 10, weight: 1, radius: 20, color: '#FF6B6B', name: 'Plastic Bottle', asset: 'bottle' },
    PLASTIC: { points: 15, weight: 0.5, radius: 22, color: '#4ECDC4', name: 'Plastic Bag', asset: 'plastic' }
};

// Marine Life Types - REDUCED PENALTIES
const MARINE_LIFE_TYPES = {
    FISH: { penalty: 30, radius: 25, color: '#1DD3B0', speed: 0.3, name: 'Fish', asset: 'fish' },
    TURTLE: { penalty: 50, radius: 30, color: '#AFFC41', speed: 0.2, name: 'Turtle', asset: 'turtle' },
    CRAB: { penalty: 25, radius: 20, color: '#FF6347', speed: 0.25, name: 'Crab', asset: 'crab' },
    SHRIMP: { penalty: 20, radius: 18, color: '#FFA07A', speed: 0.35, name: 'Shrimp', asset: 'shrimp' }
};

// Initialize Game
function initGame() {
    gameState = {
        p1Score: 0,
        p1Trash: 0,
        p2Score: 0,
        p2Trash: 0,
        timeLeft: LEVEL_TIME,
        fishProtected: 0,
        collisions: 0,
        gameActive: true,
        gameOver: false,
        winner: null
    };

    // Configure UI based on game mode
    const p1Label = document.getElementById('p1Label');
    const p2Panel = document.getElementById('p2Panel');
    const controlsDisplay = document.getElementById('controlsDisplay');
    const gameplayUI = document.getElementById('gameplayUI');
    const gameplayP2 = document.getElementById('gameplayP2');

    if (gameMode === 'single') {
        // Single player mode
        p1Label.textContent = 'YOUR SCORE';
        p2Panel.style.display = 'none';
        controlsDisplay.innerHTML = '<span class="key">A/D</span> or <span class="key">←/→</span> to move | <span class="key">SPACEBAR</span> to launch';
        gameplayP2.style.display = 'none';

        // Position boat in center for single player
        boat1.x = canvas.width / 2;
        boat2.x = -1000; // Move P2 off screen
    } else {
        // Multiplayer mode
        p1Label.textContent = 'PLAYER 1';
        p2Panel.style.display = 'block';
        controlsDisplay.innerHTML = '<span style="color: #3498db;">P1:</span> <span class="key">A/D</span> + <span class="key">SPACE</span> | <span style="color: #e74c3c;">P2:</span> <span class="key">←/→</span> + <span class="key">ENTER</span>';
        gameplayP2.style.display = 'block';

        // Position boats for multiplayer
        boat1.x = canvas.width / 4;
        boat2.x = (canvas.width / 4) * 3;
    }

    // Update mobile control visibility for current mode + orientation
    updateMobileUI1();

    // Reset Player 1
    boat1.y = OCEAN_SURFACE - 10;
    boat1.canMove = true;
    boat1.direction = 'left';
    boat1.targetDirection = 'left';
    boat1.flipProgress = 0;
    boat1.isFlipping = false;
    grabber1 = {
        angle: 0,
        length: 60,
        maxLength: 400,
        extensionSpeed: 2.5,
        retractionSpeed: 2.5,
        swingSpeed: 0.01,
        state: 'swinging',
        carrying: null,
        tipX: 0,
        tipY: 0,
        player: 1
    };

    // Reset Player 2
    boat2.y = OCEAN_SURFACE - 10;
    boat2.canMove = true;
    boat2.direction = 'left';
    boat2.targetDirection = 'left';
    boat2.flipProgress = 0;
    boat2.isFlipping = false;
    grabber2 = {
        angle: 0,
        length: 60,
        maxLength: 400,
        extensionSpeed: 2.5,
        retractionSpeed: 2.5,
        swingSpeed: 0.01,
        state: 'swinging',
        carrying: null,
        tipX: 0,
        tipY: 0,
        player: 2
    };

    trashItems = [];
    marineLife = [];
    effects = [];

    // Spawn 10-15 trash items
    const trashCount = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < trashCount; i++) {
        spawnTrash();
    }

    // Spawn 10-15 marine life
    const marineCount = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < marineCount; i++) {
        spawnMarineLife();
    }

    updateUI();
    startScreen.style.display = 'none';
    endScreen.style.display = 'none';

    // Show mobile gameplay UI in landscape mode
    const isLandscape = window.innerHeight < 600 && window.innerWidth > window.innerHeight;
    gameplayUI.style.display = isLandscape ? 'flex' : 'none';

    // Start background music
    bgMusic.play().catch(err => console.log('Audio autoplay prevented:', err));

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Spawn Trash
function spawnTrash() {
    const types = Object.keys(TRASH_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const trashConfig = TRASH_TYPES[type];

    let x, y;
    let validPosition = false;
    let attempts = 0;

    // Find valid position (not too close to other objects)
    // Spawn below ocean surface (OCEAN_SURFACE to canvas.height)
    while (!validPosition && attempts < 50) {
        x = Math.random() * (canvas.width - 100) + 50;
        y = Math.random() * (canvas.height - OCEAN_SURFACE - 100) + OCEAN_SURFACE + 50;

        validPosition = true;

        // Check distance from other trash
        for (let trash of trashItems) {
            const distance = Math.sqrt((trash.x - x)**2 + (trash.y - y)**2);
            if (distance < 80) { // Increased from 60
                validPosition = false;
                break;
            }
        }

        // Check distance from marine life
        for (let life of marineLife) {
            const distance = Math.sqrt((life.x - x)**2 + (life.y - y)**2);
            if (distance < 80) { // Increased from 60
                validPosition = false;
                break;
            }
        }

        attempts++;
    }

    if (validPosition) {
        trashItems.push({
            x: x,
            y: y,
            type: type,
            config: trashConfig,
            vx: (Math.random() - 0.5) * 0.3, // Reduced from 0.5
            vy: (Math.random() - 0.5) * 0.3  // Reduced from 0.5
        });
    }
}

// Spawn Marine Life
function spawnMarineLife() {
    const types = Object.keys(MARINE_LIFE_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const lifeConfig = MARINE_LIFE_TYPES[type];

    let x, y;
    let validPosition = false;
    let attempts = 0;

    // Spawn below ocean surface (OCEAN_SURFACE to canvas.height)
    while (!validPosition && attempts < 50) {
        x = Math.random() * (canvas.width - 100) + 50;
        y = Math.random() * (canvas.height - OCEAN_SURFACE - 100) + OCEAN_SURFACE + 50;

        validPosition = true;

        // Check distance from other marine life
        for (let life of marineLife) {
            const distance = Math.sqrt((life.x - x)**2 + (life.y - y)**2);
            if (distance < 100) { // Increased from 80
                validPosition = false;
                break;
            }
        }

        // Check distance from trash
        for (let trash of trashItems) {
            const distance = Math.sqrt((trash.x - x)**2 + (trash.y - y)**2);
            if (distance < 100) { // Increased from 80
                validPosition = false;
                break;
            }
        }

        attempts++;
    }

    if (validPosition) {
        marineLife.push({
            x: x,
            y: y,
            type: type,
            config: lifeConfig,
            vx: (Math.random() - 0.5) * lifeConfig.speed,
            vy: (Math.random() - 0.5) * lifeConfig.speed,
            isPolluted: false,
            pollutionTimer: 0
        });
    }
}

// Update Boat Animation
function updateBoatAnimation(boat) {
    if (boat.isFlipping) {
        // Smooth flip animation
        boat.flipProgress += 0.1; // Adjust speed of flip (0.1 = fast, 0.05 = slower)

        if (boat.flipProgress >= 1) {
            boat.flipProgress = 0;
            boat.isFlipping = false;
            boat.direction = boat.targetDirection;
        }
    }
}

// Update Game State
function updateGame() {
    if (!gameState.gameActive) return;

    // Update boat animations
    updateBoatAnimation(boat1);
    if (gameMode === 'multiplayer') {
        updateBoatAnimation(boat2);
    }

    // Update Player 1 grabber (always)
    updateGrabber(grabber1, boat1, 1);

    // Update Player 2 grabber (only in multiplayer)
    if (gameMode === 'multiplayer') {
        updateGrabber(grabber2, boat2, 2);
    }

    // Update trash items
    updateTrash();

    // Update marine life
    updateMarineLife();

    // Update effects
    updateEffects();

    // Check collisions between trash and marine life
    checkCollisions();

    // Update timer
    gameState.timeLeft -= 1/60; // Assuming 60 FPS

    // Check game over conditions
    if (gameState.timeLeft <= 0) {
        // Time's up - determine winner based on score
        if (gameMode === 'single') {
            gameState.winner = (gameState.p1Score >= MIN_SCORE_TO_PASS) ? 1 : null;
        } else {
            // Multiplayer: highest score wins (if both meet minimum)
            const p1Pass = gameState.p1Score >= MIN_SCORE_TO_PASS;
            const p2Pass = gameState.p2Score >= MIN_SCORE_TO_PASS;

            if (p1Pass && p2Pass) {
                gameState.winner = (gameState.p1Score >= gameState.p2Score) ? 1 : 2;
            } else if (p1Pass) {
                gameState.winner = 1;
            } else if (p2Pass) {
                gameState.winner = 2;
            } else {
                gameState.winner = null; // Both failed
            }
        }
        endGame();
    }

    // Check if player(s) fall below minimum score (instant fail)
    if (gameMode === 'single') {
        if (gameState.p1Score < 0) {
            gameState.winner = null;
            endGame();
        }
    } else {
        // In multiplayer, game continues even if one player goes negative
        // Both players can still recover
    }

    // Update UI
    updateUI();
}

// Update Grabber - Works for both players
function updateGrabber(grabber, boat, playerNum) {
    if (grabber.state === 'swinging') {
        // Swing the hook back and forth
        grabber.angle += grabber.swingSpeed;
        if (grabber.angle > Math.PI / 3 || grabber.angle < -Math.PI / 3) {
            grabber.swingSpeed *= -1;
        }

        // Calculate tip position for swinging
        grabber.tipX = boat.x + Math.sin(grabber.angle) * grabber.length;
        grabber.tipY = boat.y + Math.cos(grabber.angle) * grabber.length;

        // Boat can move
        boat.canMove = true;

    } else if (grabber.state === 'extending') {
        // Boat cannot move when hook is launched
        boat.canMove = false;

        // Extend hook in the direction it was launched
        grabber.tipX += Math.sin(grabber.angle) * grabber.extensionSpeed;
        grabber.tipY += Math.cos(grabber.angle) * grabber.extensionSpeed;

        // Calculate current length
        const dx = grabber.tipX - boat.x;
        const dy = grabber.tipY - boat.y;
        grabber.length = Math.sqrt(dx * dx + dy * dy);

        // Check collision with trash (improved accuracy)
        if (!grabber.carrying) {
            for (let i = 0; i < trashItems.length; i++) {
                const trash = trashItems[i];
                const dist = Math.sqrt(
                    (grabber.tipX - trash.x) * (grabber.tipX - trash.x) +
                    (grabber.tipY - trash.y) * (grabber.tipY - trash.y)
                );

                if (dist < trash.config.radius + 15) { // More forgiving collision
                    grabber.carrying = trash;
                    trashItems.splice(i, 1);
                    grabber.state = 'retracting';
                    const color = playerNum === 1 ? '#3498db' : '#e74c3c';
                    createEffect(trash.x, trash.y, '+' + trash.config.points, color);

                    // Play catch sound effect
                    catchSound.currentTime = 0; // Reset to start for rapid catches
                    catchSound.play().catch(err => console.log('Catch sound error:', err));

                    break;
                }
            }
        }

        // Check if hit bottom or max length
        if (grabber.tipY >= canvas.height - 20 || grabber.length >= grabber.maxLength) {
            grabber.state = 'retracting';
        }

    } else if (grabber.state === 'retracting') {
        // Boat still cannot move
        boat.canMove = false;

        // Retract hook back to boat
        const dx = boat.x - grabber.tipX;
        const dy = boat.y - grabber.tipY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            grabber.tipX += (dx / dist) * grabber.retractionSpeed;
            grabber.tipY += (dy / dist) * grabber.retractionSpeed;
            grabber.length = dist;

            // Update carried trash position
            if (grabber.carrying) {
                grabber.carrying.x = grabber.tipX;
                grabber.carrying.y = grabber.tipY;
            }
        } else {
            // Hook returned to boat
            if (grabber.carrying) {
                // Update appropriate player's score
                if (playerNum === 1) {
                    gameState.p1Score += grabber.carrying.config.points;
                    gameState.p1Trash++;
                } else {
                    gameState.p2Score += grabber.carrying.config.points;
                    gameState.p2Trash++;
                }
                const color = playerNum === 1 ? '#3498db' : '#e74c3c';
                createEffect(boat.x, boat.y, '+' + grabber.carrying.config.points, color);

                // Spawn new trash to replace collected one
                spawnTrash();
            }

            // Reset hook to swinging state
            grabber.state = 'swinging';
            grabber.carrying = null;
            grabber.length = 60;
            grabber.angle = 0;
            grabber.swingSpeed = 0.01;
            boat.canMove = true;
        }
    }
}

// Update Trash Items
function updateTrash() {
    for (let i = 0; i < trashItems.length; i++) {
        const trash = trashItems[i];

        // Move trash with slight drift
        trash.x += trash.vx;
        trash.y += trash.vy;

        // Bounce off walls
        if (trash.x < trash.config.radius || trash.x > canvas.width - trash.config.radius) {
            trash.vx *= -1;
        }
        // Keep trash below ocean surface and above bottom
        if (trash.y < OCEAN_SURFACE + trash.config.radius || trash.y > canvas.height - trash.config.radius) {
            trash.vy *= -1;
        }
    }
}

// Update Marine Life
function updateMarineLife() {
    for (let life of marineLife) {
        // Move marine life
        life.x += life.vx;
        life.y += life.vy;

        // Bounce off walls with some randomness
        if (life.x < life.config.radius || life.x > canvas.width - life.config.radius) {
            life.vx *= -1;
            life.vx += (Math.random() - 0.5) * 0.3; // Reduced from 0.5
        }
        // Keep marine life below ocean surface and above bottom
        if (life.y < OCEAN_SURFACE + life.config.radius || life.y > canvas.height - life.config.radius) {
            life.vy *= -1;
            life.vy += (Math.random() - 0.5) * 0.3; // Reduced from 0.5
        }

        // Limit speed
        const speed = Math.sqrt(life.vx**2 + life.vy**2);
        if (speed > life.config.speed) {
            life.vx = (life.vx / speed) * life.config.speed;
            life.vy = (life.vy / speed) * life.config.speed;
        }

        // Update pollution timer
        if (life.isPolluted) {
            life.pollutionTimer--;
            if (life.pollutionTimer <= 0) {
                life.isPolluted = false;
            }
        }
    }
}

// Check Collisions between Trash and Marine Life
function checkCollisions() {
    for (let i = 0; i < trashItems.length; i++) {
        const trash = trashItems[i];

        for (let j = 0; j < marineLife.length; j++) {
            const life = marineLife[j];

            const distance = Math.sqrt((trash.x - life.x)**2 + (trash.y - life.y)**2);

            if (distance < trash.config.radius + life.config.radius && !life.isPolluted) {
                // Collision detected - trash harms marine life (only once per pollution event)
                if (gameMode === 'single') {
                    gameState.p1Score -= life.config.penalty;
                } else {
                    gameState.p1Score -= life.config.penalty;
                    gameState.p2Score -= life.config.penalty;
                }
                gameState.collisions++;
                life.isPolluted = true;
                life.pollutionTimer = 180; // 3 seconds at 60 FPS

                // Create collision effect
                createEffect(life.x, life.y, '-'+life.config.penalty, '#e74c3c');
                createCollisionEffect(life.x, life.y);

                // Remove the trash (marine life "ate" it)
                trashItems.splice(i, 1);
                i--; // Adjust index after removal
                break;
            }
        }
    }

    // Update fish protected count (non-polluted fish)
    gameState.fishProtected = marineLife.filter(life => !life.isPolluted).length;
}

// Create Text Effect
function createEffect(x, y, text, color) {
    effects.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 60, // 1 second at 60 FPS
        vy: -1 // Float upward
    });
}

// Create Collision Effect
function createCollisionEffect(x, y) {
    effects.push({
        x: x,
        y: y,
        type: 'collision',
        life: 30, // 0.5 seconds
        size: 10,
        maxSize: 40
    });
}

// Update Effects
function updateEffects() {
    for (let i = 0; i < effects.length; i++) {
        const effect = effects[i];

        if (effect.type === 'collision') {
            effect.size += 1;
        } else {
            effect.y += effect.vy;
        }

        effect.life--;

        if (effect.life <= 0) {
            effects.splice(i, 1);
            i--;
        }
    }
}

// Update UI
function updateUI() {
    // Update desktop UI
    p1Score.textContent = gameState.p1Score;
    p2Score.textContent = gameState.p2Score;
    p1Trash.textContent = gameState.p1Trash;
    p2Trash.textContent = gameState.p2Trash;
    timeValue.textContent = Math.max(0, Math.ceil(gameState.timeLeft));
    fishProtected.textContent = gameState.fishProtected;
    collisionCount.textContent = gameState.collisions;

    // Update mobile overlay UI
    const gameplayP1Score = document.getElementById('gameplayP1Score');
    const gameplayP2Score = document.getElementById('gameplayP2Score');
    const gameplayTimeValue = document.getElementById('gameplayTimeValue');

    if (gameplayP1Score) gameplayP1Score.textContent = gameState.p1Score;
    if (gameplayP2Score) gameplayP2Score.textContent = gameState.p2Score;
    if (gameplayTimeValue) gameplayTimeValue.textContent = Math.max(0, Math.ceil(gameState.timeLeft));
}

// End Game
function endGame() {
    gameState.gameActive = false;
    gameState.gameOver = true;

    // Stop background music
    bgMusic.pause();
    bgMusic.currentTime = 0;

    // Calculate performance rating
    const efficiency = gameState.fishProtected / (gameState.fishProtected + gameState.collisions) || 0;
    let rating = 'C';
    if (efficiency >= 0.7) rating = 'A';
    else if (efficiency >= 0.5) rating = 'B';

    const cycleImageContainer = document.getElementById('cycleImageContainer');
    let didFail = false;

    // Update end screen based on game mode
    if (gameMode === 'single') {
        // Single player mode - Check if passed minimum score
        if (gameState.winner === 1) {
            endTitle.textContent = '🎉 MISSION COMPLETE! 🎉';
            endTitle.style.color = '#2ecc71';
            didFail = false;

            // Play success sound
            successSound.currentTime = 0;
            successSound.play().catch(err => console.log('Success sound error:', err));
        } else {
            if (gameState.p1Score < 0) {
                endTitle.textContent = '💔 MISSION FAILED - Too Many Collisions!';
            } else if (gameState.p1Score < MIN_SCORE_TO_PASS) {
                endTitle.textContent = '💔 MISSION FAILED - Score Too Low!';
            } else {
                endTitle.textContent = '💔 TIME\'S UP!';
            }
            endTitle.style.color = '#e74c3c';
            didFail = true;
        }
    } else {
        // Multiplayer mode - Determine winner based on score
        if (gameState.winner === 1) {
            endTitle.textContent = '🎉 PLAYER 1 WINS! 🎉';
            endTitle.style.color = '#3498db';

            // Play success sound for winner
            successSound.currentTime = 0;
            successSound.play().catch(err => console.log('Success sound error:', err));
        } else if (gameState.winner === 2) {
            endTitle.textContent = '🎉 PLAYER 2 WINS! 🎉';
            endTitle.style.color = '#e74c3c';

            // Play success sound for winner
            successSound.currentTime = 0;
            successSound.play().catch(err => console.log('Success sound error:', err));
        } else if (gameState.winner === 0) {
            endTitle.textContent = '🤝 TIE GAME! 🤝';
            endTitle.style.color = '#f39c12';
        } else {
            // Both failed
            endTitle.textContent = '💔 BOTH PLAYERS FAILED!';
            endTitle.style.color = '#e74c3c';
            didFail = true;
        }

        // Show cycle if both scores are low
        didFail = didFail || (gameState.p1Score < MIN_SCORE_TO_PASS && gameState.p2Score < MIN_SCORE_TO_PASS);
    }

    // Show different facts based on outcome
    if (didFail || gameState.collisions > 5) {
        // Show warning message with cycle diagram
        endFact.innerHTML = `
            <strong>⚠️ MARINE LIFE AT RISK:</strong><br>
            Vietnam is top 10 in ocean plastic pollution. Fish ingest microplastics,
            entering our food chain and threatening coastal communities.<br><br>
            <strong>🐟 THE CYCLE:</strong> 74,000 tons of plastic enter Vietnam's waters yearly,
            affecting 3,200+ marine species.<br>
            <em>Source: World Bank, 2024</em>
        `;
        cycleImageContainer.style.display = 'block';
    } else {
        // Show positive message without cycle
        endFact.innerHTML = `
            <strong>🌊 GREAT JOB!</strong><br>
            Vietnam aims to reduce ocean plastic 50% by 2025. Every piece removed helps!<br><br>
            <strong>💪 REAL IMPACT:</strong> 500,000+ kg collected from Vietnam's beaches in recent years.<br>
            <em>Small actions create big change! 🌍</em>
        `;
        cycleImageContainer.style.display = 'none';
    }

    p1FinalScore.textContent = gameState.p1Score;
    p2FinalScore.textContent = gameState.p2Score;
    p1FinalTrash.textContent = gameState.p1Trash;
    p2FinalTrash.textContent = gameState.p2Trash;
    finalFish.textContent = gameState.fishProtected;
    performanceRating.textContent = rating;

    // Show Next Level button only if player passed
    if (gameMode === 'single') {
        // Show button if single player passed the minimum score
        nextLevelBtn.style.display = (gameState.winner === 1) ? 'inline-block' : 'none';
    } else {
        // Show button if either player won in multiplayer
        nextLevelBtn.style.display = (gameState.winner === 1 || gameState.winner === 2) ? 'inline-block' : 'none';
    }

    // Hide mobile gameplay UI
    const gameplayUI = document.getElementById('gameplayUI');
    if (gameplayUI) gameplayUI.style.display = 'none';

    endScreen.style.display = 'block';
}

// Draw Game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (assets.background.complete && assets.background.naturalWidth > 0) {
        ctx.drawImage(assets.background, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback: Draw water background with gradient
        const waterGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        waterGradient.addColorStop(0, '#1e3c72');
        waterGradient.addColorStop(0.2, '#2a5298'); // Ocean surface at 20%
        waterGradient.addColorStop(1, '#1a3a52');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw water surface line at OCEAN_SURFACE
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, OCEAN_SURFACE);
        ctx.lineTo(canvas.width, OCEAN_SURFACE);
        ctx.stroke();
    }

    // Draw trash items
    for (let trash of trashItems) {
        drawTrash(trash);
    }

    // Draw marine life
    for (let life of marineLife) {
        drawMarineLife(life);
    }

    // Draw Player 1 (always)
    drawBoat(boat1, 1);
    drawGrabber(grabber1, boat1, '#3498db');

    // Draw Player 2 (only in multiplayer mode)
    if (gameMode === 'multiplayer') {
        drawBoat(boat2, 2);
        drawGrabber(grabber2, boat2, '#e74c3c');
    }

    // Draw effects
    for (let effect of effects) {
        drawEffect(effect);
    }

    // Draw carried items
    if (grabber1.carrying) {
        drawTrash(grabber1.carrying);
    }
    if (gameMode === 'multiplayer' && grabber2.carrying) {
        drawTrash(grabber2.carrying);
    }
}

// Draw Boat with Asset Image and Animation
function drawBoat(boat, playerNum) {
    ctx.save();

    // Select the correct boat image based on player and direction
    let boatImage;
    if (playerNum === 1) {
        boatImage = (boat.direction === 'left') ? assets.boat1Left : assets.boat1Right;
    } else {
        boatImage = (boat.direction === 'left') ? assets.boat2Left : assets.boat2Right;
    }

    // Apply flip animation if currently flipping
    if (boat.isFlipping) {
        ctx.translate(boat.x, boat.y);

        // Create squash effect during flip
        const scaleX = Math.cos(boat.flipProgress * Math.PI);
        ctx.scale(scaleX, 1);

        // Draw boat at origin (already translated)
        if (boatImage && boatImage.complete && boatImage.naturalWidth > 0) {
            ctx.drawImage(boatImage, -boat.width/2, -boat.height/2, boat.width, boat.height);
        } else {
            // Fallback
            ctx.fillStyle = (playerNum === 1) ? '#3498db' : '#e74c3c';
            ctx.fillRect(-30, 0, 60, 20);
            ctx.fillRect(-15, -15, 30, 15);
        }
    } else {
        // Normal drawing (no flip)
        if (boatImage && boatImage.complete && boatImage.naturalWidth > 0) {
            ctx.drawImage(boatImage, boat.x - boat.width/2, boat.y - boat.height/2, boat.width, boat.height);
        } else {
            // Fallback pixel art boat if image not loaded
            ctx.fillStyle = (playerNum === 1) ? '#3498db' : '#e74c3c';
            ctx.fillRect(boat.x - 30, boat.y, 60, 20);
            ctx.fillRect(boat.x - 15, boat.y - 15, 30, 15);

            ctx.fillStyle = '#34495e';
            ctx.fillRect(boat.x - 5, boat.y - 25, 10, 10);
        }
    }

    ctx.restore();
}

// Draw Grabber with Asset Image
function drawGrabber(grabber, boat, playerColor) {
    // Draw rope with player color
    ctx.strokeStyle = playerColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boat.x, boat.y + 5);
    ctx.lineTo(grabber.tipX, grabber.tipY);
    ctx.stroke();

    // Draw grabber hook using asset
    ctx.save();
    if (assets.grabber.complete && assets.grabber.naturalWidth > 0) {
        const grabberSize = 30;
        ctx.drawImage(assets.grabber, grabber.tipX - grabberSize/2, grabber.tipY - grabberSize/2, grabberSize, grabberSize);
    } else {
        // Fallback
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(grabber.tipX, grabber.tipY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = playerColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(grabber.tipX, grabber.tipY, 10, 0.5, Math.PI - 0.5);
        ctx.stroke();
    }
    ctx.restore();
}

// Draw Trash with Asset Images
function drawTrash(trash) {
    ctx.save();

    // Use asset images
    const asset = trash.config.asset;
    if (asset && assets[asset] && assets[asset].complete && assets[asset].naturalWidth > 0) {
        const size = trash.config.radius * 2;
        ctx.drawImage(assets[asset], trash.x - size/2, trash.y - size/2, size, size);
    } else {
        // Fallback to colored circles
        ctx.fillStyle = trash.config.color;
        ctx.beginPath();
        ctx.arc(trash.x, trash.y, trash.config.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

// Draw Marine Life with Asset Images
function drawMarineLife(life) {
    ctx.save();

    // Apply pollution effect if contaminated
    if (life.isPolluted) {
        ctx.globalAlpha = 0.5;
        ctx.filter = 'grayscale(70%)';
    }

    // Use asset images
    const asset = life.config.asset;
    if (asset && assets[asset] && assets[asset].complete && assets[asset].naturalWidth > 0) {
        const size = life.config.radius * 2;

        // Flip horizontally based on movement direction
        if (life.vx < 0) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(assets[asset], -life.x - size/2, life.y - size/2, size, size);
            ctx.restore();
        } else {
            ctx.drawImage(assets[asset], life.x - size/2, life.y - size/2, size, size);
        }
    } else {
        // Fallback to colored shapes
        ctx.fillStyle = life.isPolluted ? '#8B008B' : life.config.color;
        ctx.beginPath();
        ctx.arc(life.x, life.y, life.config.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

// Draw Effect
function drawEffect(effect) {
    if (effect.type === 'collision') {
        // Draw collision effect (expanding circle)
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Draw text effect
        ctx.fillStyle = effect.color;
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(effect.text, effect.x, effect.y);
    }
}

// Split-screen multiplayer renderer — draws the game canvas twice (rotated) onto a full-screen overlay
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
    // After rotating 90°: canvas.width maps to display height, canvas.height maps to display width
    const scale = Math.min(hw / canvas.height, dh / canvas.width);
    // P1 — left half, 90° CW
    dCtx.save();
    dCtx.translate(hw / 2, dh / 2);
    dCtx.rotate(Math.PI / 2);
    dCtx.scale(scale, scale);
    dCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    dCtx.restore();
    // Divider
    dCtx.fillStyle = 'rgba(255,255,255,0.25)';
    dCtx.fillRect(hw - 1, 0, 2, dh);
    // P2 — right half, -90° CCW
    dCtx.save();
    dCtx.translate(hw + hw / 2, dh / 2);
    dCtx.rotate(-Math.PI / 2);
    dCtx.scale(scale, scale);
    dCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    dCtx.restore();
}

// Game Loop
function gameLoop() {
    if (gameState.gameActive && !gameState.gameOver) {
        updateGame();
        drawGame();
        renderSplitScreen();
        requestAnimationFrame(gameLoop);
    }
}

// Event Listeners
// Mode Selection
singlePlayerBtn.addEventListener('click', function() {
    gameMode = 'single';
    showStartScreen();
});

multiPlayerBtn.addEventListener('click', function() {
    gameMode = 'multiplayer';
    showStartScreen();
});

backBtn.addEventListener('click', function() {
    startScreen.style.display = 'none';
    modeScreen.style.display = 'flex';
});

startBtn.addEventListener('click', initGame);

retryBtn.addEventListener('click', function() {
    startScreen.style.display = 'none';
    modeScreen.style.display = 'flex';
});

nextLevelBtn.addEventListener('click', function() {
    // Navigate to Level 2 with game mode parameter
    window.location.href = '../level2/Level2.html?mode=' + gameMode;
});

// Show Start Screen with Mode-Specific Info
function showStartScreen() {
    modeScreen.style.display = 'none';
    startScreen.style.display = 'flex';

    if (gameMode === 'single') {
        modeDescription.innerHTML = 'Welcome to <strong>SINGLE PLAYER MODE</strong>!';
        controlsInfo.innerHTML = `
            <div style="color: #3498db; margin: 10px 0;">
                <strong>🎮 CONTROLS:</strong> <span class="key">A</span> <span class="key">D</span> or <span class="key">←</span> <span class="key">→</span> Move | <span class="key">SPACE</span> Launch Grabber
            </div>
        `;
        missionInfo.innerHTML = `
            <strong>🎯 GOAL:</strong><br>
            ⏱️ Survive 60 seconds<br>
            ♻️ Collect trash (avoid fish!)<br>
            ⚠️ Keep score above 50 to pass
        `;
    } else {
        modeDescription.innerHTML = 'Welcome to <strong>MULTIPLAYER MODE</strong>!';
        controlsInfo.innerHTML = `
            <div style="color: #3498db; margin: 10px 0;"><strong>🎮 P1:</strong> <span class="key">A</span> <span class="key">D</span> Move | <span class="key">SPACE</span> Launch</div>
            <div style="color: #e74c3c; margin: 10px 0;"><strong>🎮 P2:</strong> <span class="key">←</span> <span class="key">→</span> Move | <span class="key">ENTER</span> Launch</div>
        `;
        missionInfo.innerHTML = `
            <strong>🎯 GOAL:</strong><br>
            ⏱️ Survive 60 seconds<br>
            ♻️ Collect most trash to win<br>
            ⚠️ Score 50+ to qualify
        `;
    }
}

// Keyboard Controls
const keys = {};

window.addEventListener('keydown', function(e) {
    keys[e.key] = true;

    // Player 1: Spacebar to launch grabber
    if (e.key === ' ' && gameState.gameActive && grabber1.state === 'swinging') {
        grabber1.state = 'extending';
        e.preventDefault();
    }

    // Player 2: Enter to launch grabber (only in multiplayer mode)
    if (gameMode === 'multiplayer' && e.key === 'Enter' && gameState.gameActive && grabber2.state === 'swinging') {
        grabber2.state = 'extending';
        e.preventDefault();
    }
});

window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

// ============================================================
// Virtual Joystick — shared class used by all 3 joystick instances
// ============================================================
function VirtualJoystick(baseEl, knobEl, opts) {
    let active = false, touchId = null, cx = 0, cy = 0, R = 44;

    function getCenter() {
        const rect = baseEl.getBoundingClientRect();
        cx = rect.left + rect.width  / 2;
        cy = rect.top  + rect.height / 2;
        R  = rect.width / 2;
    }

    function apply(dx, dy) {
        const dist  = Math.sqrt(dx * dx + dy * dy);
        const cDist = Math.min(dist, R);
        const ang   = Math.atan2(dy, dx);
        knobEl.style.transform = `translate(${Math.cos(ang) * cDist}px, ${Math.sin(ang) * cDist}px)`;

        const thr = R * (opts.deadzone || 0.30);
        const k = opts.keys;
        if (opts.axisX) {
            k[opts.leftKey]  = dx < -thr;
            k[opts.rightKey] = dx >  thr;
        }
        if (opts.axisY) {
            k[opts.upKey]   = dy < -thr;
            if (!opts.noDown) k[opts.downKey] = dy > thr;
        } else if (opts.upOnly) {
            k[opts.upKey] = dy < -thr;
        }
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
        e.preventDefault();
        if (active) return;
        touchId = e.changedTouches[0].identifier;
        active  = true;
        getCenter();
        apply(e.changedTouches[0].clientX - cx, e.changedTouches[0].clientY - cy);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!active) return;
        for (const t of e.changedTouches) {
            if (t.identifier === touchId) {
                e.preventDefault();
                apply(t.clientX - cx, t.clientY - cy);
                break;
            }
        }
    }, { passive: false });

    const onEnd = (e) => {
        for (const t of e.changedTouches) { if (t.identifier === touchId) { reset(); break; } }
    };
    window.addEventListener('touchend',    onEnd, { passive: false });
    window.addEventListener('touchcancel', onEnd, { passive: false });
}

// Joystick instances (Level 1: x-axis only — boats don't jump)
const jsSP  = new VirtualJoystick(
    document.getElementById('js1'), document.getElementById('jsKnob1'),
    { axisX: true, leftKey: 'a', rightKey: 'd', keys }
);
const jsMP1 = new VirtualJoystick(
    document.getElementById('js1P1'), document.getElementById('jsKnob1P1'),
    { axisX: true, leftKey: 'a', rightKey: 'd', keys }
);
const jsMP2 = new VirtualJoystick(
    document.getElementById('js1P2'), document.getElementById('jsKnob1P2'),
    { axisX: true, leftKey: 'ArrowLeft', rightKey: 'ArrowRight', keys }
);

// Action buttons (LAUNCH — one-shot, no repeat while extending)
function wireActionBtn1(btnId, player) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const launch = () => {
        if (!gameState || !gameState.gameActive) return;
        if (player === 1 && grabber1.state === 'swinging') grabber1.state = 'extending';
        if (player === 2 && grabber2.state === 'swinging') grabber2.state = 'extending';
    };
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); launch(); }, { passive: false });
    btn.addEventListener('mousedown', launch);
}
wireActionBtn1('act1',   1);
wireActionBtn1('act1P1', 1);
wireActionBtn1('act1P2', 2);

// Show/hide correct control zones based on game mode + orientation
function updateMobileUI1() {
    const landscape = window.innerHeight < 600 && window.innerWidth > window.innerHeight;
    const mobile    = window.innerWidth <= 768 || landscape;

    const sp  = document.getElementById('controlZone');
    const mp1 = document.getElementById('controlZoneP1');
    const mp2 = document.getElementById('controlZoneP2');
    const div = document.getElementById('multiDivider');
    const ov  = document.getElementById('gameplayUI');

    [sp, mp1, mp2, div].forEach(el => { if (el) el.style.display = 'none'; });

    if (!mobile) {
        if (ov) ov.style.display = 'none';
        return;
    }

    if (gameMode === 'multiplayer') {
        if (mp1) mp1.style.display = 'flex';
        if (mp2) mp2.style.display = 'flex';
        if (div) div.style.display = landscape ? 'block' : 'none';
    } else {
        if (sp) sp.style.display = 'flex';
    }

    if (ov) ov.style.display = landscape ? 'flex' : 'none';
}

window.addEventListener('resize',            updateMobileUI1);
window.addEventListener('orientationchange', updateMobileUI1);

// Handle continuous key presses for movement
function handleInput() {
    if (!gameState.gameActive) return;

    if (gameMode === 'single') {
        // Single Player: Can use A/D or Arrow Keys
        if (boat1.canMove) {
            const pressingLeft = keys['a'] || keys['A'] || keys['ArrowLeft'];
            const pressingRight = keys['d'] || keys['D'] || keys['ArrowRight'];

            if (pressingLeft && !pressingRight) {
                // Trigger flip animation if changing direction
                if (boat1.direction !== 'left' && !boat1.isFlipping) {
                    boat1.isFlipping = true;
                    boat1.targetDirection = 'left';
                    boat1.flipProgress = 0;
                }

                // Only move if facing left or flipping to left
                if (boat1.direction === 'left' || (boat1.isFlipping && boat1.targetDirection === 'left')) {
                    boat1.x -= boat1.speed;
                    if (boat1.x < boat1.width/2) boat1.x = boat1.width/2;
                }
            }

            if (pressingRight && !pressingLeft) {
                // Trigger flip animation if changing direction
                if (boat1.direction !== 'right' && !boat1.isFlipping) {
                    boat1.isFlipping = true;
                    boat1.targetDirection = 'right';
                    boat1.flipProgress = 0;
                }

                // Only move if facing right or flipping to right
                if (boat1.direction === 'right' || (boat1.isFlipping && boat1.targetDirection === 'right')) {
                    boat1.x += boat1.speed;
                    if (boat1.x > canvas.width - boat1.width/2) boat1.x = canvas.width - boat1.width/2;
                }
            }
        }
    } else {
        // Multiplayer: Separate controls
        // Player 1 Controls: A/D
        if (boat1.canMove) {
            const p1Left = keys['a'] || keys['A'];
            const p1Right = keys['d'] || keys['D'];

            if (p1Left && !p1Right) {
                // Trigger flip animation if changing direction
                if (boat1.direction !== 'left' && !boat1.isFlipping) {
                    boat1.isFlipping = true;
                    boat1.targetDirection = 'left';
                    boat1.flipProgress = 0;
                }

                // Only move if facing left or flipping to left
                if (boat1.direction === 'left' || (boat1.isFlipping && boat1.targetDirection === 'left')) {
                    boat1.x -= boat1.speed;
                    if (boat1.x < boat1.width/2) boat1.x = boat1.width/2;
                }
            }

            if (p1Right && !p1Left) {
                // Trigger flip animation if changing direction
                if (boat1.direction !== 'right' && !boat1.isFlipping) {
                    boat1.isFlipping = true;
                    boat1.targetDirection = 'right';
                    boat1.flipProgress = 0;
                }

                // Only move if facing right or flipping to right
                if (boat1.direction === 'right' || (boat1.isFlipping && boat1.targetDirection === 'right')) {
                    boat1.x += boat1.speed;
                    if (boat1.x > canvas.width - boat1.width/2) boat1.x = canvas.width - boat1.width/2;
                }
            }
        }

        // Player 2 Controls: Arrow Keys
        if (boat2.canMove) {
            const p2Left = keys['ArrowLeft'];
            const p2Right = keys['ArrowRight'];

            if (p2Left && !p2Right) {
                // Trigger flip animation if changing direction
                if (boat2.direction !== 'left' && !boat2.isFlipping) {
                    boat2.isFlipping = true;
                    boat2.targetDirection = 'left';
                    boat2.flipProgress = 0;
                }

                // Only move if facing left or flipping to left
                if (boat2.direction === 'left' || (boat2.isFlipping && boat2.targetDirection === 'left')) {
                    boat2.x -= boat2.speed;
                    if (boat2.x < boat2.width/2) boat2.x = boat2.width/2;
                }
            }

            if (p2Right && !p2Left) {
                // Trigger flip animation if changing direction
                if (boat2.direction !== 'right' && !boat2.isFlipping) {
                    boat2.isFlipping = true;
                    boat2.targetDirection = 'right';
                    boat2.flipProgress = 0;
                }

                // Only move if facing right or flipping to right
                if (boat2.direction === 'right' || (boat2.isFlipping && boat2.targetDirection === 'right')) {
                    boat2.x += boat2.speed;
                    if (boat2.x > canvas.width - boat2.width/2) boat2.x = canvas.width - boat2.width/2;
                }
            }
        }
    }
}

// Input handling in game loop
const originalGameLoop = gameLoop;
gameLoop = function() {
    if (gameState.gameActive && !gameState.gameOver) {
        handleInput();
        updateGame();
        drawGame();
        renderSplitScreen();
        requestAnimationFrame(gameLoop);
    }
};

// Handle canvas responsiveness
function resizeCanvas() {
    const wrapper = document.getElementById('canvasWrapper');
    const canvas = document.getElementById('gameCanvas');

    // Get the actual display size
    const rect = canvas.getBoundingClientRect();

    // Scale calculations for mouse/touch input (if needed for future features)
    window.canvasScaleX = canvas.width / rect.width;
    window.canvasScaleY = canvas.height / rect.height;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();

window.addEventListener('resize', () => {
    const ui = document.getElementById('gameplayUI');
    if (!ui) return;
    const landscape = window.innerHeight < 600 && window.innerWidth > window.innerHeight;
    if (landscape) {
        ui.style.display = 'flex';
    } else {
        ui.style.display = 'none';
    }
});

// Draw initial screen
drawGame();
