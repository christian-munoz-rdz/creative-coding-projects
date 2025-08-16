// Configuración del canvas
const canvas = document.getElementById('my-canvas');
const ctx = canvas.getContext('2d');

// Variables para el seguimiento del mouse
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let currentRotationZ = 0;
let isMouseMoving = false;
let mouseTimer = null;

// Ajustar tamaño del canvas al tamaño de la ventana
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Seguimiento de la posición del mouse
canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    // Calcular rotación objetivo basada en la posición del puntero
    targetRotationX = (mouseY / canvas.height - 0.5) * Math.PI * 2;
    targetRotationY = (mouseX / canvas.width - 0.5) * Math.PI * 2;
    
    // Indicar que el mouse se está moviendo
    isMouseMoving = true;
    
    // Reiniciar el temporizador
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
        isMouseMoving = false;
    }, 100); // Tiempo antes de considerar que el mouse se ha detenido
});

// Para dispositivos táctiles
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    mouseX = event.touches[0].clientX;
    mouseY = event.touches[0].clientY;
    
    // Calcular rotación objetivo basada en la posición del toque
    targetRotationX = (mouseY / canvas.height - 0.5) * Math.PI * 2;
    targetRotationY = (mouseX / canvas.width - 0.5) * Math.PI * 2;
    
    // Indicar que la pantalla se está tocando
    isMouseMoving = true;
    
    // Reiniciar el temporizador
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
        isMouseMoving = false;
    }, 100);
});

// Clase para representar un punto en 3D
class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.projectedX = 0;
        this.projectedY = 0;
        this.scale = 0;
    }
    
    // Rotar en el plano XY
    rotateXY(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x;
        const y = this.y;
        this.x = x * cos - y * sin;
        this.y = x * sin + y * cos;
    }
    
    // Rotar en el plano XZ
    rotateXZ(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x;
        const z = this.z;
        this.x = x * cos - z * sin;
        this.z = x * sin + z * cos;
    }
    
    // Rotar en el plano YZ
    rotateYZ(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const y = this.y;
        const z = this.z;
        this.y = y * cos - z * sin;
        this.z = y * sin + z * cos;
    }
    
    // Proyectar desde 3D a 2D (usando perspectiva)
    project() {
        // Distancia del ojo a la pantalla
        const distance = 2;
        const z = 1 / (distance - this.z * 0.5);
        
        this.projectedX = this.x * z;
        this.projectedY = this.y * z;
        
        // Escala para el tamaño del punto
        this.scale = z;
    }
}

// Crear los vértices del cubo
const createCubeVertices = (size, count) => {
    const vertices = [];
    // Crear un cubo con más puntos para mejor visualización
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            // Cara frontal (z = -size)
            vertices.push(new Point3D(
                size * (2 * (i / (count - 1)) - 1),
                size * (2 * (j / (count - 1)) - 1),
                -size
            ));
            
            // Cara trasera (z = size)
            vertices.push(new Point3D(
                size * (2 * (i / (count - 1)) - 1),
                size * (2 * (j / (count - 1)) - 1),
                size
            ));
            
            // Cara izquierda (x = -size)
            vertices.push(new Point3D(
                -size,
                size * (2 * (i / (count - 1)) - 1),
                size * (2 * (j / (count - 1)) - 1)
            ));
            
            // Cara derecha (x = size)
            vertices.push(new Point3D(
                size,
                size * (2 * (i / (count - 1)) - 1),
                size * (2 * (j / (count - 1)) - 1)
            ));
            
            // Cara superior (y = -size)
            vertices.push(new Point3D(
                size * (2 * (i / (count - 1)) - 1),
                -size,
                size * (2 * (j / (count - 1)) - 1)
            ));
            
            // Cara inferior (y = size)
            vertices.push(new Point3D(
                size * (2 * (i / (count - 1)) - 1),
                size,
                size * (2 * (j / (count - 1)) - 1)
            ));
        }
    }
    return vertices;
};

// Crear los vértices para un cubo con más puntos
const vertices = createCubeVertices(1, 5); // Cubo con 150 puntos (5x5x6 caras)

// Ya no usamos aristas ya que utilizamos puntos para visualizar el cubo

// Definir un factor de escala para el tamaño del cubo
const scale = 200;

// Función para suavizar la animación
let lastTime = 0;
function getDeltaTime() {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    return delta / 16.67; // Normalizar a ~60 FPS
}

// Función de animación principal
function animate() {
    // Usar delta time para suavizar animación
    const deltaFactor = getDeltaTime();
    
    // Limpiar pantalla
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar rotaciones con suavizado
    if (isMouseMoving) {
        // Respuesta rápida cuando el mouse está en movimiento
        currentRotationX += (targetRotationX - currentRotationX) * 0.1 * deltaFactor;
        currentRotationY += (targetRotationY - currentRotationY) * 0.1 * deltaFactor;
    } else {
        // Movimiento autónomo suave cuando el mouse está quieto
        currentRotationX += 0.01 * deltaFactor;
        currentRotationY += 0.015 * deltaFactor;
        currentRotationZ += 0.005 * deltaFactor;
    }
    
    // Almacenamiento temporal para las posiciones proyectadas
    const projectedVertices = [];
    
    try {
        // Rotar y proyectar cada vértice
        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            // Crear una copia del vértice para las rotaciones
            const rotated = new Point3D(vertex.x, vertex.y, vertex.z);
            
            // Aplicar rotaciones
            rotated.rotateXY(currentRotationZ);
            rotated.rotateXZ(currentRotationX);
            rotated.rotateYZ(currentRotationY);
            
            // Proyectar de 3D a 2D
            rotated.project();
            
            // Almacenar las coordenadas proyectadas
            projectedVertices.push({
                x: canvas.width / 2 + rotated.projectedX * scale,
                y: canvas.height / 2 + rotated.projectedY * scale,
                scale: rotated.scale,
                z: rotated.z // Guardar la coordenada z para ordenar por profundidad
            });
        }
        
        // Ordenar vértices por profundidad (z) para un renderizado correcto
        projectedVertices.sort((a, b) => b.z - a.z);
        
        // Dibujar vértices con efecto de brillo basado en la profundidad
        for (let i = 0; i < projectedVertices.length; i++) {
            const v = projectedVertices[i];
            // Calcular tamaño basado en la profundidad
            const size = 2 + Math.max(0, v.scale * 3);
            
            // Calcular brillo basado en profundidad
            const brightness = Math.max(0.4, Math.min(1, (v.z + 1.2) / 2.4));
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            
            ctx.beginPath();
            ctx.arc(v.x, v.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Opcional: Dibujar una animación en el centro del cubo
        drawCubeCenter(projectedVertices);
        
    } catch (e) {
        console.error('Error en la animación:', e);
        // Reiniciar rotaciones en caso de error
        currentRotationX = 0;
        currentRotationY = 0;
        currentRotationZ = 0;
    }
    
    requestAnimationFrame(animate);
}

// Función para dibujar efectos adicionales en el centro del cubo
function drawCubeCenter(vertices) {
    // Calcular el centro del cubo proyectado
    const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
    const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;
    
    const time = Date.now() * 0.001; // Tiempo en segundos
    
    // Crear un efecto de resplandor en el centro
    const glowRadius = 80 + Math.sin(time) * 15;
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowRadius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibujar partículas en órbita
    const numParticles = 30;
    const orbitRadii = [30, 50, 70]; // Múltiples órbitas
    
    for (let orbit = 0; orbit < orbitRadii.length; orbit++) {
        const orbitRadius = orbitRadii[orbit];
        const orbitSpeed = 1 - orbit * 0.2; // Velocidades diferentes por órbita
        
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2 + time * orbitSpeed;
            const x = centerX + Math.cos(angle) * orbitRadius;
            const y = centerY + Math.sin(angle) * orbitRadius;
            
            // Tamaño variable con el tiempo
            const pulseEffect = Math.sin(time * 3 + i) * 0.5 + 0.5;
            const size = 1 + pulseEffect * 2;
            
            // Color variable con el tiempo
            const brightness = 0.7 + pulseEffect * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Opcional: líneas de conexión entre partículas cercanas
            if (i % 3 === 0) {
                const nextIdx = (i + 1) % numParticles;
                const nextAngle = (nextIdx / numParticles) * Math.PI * 2 + time * orbitSpeed;
                const nx = centerX + Math.cos(nextAngle) * orbitRadius;
                const ny = centerY + Math.sin(nextAngle) * orbitRadius;
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nx, ny);
                ctx.stroke();
            }
        }
    }
}

// Iniciar animación
animate();
