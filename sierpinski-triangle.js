// Configuración del canvas
const canvas = document.getElementById('my-canvas');
const ctx = canvas.getContext('2d');

// Asegurar que el canvas ocupe toda la pantalla
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Variables para la animación
let time = 0;
let maxDepth = 8; // Profundidad máxima de recursión
let hueOffset = 0; // Para el cambio de colores
let zoomFactor = 1; // Factor de zoom inicial
let zoomSpeed = 0.005; // Velocidad del zoom

// Función para dibujar un triángulo
function drawTriangle(x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    
    // Borde con un color más oscuro
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
}

// Función recursiva para dibujar el triángulo de Sierpinski
function drawSierpinski(x1, y1, x2, y2, x3, y3, depth, hue, scale) {
    // Aplicar el efecto de escala desde el centro
    const centerX = (x1 + x2 + x3) / 3;
    const centerY = (y1 + y2 + y3) / 3;
    
    // Aplica escala a los puntos respecto al centro
    function scalePoint(x, y, scale) {
        return {
            x: centerX + (x - centerX) * scale,
            y: centerY + (y - centerY) * scale
        };
    }
    
    const p1 = scalePoint(x1, y1, scale);
    const p2 = scalePoint(x2, y2, scale);
    const p3 = scalePoint(x3, y3, scale);
    
    if (depth === 0) {
        // Calculamos un color HSL basado en la profundidad y el tiempo
        const color = `hsl(${(hue + hueOffset) % 360}, 80%, 50%)`;
        drawTriangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, color);
        return;
    }
    
    // Calculamos los puntos medios de los tres lados del triángulo
    const midX1 = (p1.x + p2.x) / 2;
    const midY1 = (p1.y + p2.y) / 2;
    
    const midX2 = (p2.x + p3.x) / 2;
    const midY2 = (p2.y + p3.y) / 2;
    
    const midX3 = (p3.x + p1.x) / 2;
    const midY3 = (p3.y + p1.y) / 2;
    
    // Añadir un pequeño efecto de "pulsación" basado en el tiempo
    const pulseEffect = 1 + Math.sin(time * 2) * 0.02;
    
    // Llamadas recursivas para los tres subtriángulos
    drawSierpinski(
        p1.x, p1.y, 
        midX1, midY1, 
        midX3, midY3, 
        depth - 1, 
        hue + 30,
        pulseEffect
    );
    
    drawSierpinski(
        midX1, midY1, 
        p2.x, p2.y, 
        midX2, midY2, 
        depth - 1, 
        hue + 60,
        pulseEffect
    );
    
    drawSierpinski(
        midX3, midY3, 
        midX2, midY2, 
        p3.x, p3.y, 
        depth - 1, 
        hue + 90,
        pulseEffect
    );
}

// Evento para hacer clic y cambiar los colores
canvas.addEventListener('click', () => {
    hueOffset = (hueOffset + 120) % 360; // Rota los colores
});

// Evento para cambiar la velocidad del zoom con el movimiento del ratón
canvas.addEventListener('mousemove', (e) => {
    const speedFactor = e.clientX / canvas.width; // Usar posición X para controlar velocidad
    zoomSpeed = 0.002 + speedFactor * 0.01;
    
    // Usar posición Y para controlar profundidad
    const depthFactor = e.clientY / canvas.height;
    maxDepth = Math.floor(5 + depthFactor * 5); // Entre 5 y 10
});

// Función de animación principal
function animate() {
    resizeCanvas();
    
    // Limpia el canvas con un efecto de desvanecimiento
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Actualiza el factor de zoom
    zoomFactor *= 1 + zoomSpeed;
    
    // Reinicia el zoom cuando alcanza cierto umbral para crear un loop infinito
    if (zoomFactor > 2.5) {
        zoomFactor = 1;
        // Cambia ligeramente los colores en cada ciclo
        hueOffset = (hueOffset + 20) % 360;
    }
    
    // Calcula el tamaño base del triángulo
    const size = Math.min(canvas.width, canvas.height) * 0.8;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calcula los vértices del triángulo principal
    const height = size * Math.sqrt(3) / 2;
    
    const x1 = centerX;
    const y1 = centerY - height / 2;
    
    const x2 = centerX - size / 2;
    const y2 = centerY + height / 2;
    
    const x3 = centerX + size / 2;
    const y3 = centerY + height / 2;
    
    // Dibuja el triángulo de Sierpinski con el factor de zoom
    drawSierpinski(x1, y1, x2, y2, x3, y3, maxDepth, time * 10, zoomFactor);
    
    // Actualiza el tiempo
    time += 0.01;
    
    // Solicita el siguiente frame
    requestAnimationFrame(animate);
}

// Inicia la animación cuando la página se carga
window.addEventListener('load', () => {
    resizeCanvas();
    animate();
});

// Ajusta el canvas cuando cambia el tamaño de la ventana
window.addEventListener('resize', resizeCanvas);

// Inicia la animación cuando la página se carga
window.addEventListener('load', () => {
    resizeCanvas();
    animate();
});

// Ajusta el canvas cuando cambia el tamaño de la ventana
window.addEventListener('resize', resizeCanvas);
