const canvas = document.getElementById('my-canvas');

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Crear partículas aleatorias en el canvas
const particles = [];

function createParticle() {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        radius: 3,
        color: 'rgba(71, 71, 84, 0.5)'
    });
}

function updateParticles(mouseX, mouseY) {
    // Dibujar un rectángulo semitransparente para el efecto de motion blur
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar el círculo negro del puntero
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    particles.forEach((particle, index) => {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) { // Si el mouse está cerca, repeler la partícula
            const angle = Math.atan2(dy, dx);
            particle.dx += Math.cos(angle);
            particle.dy += Math.sin(angle);
        }

        particle.x += particle.dx;
        particle.y += particle.dy;

        // Dibujar la partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Limitar la velocidad
        particle.dx *= 0.95;
        particle.dy *= 0.95;

        // Rebotar en los bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;

        // Eliminar partículas viejas
        if (particles.length > 200) particles.shift();
    });
}

canvas.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    updateParticles(mouseX, mouseY);
});

// Animar las partículas y generar nuevas continuamente
function animate() {
    createParticle();
    updateParticles(-100, -100); // Sin interacción inicial
    requestAnimationFrame(animate);
}
animate();

let strobe = false;

function toggleBackground() {
    strobe = !strobe;
    if (strobe) {
        document.body.style.backgroundColor = 'black';
    } else {
        document.body.style.backgroundColor = 'white';
    }
}

setInterval(toggleBackground, 50); // Reducir el intervalo a 50ms para un efecto más intenso