// Configuración del canvas
const canvas = document.getElementById('my-canvas');
const ctx = canvas.getContext('2d');

// Ajustar tamaño del canvas al tamaño de la ventana
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Variables para el trazado continuo
let isDrawing = false;
let lastX, lastY;
let currentPath = [];
let allPaths = [];

// Clase para representar una rama
class Branch {
    constructor(startX, startY, length, angle, thickness, color, generation = 0) {
        this.startX = startX;
        this.startY = startY;
        this.length = length;
        this.angle = angle;
        this.thickness = thickness;
        this.color = color;
        this.generation = generation;
        this.maxGenerations = 10; // Límite de generaciones para evitar recursión infinita
        
        // Calcular el punto final
        this.endX = this.startX + Math.cos(this.angle) * this.length;
        this.endY = this.startY + Math.sin(this.angle) * this.length;
        
        // Estado de crecimiento (animación)
        this.progress = 0;
        this.growthSpeed = 0.01 + Math.random() * 0.02; // Velocidad de crecimiento aleatoria
        this.fullyGrown = false;
        this.children = [];
        this.hasSpawnedChildren = false;
    }
    
    // Dibujar la rama con efecto de animación de crecimiento
    draw() {
        if (this.progress >= 1) {
            this.fullyGrown = true;
        }
        
        // Punto final actual basado en el progreso
        const currentEndX = this.startX + Math.cos(this.angle) * this.length * this.progress;
        const currentEndY = this.startY + Math.sin(this.angle) * this.length * this.progress;
        
        // Dibujar la línea
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(currentEndX, currentEndY);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;
        ctx.stroke();
        
        // Dibujar un pequeño círculo en el extremo
        ctx.beginPath();
        ctx.arc(currentEndX, currentEndY, this.thickness / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Dibujar ramas hijas si existen
        this.children.forEach(child => {
            child.draw();
        });
    }
    
    // Actualizar el estado de crecimiento de la rama
    update() {
        // Incrementar el progreso de crecimiento
        if (!this.fullyGrown) {
            this.progress += this.growthSpeed;
            if (this.progress >= 1) {
                this.progress = 1;
                this.fullyGrown = true;
            }
        }
        
        // Crear nuevas ramas cuando esta rama esté completamente crecida
        if (this.fullyGrown && !this.hasSpawnedChildren && this.generation < this.maxGenerations) {
            this.spawnChildren();
            this.hasSpawnedChildren = true;
        }
        
        // Actualizar las ramas hijas
        this.children.forEach(child => {
            child.update();
        });
    }
    
    // Función para crear nuevas ramas hijas
    spawnChildren() {
        // Solo crear ramas hijas si no hemos alcanzado el límite de generaciones
        if (this.generation >= this.maxGenerations) return;
        
        // Número de ramas hijas (aleatorio)
        const numChildren = Math.floor(Math.random() * 2) + 1; // 1 a 2 ramas
        
        // Todas las ramas hijas serán blancas
        const newColor = '#ffffff';
        
        for (let i = 0; i < numChildren; i++) {
            // Calcular nuevo ángulo (con una desviación respecto al ángulo actual)
            const angleOffset = (Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
            const newAngle = this.angle + angleOffset;
            
            // Calcular nueva longitud (ligeramente menor)
            const newLength = this.length * (0.6 + Math.random() * 0.3);
            
            // Calcular nuevo grosor (ligeramente menor)
            const newThickness = this.thickness * 0.8;
            
            // Crear nueva rama
            const newBranch = new Branch(
                this.endX,
                this.endY,
                newLength,
                newAngle,
                newThickness,
                newColor,
                this.generation + 1
            );
            
            this.children.push(newBranch);
        }
    }
}

// Array para almacenar todas las ramas principales
let branches = [];

// Función para dibujar el trazado continuo
function drawContinuousPath() {
    ctx.beginPath();
    ctx.moveTo(currentPath[0].x, currentPath[0].y);
    
    for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
    }
    
    ctx.strokeStyle = '#ffffff'; // Color blanco para el trazado
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Función para dibujar todos los trazados anteriores
function drawAllPaths() {
    for (let path of allPaths) {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        
        ctx.strokeStyle = '#ffffff'; // Color blanco para el trazado
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Variables para controlar la generación de raíces
let lastRootTime = 0;
let rootGenerationInterval = 150; // Intervalo en ms para generar nuevas raíces mientras se mueve el ratón

// Eventos para el trazado continuo
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
    currentPath = [{x: lastX, y: lastY}];
    
    // Generar raíces iniciales al comenzar a dibujar
    createBranchFromClick(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    // Añadir el punto actual al trazado
    currentPath.push({x: e.clientX, y: e.clientY});
    
    // Actualizar la última posición
    lastX = e.clientX;
    lastY = e.clientY;
    
    // Generar nuevas raíces mientras se mueve el ratón (con un intervalo para no saturar)
    const currentTime = Date.now();
    if (currentTime - lastRootTime > rootGenerationInterval) {
        // Crear raíces solo ocasionalmente mientras se mueve el ratón
        if (Math.random() < 0.4) { // 40% de probabilidad
            createBranchFromMouseMove(e);
        }
        lastRootTime = currentTime;
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        if (currentPath.length > 1) {
            allPaths.push([...currentPath]);
        }
        currentPath = [];
    }
});

canvas.addEventListener('mouseout', () => {
    if (isDrawing) {
        isDrawing = false;
        if (currentPath.length > 1) {
            allPaths.push([...currentPath]);
        }
        currentPath = [];
    }
});

// Función para crear una nueva rama principal desde el punto de clic
function createBranchFromClick(e) {
    // Crear nuevas ramas desde el punto de clic
    const numInitialBranches = 3; // Número de ramas iniciales
    
    for (let i = 0; i < numInitialBranches; i++) {
        // Ángulo distribuido en un círculo
        const angle = (i * (2 * Math.PI / numInitialBranches));
        
        // Crear rama con color blanco
        const branch = new Branch(
            e.clientX,
            e.clientY,
            Math.random() * 50 + 50, // Longitud entre 50 y 100
            angle,
            3, // Grosor inicial
            '#ffffff', // Color blanco
            0 // Generación inicial
        );
        
        branches.push(branch);
    }
}

// Función para crear ramas mientras se mueve el ratón
function createBranchFromMouseMove(e) {
    // Crear menos ramas mientras se mueve el ratón para no saturar
    const numBranches = Math.floor(Math.random() * 2) + 1; // 1 o 2 ramas
    
    for (let i = 0; i < numBranches; i++) {
        // Ángulo más aleatorio para ramas en movimiento
        const angle = Math.random() * Math.PI * 2;
        
        // Longitud más corta para ramas en movimiento
        const length = Math.random() * 30 + 20;
        
        // Crear rama con color blanco
        const branch = new Branch(
            e.clientX,
            e.clientY,
            length,
            angle,
            1.5 + Math.random(), // Grosor aleatorio entre 1.5 y 2.5
            '#ffffff', // Color blanco
            0
        );
        
        branches.push(branch);
    }
}

// Escuchar eventos de clic en el canvas para crear raíces adicionales
canvas.addEventListener('click', (e) => {
    // Si no estamos dibujando, podemos generar más raíces con un clic
    if (!isDrawing) {
        createBranchFromClick(e);
    }
});

// Función para animar el crecimiento de las ramas
function animate() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar todos los trazados anteriores
    drawAllPaths();
    
    // Dibujar el trazado actual si estamos dibujando
    if (isDrawing && currentPath.length > 1) {
        drawContinuousPath();
    }
    
    // Dibujar y actualizar todas las ramas
    branches.forEach(branch => {
        branch.draw();
        branch.update();
    });
    
    // Continuar la animación
    requestAnimationFrame(animate);
}

// Limitador para el número máximo de ramas activas
function pruneOldBranches() {
    // Limitar el número de ramas para mantener el rendimiento
    const maxBranches = 500;
    if (branches.length > maxBranches) {
        // Eliminar las ramas más antiguas
        branches = branches.slice(branches.length - maxBranches);
    }
    
    // Programar la próxima limpieza
    setTimeout(pruneOldBranches, 5000); // Verificar cada 5 segundos
}

// Iniciar la limpieza periódica
pruneOldBranches();

// Iniciar la animación
animate();