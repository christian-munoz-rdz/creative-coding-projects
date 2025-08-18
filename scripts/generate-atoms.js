// Definición del canvas
const canvas = document.getElementById('my-canvas');
const ctx = canvas.getContext('2d');

// Mouse position tracker
const mouse = {
    x: undefined,
    y: undefined,
    isMoving: false
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Atom {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 8 + 2;
        this.originalRadius = this.radius; // Store original radius
        this.speedX = Math.random() * 4 - 2; // -2 < speedX < 2
        this.speedY = Math.random() * 4 - 2; // -2 < speedY < 2
        this.magneticPullFactor = 0.05; // Strength of magnetic pull
        this.lifespan = Math.random() * 1000 + 500; // Random lifespan between 500-1500 frames
        this.age = 0; // Current age of the atom
    }

    update() {
        // Apply magnetic pull if mouse is moving
        if (mouse.isMoving && mouse.x !== undefined && mouse.y !== undefined) {
            // Calculate direction to mouse
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            
            // Calculate distance to mouse
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Add magnetic attraction (stronger when closer)
            if (distance > 0) {
                const attractionStrength = this.magneticPullFactor * (100 / Math.max(distance, 10));
                this.speedX += dx * attractionStrength;
                this.speedY += dy * attractionStrength;
            }
        }
        
        // Apply a bit of friction to prevent excessive speed
        this.speedX *= 0.98;
        this.speedY *= 0.98;
        
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebotar en los bordes
        if (this.x < 0 || this.x > canvas.width) {
            this.speedX *= -1;
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.speedY *= -1;
        }
    }

    updateSize() {
        // Increment age
        this.age++;
        
        // Only start reducing size after 70% of lifespan has passed
        if (this.age > this.lifespan * 0.7) {
            // Calculate how much of the remaining lifespan has passed (0 to 1)
            const remainingLifeRatio = (this.age - this.lifespan * 0.7) / (this.lifespan * 0.3);
            // Gradually reduce size based on remaining life
            this.radius = this.originalRadius * (1 - remainingLifeRatio * 0.9);
        }
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

let atoms = [];

// Create some initial atoms
function createInitialAtoms(count = 50) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        atoms.push(new Atom(x, y));
    }
}

window.addEventListener('resize', resizeCanvas);

// Initialize canvas size
resizeCanvas();
// Create initial atoms
createInitialAtoms();

// Track mouse movement
canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isMoving = true;
    
    // Set a timer to detect when mouse stops moving
    clearTimeout(mouse.timer);
    mouse.timer = setTimeout(() => {
        mouse.isMoving = false;
    }, 100); // Consider mouse stopped after 100ms of no movement
});

// Support for touch devices
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    mouse.isMoving = true;
    
    // Set a timer to detect when touch stops moving
    clearTimeout(mouse.timer);
    mouse.timer = setTimeout(() => {
        mouse.isMoving = false;
    }, 100);
});

canvas.addEventListener('click', (event) => {
    for (let i = 0; i < 20; i++) {
        const x = event.clientX + Math.random() * 20 - 10;
        const y = event.clientY + Math.random() * 20 - 10;
        atoms.push(new Atom(x, y));
    }
});

const animate = () => {
    // Clear the canvas before drawing the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw magnetic field indicator when mouse is moving
    if (mouse.isMoving && mouse.x !== undefined && mouse.y !== undefined) {
        const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 5, 
            mouse.x, mouse.y, 100
        );
        gradient.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
        ctx.fill();
    }

    atoms.forEach((atom, index) => {
        atom.draw();
        atom.update();
        atom.updateSize();
        if (atom.age > atom.lifespan) {
            atoms.splice(index, 1); // Remove atoms that have exceeded their lifespan
        }
    });
    requestAnimationFrame(animate);
};

animate();