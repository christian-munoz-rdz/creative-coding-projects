// Teseracto Interactivo
const canvas = document.getElementById('my-canvas');
const ctx = canvas.getContext('2d');

// Establecer dimensiones del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables para el seguimiento del mouse
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let currentRotationZ = 0;
let currentRotationW = 0;
let isMouseMoving = false;
let mouseTimer = null;

// Seguimiento de la posición del mouse
canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    // Calcular rotación objetivo basada en la posición del puntero
    targetRotationX = (mouseY / canvas.height - 0.5) * Math.PI;
    targetRotationY = (mouseX / canvas.width - 0.5) * Math.PI;
    
    // Indicar que el mouse se está moviendo
    isMouseMoving = true;
    
    // Reiniciar el temporizador
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
        isMouseMoving = false;
    }, 100); // Tiempo antes de considerar que el mouse se ha detenido
});

// Precalcular valores de seno y coseno para mejorar rendimiento
const precomputeRotation = (angle) => {
    return {
        cos: Math.cos(angle),
        sin: Math.sin(angle)
    };
};

// Clase para representar un punto en 4D
class Point4D {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.projectedX = 0;
        this.projectedY = 0;
        this.projectedZ = 0;
        this.scale = 0;
    }
    
    // Rotar en el plano XY
    rotateXY(angle) {
        const rot = precomputeRotation(angle);
        const x = this.x;
        const y = this.y;
        this.x = x * rot.cos - y * rot.sin;
        this.y = x * rot.sin + y * rot.cos;
    }
    
    // Rotar en el plano XZ
    rotateXZ(angle) {
        const rot = precomputeRotation(angle);
        const x = this.x;
        const z = this.z;
        this.x = x * rot.cos - z * rot.sin;
        this.z = x * rot.sin + z * rot.cos;
    }
    
    // Rotar en el plano XW
    rotateXW(angle) {
        const rot = precomputeRotation(angle);
        const x = this.x;
        const w = this.w;
        this.x = x * rot.cos - w * rot.sin;
        this.w = x * rot.sin + w * rot.cos;
    }
    
    // Rotar en el plano YZ
    rotateYZ(angle) {
        const rot = precomputeRotation(angle);
        const y = this.y;
        const z = this.z;
        this.y = y * rot.cos - z * rot.sin;
        this.z = y * rot.sin + z * rot.cos;
    }
    
    // Rotar en el plano YW
    rotateYW(angle) {
        const rot = precomputeRotation(angle);
        const y = this.y;
        const w = this.w;
        this.y = y * rot.cos - w * rot.sin;
        this.w = y * rot.sin + w * rot.cos;
    }
    
    // Rotar en el plano ZW
    rotateZW(angle) {
        const rot = precomputeRotation(angle);
        const z = this.z;
        const w = this.w;
        this.z = z * rot.cos - w * rot.sin;
        this.w = z * rot.sin + w * rot.cos;
    }
    
    // Proyectar desde 4D a 3D (usando la dimensión W)
    project4Dto3D() {
        // Distancia del ojo al punto de proyección
        const distance = 3; // Aumentado para mejorar perspectiva
        const w = 1 / (distance - this.w * 0.8); // Ajustado para una mejor visualización
        
        this.projectedX = this.x * w;
        this.projectedY = this.y * w;
        this.projectedZ = this.z * w;
    }
    
    // Proyectar desde 3D a 2D (usando perspectiva)
    project3Dto2D() {
        // Distancia del ojo a la pantalla
        const distance = 3; // Aumentado para mejorar perspectiva
        const z = 1 / (distance - this.projectedZ * 0.8); // Ajustado para una mejor visualización
        
        this.projectedX = this.projectedX * z;
        this.projectedY = this.projectedY * z;
        
        // Escala para el tamaño del punto
        this.scale = z * 0.8; // Aumentado para vértices más visibles
    }
}

// Crear los 16 vértices del teseracto (hipercubo 4D)
const vertices = [];
for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
            for (let w = -1; w <= 1; w += 2) {
                vertices.push(new Point4D(x, y, z, w));
            }
        }
    }
}

// Crear las 32 aristas del teseracto
const edges = [
    // Aristas del cubo "interno" (w = -1)
    [0, 1], [1, 3], [3, 2], [2, 0],
    [0, 4], [1, 5], [3, 7], [2, 6],
    [4, 5], [5, 7], [7, 6], [6, 4],
    
    // Aristas del cubo "externo" (w = 1)
    [8, 9], [9, 11], [11, 10], [10, 8],
    [8, 12], [9, 13], [11, 15], [10, 14],
    [12, 13], [13, 15], [15, 14], [14, 12],
    
    // Aristas que conectan los dos cubos (a través de la dimensión W)
    [0, 8], [1, 9], [2, 10], [3, 11],
    [4, 12], [5, 13], [6, 14], [7, 15]
];

// Definir un factor de escala para el tamaño del teseracto
const scale = 900; // Aumentado de 150 a 300 para hacer el teseracto más grande

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
    
    // Limpiar pantalla con negro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Mayor opacidad para un rastro menos persistente
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar rotaciones con suavizado
    if (isMouseMoving) {
        // Respuesta rápida cuando el mouse está en movimiento
        currentRotationX += (targetRotationX - currentRotationX) * 0.08 * deltaFactor; // Más suave para el teseracto grande
        currentRotationY += (targetRotationY - currentRotationY) * 0.08 * deltaFactor;
    } else {
        // Movimiento autónomo suave cuando el mouse está quieto
        currentRotationX += 0.0008 * deltaFactor; // Más lento para apreciar mejor el teseracto grande
        currentRotationY += 0.0012 * deltaFactor;
    }
    
    // Rotaciones autónomas para la dimensión W
    currentRotationZ += 0.0008 * deltaFactor;
    currentRotationW += 0.0015 * deltaFactor; // Más lento para mejor visualización
    
    // Almacenamiento temporal para las posiciones proyectadas
    const projectedVertices = [];
    
    try {
        // Rotar y proyectar cada vértice
        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            // Crear una copia del vértice para las rotaciones
            const rotated = new Point4D(vertex.x, vertex.y, vertex.z, vertex.w);
            
            // Aplicar rotaciones
            rotated.rotateXY(currentRotationZ);
            rotated.rotateXZ(currentRotationX);
            rotated.rotateYZ(currentRotationY);
            rotated.rotateXW(currentRotationW);
            rotated.rotateYW(currentRotationW * 0.5);
            rotated.rotateZW(currentRotationW * 0.3);
            
            // Proyectar desde 4D a 3D y luego a 2D
            rotated.project4Dto3D();
            rotated.project3Dto2D();
            
            // Almacenar las coordenadas proyectadas
            projectedVertices.push({
                x: canvas.width / 2 + rotated.projectedX * scale,
                y: canvas.height / 2 + rotated.projectedY * scale,
                scale: rotated.scale
            });
        }
        
        // Dibujar aristas en blanco
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2.5; // Líneas más gruesas
        
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            const v1 = projectedVertices[edge[0]];
            const v2 = projectedVertices[edge[1]];
            
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.stroke();
        }
        
        // Dibujar vértices en blanco
        for (let i = 0; i < projectedVertices.length; i++) {
            const v = projectedVertices[i];
            const size = 6 + v.scale * 5; // Vértices más grandes
            
            ctx.fillStyle = 'rgb(255, 255, 255)'; // Color blanco puro
            ctx.beginPath();
            ctx.arc(v.x, v.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    } catch (e) {
        console.error('Error en la animación:', e);
        // Reiniciar rotaciones en caso de error
        currentRotationX = 0;
        currentRotationY = 0;
        currentRotationZ = 0;
        currentRotationW = 0;
    }
    
    requestAnimationFrame(animate);
}

// Iniciar animación
animate();

// Actualizar colores de fondo a negro simple
document.body.style.backgroundColor = '#000';
canvas.style.background = '#000';
