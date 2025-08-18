// Audio Visualizer with Microphone Input
const canvas = document.getElementById('my-canvas');
const ctx = canvas.getContext('2d');

// Set canvas to full window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize canvas when window is resized
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Audio context setup
let audioContext;
let audioSource;
let analyser;
let dataArray;
const particles = [];
let hueOffset = 0;

// Particle class
class Particle {
    constructor(x, y, color, size, speed, life = 100) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.life = life;
        this.maxLife = life;
        this.angle = Math.random() * Math.PI * 2;
        this.speedX = Math.sin(this.angle) * this.speed;
        this.speedY = Math.cos(this.angle) * this.speed;
    }

    update(audioLevel = 0) {
        // Add some motion based on audio level
        const levelInfluence = audioLevel / 10;
        
        // Update position with audio influence
        this.speedX += (Math.random() - 0.5) * levelInfluence;
        this.speedY += (Math.random() - 0.5) * levelInfluence;
        
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Slow down over time
        this.speedX *= 0.98;
        this.speedY *= 0.98;
        
        // Decrease life
        this.life--;
        
        // Return particle to original position when it's close to death
        if (this.life < 20) {
            this.x = this.x * 0.9 + this.originalX * 0.1;
            this.y = this.y * 0.9 + this.originalY * 0.1;
        }
    }

    draw() {
        // Fade out as life decreases
        const alpha = (this.life / this.maxLife) * 0.8;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('ALPHA', alpha);
        ctx.fill();
    }
}

// Initialize audio analyzer and create particles based on audio data
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioSource = audioContext.createMediaStreamSource(stream);
            audioSource.connect(analyser);
            console.log("Microphone connected successfully");
            
            // Create initial particles
            createInitialParticles();
            
            // Start the animation
            animate();
        })
        .catch(err => {
            console.error('Error accessing microphone:', err);
            alert('Please allow microphone access to use the audio visualizer');
        });
}

// Create a pattern of particles in the shape from the image
function createInitialParticles() {
    // Clear any existing particles
    particles.length = 0;
    
    // Create particles in a circular pattern
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    
    // Outer ring
    createParticleRing(centerX, centerY, maxRadius, 200, 3);
    
    // Middle ring
    createParticleRing(centerX, centerY, maxRadius * 0.7, 150, 2.5);
    
    // Inner ring
    createParticleRing(centerX, centerY, maxRadius * 0.4, 100, 2);
    
    // Center cluster
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (maxRadius * 0.2);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const hue = Math.random() * 360;
        const size = 2 + Math.random() * 2;
        const color = `hsla(${hue}, 100%, 60%, ALPHA)`;
        const life = 200 + Math.random() * 200;
        const speed = 0.5 + Math.random();
        
        particles.push(new Particle(x, y, color, size, speed, life));
    }
    
    // Add some random particles throughout
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const hue = Math.random() * 360;
        const size = 1 + Math.random() * 2;
        const color = `hsla(${hue}, 100%, 60%, ALPHA)`;
        const life = 100 + Math.random() * 300;
        const speed = 0.3 + Math.random() * 0.7;
        
        particles.push(new Particle(x, y, color, size, speed, life));
    }
}

function createParticleRing(centerX, centerY, radius, count, size) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const variation = radius * 0.1 * (Math.random() - 0.5);
        const x = centerX + Math.cos(angle) * (radius + variation);
        const y = centerY + Math.sin(angle) * (radius + variation);
        const hue = (angle / (Math.PI * 2)) * 360 + Math.random() * 40;
        const color = `hsla(${hue}, 100%, 60%, ALPHA)`;
        const life = 100 + Math.random() * 300;
        const speed = 0.5 + Math.random() * 0.7;
        
        particles.push(new Particle(x, y, color, size, speed, life));
    }
}

// Animate function
function animate() {
    // Create a semi-transparent black layer for motion blur effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get audio data
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average audio level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const averageLevel = sum / dataArray.length;
    
    // Update hue offset based on audio level
    hueOffset += averageLevel / 100;
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(averageLevel);
        particles[i].draw();
        
        // Replace dead particles
        if (particles[i].life <= 0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.min(canvas.width, canvas.height) * 0.4;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const hue = (angle / (Math.PI * 2) * 360 + hueOffset) % 360;
            const size = 1 + Math.random() * 3;
            const color = `hsla(${hue}, 100%, 60%, ALPHA)`;
            const life = 100 + Math.random() * 200;
            const speed = 0.3 + (averageLevel / 256) * 2; // Speed based on audio level
            
            particles[i] = new Particle(x, y, color, size, speed, life);
        }
    }
    
    // Add new particles based on audio level
    if (averageLevel > 40) {
        const particlesToAdd = Math.floor(averageLevel / 20);
        for (let i = 0; i < particlesToAdd; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const hue = (Math.random() * 60 + hueOffset) % 360;
            const size = 1 + (averageLevel / 256) * 5;
            const color = `hsla(${hue}, 100%, 60%, ALPHA)`;
            const speed = 1 + (averageLevel / 256) * 3;
            
            particles.push(new Particle(x, y, color, size, speed, 50));
            
            // Limit number of particles for performance
            if (particles.length > 1000) {
                particles.shift();
            }
        }
    }
    
    requestAnimationFrame(animate);
}

// Initialize on click (browser requires user interaction to access mic)
document.addEventListener('click', () => {
    if (!audioContext) {
        initAudio();
    }
});

// Show instructions
ctx.fillStyle = 'white';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.fillText('Click anywhere to start the audio visualizer', canvas.width / 2, canvas.height / 2);
