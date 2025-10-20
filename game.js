// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 1000;
canvas.height = 600;

// Game State
let gameState = {
    isRunning: false,
    score: 0,
    goal: 150,
    timeLeft: 180,
    lives: 5,
    level: 1
};

// Player Object
const player = {
    x: canvas.width / 2,
    y: 80,
    width: 50,
    height: 40,
    speed: 2
};

// Hook Object
const hook = {
    x: player.x,
    y: player.y,
    angle: 0,
    length: 60,
    swingSpeed: 0.008,
    isLaunched: false,
    isRetracting: false,
    launchSpeed: 2,
    grabbedObject: null,
    tipX: 0,
    tipY: 0
};

// Arrays for game objects
let trashItems = [];
let fishItems = [];
let particles = [];

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    keys[e.code] = true;
    
    // Launch hook with Space
    if ((e.code === 'Space' || e.key === ' ') && !hook.isLaunched && gameState.isRunning) {
        e.preventDefault();
        launchHook();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
});

// Trash Item Class
class TrashItem {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'small', 'medium', 'large'
        this.width = type === 'small' ? 20 : type === 'medium' ? 30 : 40;
        this.height = type === 'small' ? 20 : type === 'medium' ? 30 : 40;
        this.value = type === 'small' ? 10 : type === 'medium' ? 20 : 30;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.floatSpeed = 0.02 + Math.random() * 0.02;
        this.isDangerous = false; // Will be checked against fish
    }

    update() {
        // Floating animation
        this.floatOffset += this.floatSpeed;
        this.y += Math.sin(this.floatOffset) * 0.5;
    }

    draw() {
        ctx.save();
        
        // Draw based on type
        if (this.type === 'small') {
            // Plastic bottle
            ctx.fillStyle = this.isDangerous ? '#ff4444' : '#4A90E2';
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(this.x - this.width/2 + 5, this.y - this.height/2 + 3, 5, this.height - 6);
        } else if (this.type === 'medium') {
            // Plastic bag
            ctx.fillStyle = this.isDangerous ? '#ff6666' : '#E8F4F8';
            ctx.strokeStyle = this.isDangerous ? '#cc0000' : '#4A90E2';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x - this.width/2, this.y - this.height/2);
            ctx.lineTo(this.x + this.width/2, this.y - this.height/2);
            ctx.lineTo(this.x + this.width/2 - 5, this.y + this.height/2);
            ctx.lineTo(this.x - this.width/2 + 5, this.y + this.height/2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            // Large debris (tire/can)
            ctx.fillStyle = this.isDangerous ? '#cc0000' : '#333';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width/3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Fish Class
class Fish {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 25;
        this.speed = 0.2 + Math.random() * 0.3;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.swimOffset = Math.random() * Math.PI * 2;
        this.color = this.getRandomFishColor();
    }

    getRandomFishColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speed * this.direction;
        this.swimOffset += 0.1;
        this.y += Math.sin(this.swimOffset) * 0.5;

        // Wrap around screen
        if (this.x > canvas.width + 50) {
            this.x = -50;
        } else if (this.x < -50) {
            this.x = canvas.width + 50;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }

        // Fish body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fish tail
        ctx.beginPath();
        ctx.moveTo(-this.width/2, 0);
        ctx.lineTo(-this.width/2 - 15, -10);
        ctx.lineTo(-this.width/2 - 15, 10);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.width/4, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.width/4, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Particle Class for effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.color = color;
        this.size = 3 + Math.random() * 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.vy += 0.1; // Gravity
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game objects
function initGame() {
    trashItems = [];
    fishItems = [];
    particles = [];
    
    // Spawn initial trash (5-8 items only)
    const trashCount = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < trashCount; i++) {
        spawnTrash();
    }
    
    // Spawn initial fish (3-5 fish only)
    const fishCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < fishCount; i++) {
        spawnFish();
    }
}

function spawnTrash() {
    const types = ['small', 'small', 'medium', 'medium', 'large']; // More small/medium items
    const type = types[Math.floor(Math.random() * types.length)];
    
    let x, y, tooClose;
    let attempts = 0;
    
    do {
        x = 50 + Math.random() * (canvas.width - 100);
        y = 150 + Math.random() * (canvas.height - 200);
        tooClose = false;
        
        // Check distance from other objects
        for (let trash of trashItems) {
            const dist = Math.hypot(trash.x - x, trash.y - y);
            if (dist < 60) {
                tooClose = true;
                break;
            }
        }
        
        for (let fish of fishItems) {
            const dist = Math.hypot(fish.x - x, fish.y - y);
            if (dist < 80) {
                tooClose = true;
                break;
            }
        }
        
        attempts++;
    } while (tooClose && attempts < 50);
    
    if (!tooClose) {
        trashItems.push(new TrashItem(x, y, type));
    }
}

function spawnFish() {
    let x, y, tooClose;
    let attempts = 0;
    
    do {
        x = Math.random() * canvas.width;
        y = 150 + Math.random() * (canvas.height - 200);
        tooClose = false;
        
        // Check distance from trash
        for (let trash of trashItems) {
            const dist = Math.hypot(trash.x - x, trash.y - y);
            if (dist < 80) {
                tooClose = true;
                break;
            }
        }
        
        // Check distance from other fish
        for (let fish of fishItems) {
            const dist = Math.hypot(fish.x - x, fish.y - y);
            if (dist < 60) {
                tooClose = true;
                break;
            }
        }
        
        attempts++;
    } while (tooClose && attempts < 50);
    
    if (!tooClose) {
        fishItems.push(new Fish(x, y));
    }
}

// Player movement
function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x = Math.max(player.width / 2, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x = Math.min(canvas.width - player.width / 2, player.x + player.speed);
    }
    
    // Update hook position when not launched
    if (!hook.isLaunched) {
        hook.x = player.x;
    }
}

// Hook mechanics
function updateHook() {
    if (!hook.isLaunched) {
        // Swing the hook
        hook.angle += hook.swingSpeed;
        if (hook.angle > Math.PI / 3 || hook.angle < -Math.PI / 3) {
            hook.swingSpeed *= -1;
        }
        
        // Calculate tip position
        hook.tipX = hook.x + Math.sin(hook.angle) * hook.length;
        hook.tipY = hook.y + Math.cos(hook.angle) * hook.length;
    } else {
        // Hook is launched
        if (!hook.isRetracting) {
            // Extend hook
            hook.tipX += Math.sin(hook.angle) * hook.launchSpeed;
            hook.tipY += Math.cos(hook.angle) * hook.launchSpeed;
            
            // Check if hit bottom or side walls
            if (hook.tipY >= canvas.height - 10 || hook.tipX <= 10 || hook.tipX >= canvas.width - 10) {
                hook.isRetracting = true;
            }
            
            // Check collision with trash
            if (!hook.grabbedObject) {
                for (let i = 0; i < trashItems.length; i++) {
                    const trash = trashItems[i];
                    const dist = Math.hypot(hook.tipX - trash.x, hook.tipY - trash.y);
                    if (dist < trash.width / 2 + 5) {
                        hook.grabbedObject = trash;
                        hook.isRetracting = true;
                        trashItems.splice(i, 1);
                        
                        // Create particles
                        for (let j = 0; j < 10; j++) {
                            particles.push(new Particle(trash.x, trash.y, '#4A90E2'));
                        }
                        break;
                    }
                }
            }
        }
        
        if (hook.isRetracting) {
            // Retract hook
            const dx = hook.x - hook.tipX;
            const dy = hook.y - hook.tipY;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 5) {
                hook.tipX += (dx / dist) * hook.launchSpeed;
                hook.tipY += (dy / dist) * hook.launchSpeed;
                
                // Update grabbed object position
                if (hook.grabbedObject) {
                    hook.grabbedObject.x = hook.tipX;
                    hook.grabbedObject.y = hook.tipY;
                }
            } else {
                // Hook returned
                if (hook.grabbedObject) {
                    // Add score
                    gameState.score += hook.grabbedObject.value;
                    updateScore();
                    
                    // Create success particles
                    for (let j = 0; j < 20; j++) {
                        particles.push(new Particle(hook.x, hook.y, '#FFD700'));
                    }
                    
                    // Spawn new trash
                    spawnTrash();
                }
                
                resetHook();
            }
        }
    }
}

function launchHook() {
    hook.isLaunched = true;
    hook.isRetracting = false;
    hook.grabbedObject = null;
}

function resetHook() {
    hook.isLaunched = false;
    hook.isRetracting = false;
    hook.grabbedObject = null;
    hook.angle = 0;
    hook.tipX = hook.x;
    hook.tipY = hook.y + hook.length;
}

// Check fish-trash collisions
function checkFishTrashCollisions() {
    for (let fish of fishItems) {
        for (let trash of trashItems) {
            const dist = Math.hypot(fish.x - trash.x, fish.y - trash.y);
            if (dist < (fish.width / 2 + trash.width / 2)) {
                if (!trash.isDangerous) {
                    trash.isDangerous = true;
                    gameState.score -= 50;
                    gameState.lives--;
                    updateScore();
                    updateLives();
                    
                    // Create warning particles
                    for (let j = 0; j < 15; j++) {
                        particles.push(new Particle(trash.x, trash.y, '#FF0000'));
                    }
                    
                    // Check game over
                    if (gameState.lives <= 0) {
                        endGame(false);
                    }
                }
            }
        }
    }
}

// Drawing functions
function drawOcean() {
    // Ocean is drawn as canvas background gradient
    // Add some wave effects
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const offset = (Date.now() / 1000 + i * 50) % canvas.width;
        for (let x = 0; x < canvas.width; x += 10) {
            const y = 100 + i * 50 + Math.sin((x + offset) / 30) * 10;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawPlayer() {
    ctx.save();
    
    // Draw boat
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(player.x - player.width / 2, player.y);
    ctx.lineTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width / 2 - 10, player.y + player.height);
    ctx.lineTo(player.x - player.width / 2 + 10, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw person
    ctx.fillStyle = '#FFE0BD';
    ctx.beginPath();
    ctx.arc(player.x, player.y - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(player.x - 8, player.y - 2, 16, 15);
    
    ctx.restore();
}

function drawHook() {
    ctx.save();
    
    // Draw line
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hook.x, hook.y);
    ctx.lineTo(hook.tipX, hook.tipY);
    ctx.stroke();
    
    // Draw hook
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(hook.tipX, hook.tipY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw claw
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hook.tipX, hook.tipY, 8, 0.5, Math.PI - 0.5);
    ctx.stroke();
    
    // Draw grabbed object
    if (hook.grabbedObject) {
        hook.grabbedObject.draw();
    }
    
    ctx.restore();
}

// Update UI
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function updateTimer() {
    document.getElementById('timer').textContent = gameState.timeLeft + 's';
}

function updateLives() {
    const hearts = '❤️'.repeat(Math.max(0, gameState.lives));
    const empty = '🖤'.repeat(Math.max(0, 5 - gameState.lives));
    document.getElementById('lives').textContent = hearts + empty;
}

// Game loop
let lastTime = 0;
let timerInterval;

function gameLoop(timestamp) {
    if (!gameState.isRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ocean background
    drawOcean();
    
    // Update
    updatePlayer();
    updateHook();
    
    // Update trash
    trashItems.forEach(trash => trash.update());
    
    // Update fish
    fishItems.forEach(fish => fish.update());
    
    // Check collisions
    checkFishTrashCollisions();
    
    // Update particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => p.update());
    
    // Draw
    trashItems.forEach(trash => trash.draw());
    fishItems.forEach(fish => fish.draw());
    particles.forEach(p => p.draw());
    drawPlayer();
    drawHook();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Timer
function startTimer() {
    timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(gameState.score >= gameState.goal);
        }
    }, 1000);
}

// Game control functions
function startGame() {
    document.getElementById('startModal').classList.remove('active');
    
    // Reset game state
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.timeLeft = 180;
    gameState.lives = 5;
    
    // Reset player
    player.x = canvas.width / 2;
    resetHook();
    
    // Initialize objects
    initGame();
    
    // Update UI
    updateScore();
    updateTimer();
    updateLives();
    
    // Start game loop and timer
    requestAnimationFrame(gameLoop);
    startTimer();
}

function endGame(won) {
    gameState.isRunning = false;
    clearInterval(timerInterval);
    
    if (won) {
        document.getElementById('winModal').classList.add('active');
    } else {
        document.getElementById('loseModal').classList.add('active');
    }
}

function restartLevel() {
    document.getElementById('loseModal').classList.remove('active');
    startGame();
}

function nextLevel() {
    alert('Congratulations! Level 2 coming soon...');
    document.getElementById('winModal').classList.remove('active');
    document.getElementById('startModal').classList.add('active');
}

// Initialize on load
window.addEventListener('load', () => {
    // Game is ready, waiting for user to click start
});
