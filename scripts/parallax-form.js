// Parallax 3D Form Interactive Effect
// Inspired by the Google Pixel 2 design with layered circles

// Canvas setup
let canvas;
let ctx;
let width;
let height;
let centerX;
let centerY;

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// Circles configuration
const circles = [];
const numLayers = 7; // Aumentado para más profundidad
const maxRadius = 180;
const colors = [
    'rgba(255, 255, 255, 0.9)',  // Blanco brillante
    'rgba(220, 220, 220, 0.9)',  // Blanco ligeramente más oscuro
    'rgba(240, 240, 240, 0.9)',  // Blanco con un toque gris
];

// Texture images
const textures = [];
let texturesLoaded = 0;
const textureImages = ['assets/valorant.png', 'assets/curry.png', 'assets/logo.jpg'];

// Initialize the canvas and setup the animation
function init() {
    canvas = document.getElementById('parallax-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'parallax-canvas';
        document.body.appendChild(canvas);
    }
    
    ctx = canvas.getContext('2d');
    
    // Set canvas to full window size
    resize();
    window.addEventListener('resize', resize);
    
    // Mouse move event for parallax effect
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - centerX) / (width / 2);
        mouseY = (e.clientY - centerY) / (height / 2);
        
        targetRotationX = mouseY * 0.3; // Mayor valor para aumentar el efecto
        targetRotationY = mouseX * 0.3; // Mayor valor para aumentar el efecto
    });
    
    // Touch events for mobile
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        mouseX = (touch.clientX - centerX) / (width / 2);
        mouseY = (touch.clientY - centerY) / (height / 2);
        
        targetRotationX = mouseY * 0.3; // Mayor valor para aumentar el efecto
        targetRotationY = mouseX * 0.3; // Mayor valor para aumentar el efecto
    });
    
    // Load texture images
    loadTextures();
    
    // Create the circle layers
    createCircles();
    
    // Start animation loop
    animate();
}

// Load texture images
function loadTextures() {
    textureImages.forEach(src => {
        const img = new Image();
        img.onload = () => {
            texturesLoaded++;
            if (texturesLoaded === textureImages.length) {
                // All textures loaded, create circular patterns
                createCircularPatterns();
            }
        };
        img.src = src;
        textures.push(img);
    });
}

// Create circular patterns with the textures
function createCircularPatterns() {
    // This will be used when all textures are loaded
    // We'll apply them to our circles
    circles.forEach((circle, index) => {
        if (index < textures.length) {
            circle.texture = textures[index];
        }
    });
}

// Create the circle layers for the 3D effect
function createCircles() {
    for (let i = 0; i < numLayers; i++) {
        const radius = maxRadius - (i * 30); // Mayor espaciado entre círculos
        const depth = i * 0.5; // Mayor valor de profundidad
        const color = colors[i % colors.length];
        
        circles.push({
            radius,
            depth,
            color,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() * 0.002) - 0.001,
            thickness: 10 + Math.random() * 15, // Más delgados para un aspecto más brillante
            glow: true // Añadimos una propiedad de brillo
        });
    }
}

// Handle window resize
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
    
    canvas.width = width;
    canvas.height = height;
}

// Draw a circle with optional texture and glow effect
function drawCircle(x, y, radius, thickness, color, rotation = 0, texture = null, glow = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Add glow effect
    if (glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'white';
        
        // Extra glow effect with multiple shadows
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = thickness - i*2;
            ctx.arc(0, 0, radius + i*3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Draw the circle outline
    ctx.shadowBlur = glow ? 20 : 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // If we have a texture, apply it as a clipped pattern
    if (texture) {
        ctx.shadowBlur = 0; // Disable shadow for texture
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();
        
        const pattern = ctx.createPattern(texture, 'repeat');
        ctx.fillStyle = pattern;
        ctx.globalAlpha = 0.4; // Reduced opacity to make it more subtle
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    }
    
    ctx.restore();
}

// Animation loop
function animate() {
    // Clear the canvas with a fade effect for smooth trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Smoothly update rotation values with higher responsiveness
    currentRotationX += (targetRotationX - currentRotationX) * 0.07;
    currentRotationY += (targetRotationY - currentRotationY) * 0.07;
    
    // Draw each circle with enhanced parallax offset based on depth
    circles.forEach((circle, i) => {
        // Update circle's own rotation
        circle.rotation += circle.rotationSpeed;
        
        // Calculate enhanced parallax offset with larger multiplier
        const depthFactor = (i + 1) * 50; // Increased from 30 to 50 for more dramatic separation
        const parallaxX = centerX + (currentRotationY * depthFactor);
        const parallaxY = centerY + (currentRotationX * depthFactor);
        
        // Draw the circle with glow effect
        drawCircle(
            parallaxX,
            parallaxY,
            circle.radius,
            circle.thickness,
            circle.color,
            circle.rotation,
            circle.texture,
            circle.glow
        );
    });
    
    // Text removed as requested
    
    requestAnimationFrame(animate);
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', init);
