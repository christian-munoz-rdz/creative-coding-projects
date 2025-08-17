// Configuración inicial de Three.js
let scene, camera, renderer;
let branches = [];
let mousePos = { x: 0, y: 0 };
let growthProgress = 0;
let branchesComplete = false;

// Configuración de la forma
const maxBranches = 800;
const maxDepth = 6; // Profundidad máxima de ramificación
const branchLength = 0.8; // Longitud base de las ramas
const branchShrinkFactor = 0.8; // Factor de reducción de longitud en cada nivel
const growthSpeed = 0.002; // Velocidad de crecimiento
const color = 0xffffff; // Color blanco
const rotationSpeed = 0.0002;

// Inicialización
function init() {
    // Crear escena
    scene = new THREE.Scene();
    
    // Crear cámara con perspectiva
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8; // Ajustar para ver todo el árbol
    
    // Crear renderer con fondo negro
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Insertar en el contenedor del proyecto si existe, o en el body
    const container = document.querySelector('.project-container') || document.body;
    container.appendChild(renderer.domElement);
    
    // Crear la forma orgánica de ramas
    createOrganicShape();
    
    // Agregar línea horizontal de referencia (suelo)
    createReferenceLines();
    
    // Agregar eventos de ratón
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchstart', onMouseDown);
    document.addEventListener('touchend', onMouseUp);
    
    // Ajustar el tamaño cuando cambia el tamaño de la ventana
    window.addEventListener('resize', onWindowResize);
    
    // Comenzar la animación
    animate();
}

// Función para crear la estructura orgánica de ramas
function createOrganicShape() {
    // Material para las ramas
    const branchMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        linewidth: 1
    });
    
    // Iniciar el crecimiento desde el centro (el tronco)
    const startPoint = new THREE.Vector3(0, -2, 0); // Empezamos desde abajo
    
    // Crear las primeras ramas principales (3-5 troncos)
    const numMainBranches = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numMainBranches; i++) {
        // Ángulo ligeramente aleatorio para cada tronco principal
        const angle = (Math.PI / numMainBranches) * i + (Math.random() * 0.2 - 0.1);
        
        // Dirección inicial hacia arriba con variación aleatoria
        const direction = new THREE.Vector3(
            Math.sin(angle) * 0.4, // Componente X
            1, // Componente Y (hacia arriba)
            (Math.random() - 0.5) * 0.2 // Componente Z (profundidad)
        ).normalize();
        
        // Crear una rama principal
        createBranch(startPoint, direction, branchLength * 1.5, 0, branchMaterial);
    }
}

// Función recursiva para crear una rama y sus sub-ramas
function createBranch(startPoint, direction, length, depth, material) {
    // Detener la recursión si alcanzamos la profundidad máxima o el número máximo de ramas
    if (depth >= maxDepth || branches.length >= maxBranches) {
        return;
    }
    
    // Calcular el punto final de la rama
    const endPoint = new THREE.Vector3().addVectors(
        startPoint,
        new THREE.Vector3().copy(direction).multiplyScalar(length)
    );
    
    // Crear geometría para esta rama
    const geometry = new THREE.BufferGeometry();
    const vertices = [
        startPoint.x, startPoint.y, startPoint.z,
        endPoint.x, endPoint.y, endPoint.z
    ];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Crear la línea para esta rama
    const branch = new THREE.Line(geometry, material);
    branch.visible = false; // Inicialmente invisible, se mostrará al crecer
    
    // Guardar información de la rama
    branches.push({
        branch: branch,
        startPoint: startPoint.clone(),
        endPoint: endPoint.clone(),
        direction: direction.clone(),
        length: length,
        depth: depth,
        initialVertices: [...vertices],
        growthThreshold: branches.length / maxBranches, // Cuándo debe comenzar a crecer
        interactionFactor: Math.random() * 0.3 + 0.7, // Factor aleatorio para la interacción
        swayFactor: Math.random() * 0.05 + 0.02, // Cuánto se mueve con el viento
        swayPhase: Math.random() * Math.PI * 2 // Fase inicial para el movimiento
    });
    
    // Añadir la rama a la escena
    scene.add(branch);
    
    // Crear sub-ramas si no estamos en la profundidad máxima
    if (depth < maxDepth - 1) {
        // Determinar cuántas sub-ramas crear (menos en niveles más profundos)
        const numSubBranches = Math.max(1, Math.floor((maxDepth - depth) * Math.random() * 1.5));
        
        for (let i = 0; i < numSubBranches; i++) {
            // Solo ramificar si no excedemos el límite
            if (branches.length < maxBranches) {
                // Crear una dirección nueva para la sub-rama
                const newDirection = calculateNewDirection(direction, depth);
                
                // Determinar una nueva longitud para la sub-rama (más corta que la rama padre)
                const newLength = length * (branchShrinkFactor - Math.random() * 0.1);
                
                // Crear recursivamente la sub-rama desde el final de esta rama
                createBranch(endPoint.clone(), newDirection, newLength, depth + 1, material);
            }
        }
    }
}

// Calcular una nueva dirección para una rama secundaria
function calculateNewDirection(parentDirection, depth) {
    // Ángulo de desviación más grande en niveles inferiores, más pequeño en niveles superiores
    const maxDeviation = Math.PI * (0.25 - depth * 0.02);
    
    // Ángulos aleatorios de desviación
    const theta = (Math.random() * 2 - 1) * maxDeviation;
    const phi = Math.random() * Math.PI * 2;
    
    // Vector perpendicular aleatorio
    const perpX = Math.sin(phi);
    const perpY = Math.cos(phi);
    const perpZ = Math.random() * 2 - 1;
    
    // Crear un vector perpendicular a la dirección padre
    const perpVector = new THREE.Vector3(perpX, perpY, perpZ);
    perpVector.cross(parentDirection);
    perpVector.normalize();
    
    // Rotar la dirección padre alrededor de este vector perpendicular
    const newDirection = parentDirection.clone();
    newDirection.applyAxisAngle(perpVector, theta);
    
    // Normalizar la dirección
    newDirection.normalize();
    
    return newDirection;
}

// Crear el suelo para el árbol
function createReferenceLines() {
    // Crear una cuadrícula de líneas para simular el suelo
    const gridSize = 10;
    const gridDivisions = 10;
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x222222 });
    
    // Crear líneas horizontales para la cuadrícula (eje X)
    for (let i = -gridSize/2; i <= gridSize/2; i += gridSize/gridDivisions) {
        const lineGeometry = new THREE.BufferGeometry();
        const lineVertices = [
            -gridSize/2, -2, i,
            gridSize/2, -2, i
        ];
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
        const line = new THREE.Line(lineGeometry, gridMaterial);
        scene.add(line);
    }
    
    // Crear líneas verticales para la cuadrícula (eje Z)
    for (let i = -gridSize/2; i <= gridSize/2; i += gridSize/gridDivisions) {
        const lineGeometry = new THREE.BufferGeometry();
        const lineVertices = [
            i, -2, -gridSize/2,
            i, -2, gridSize/2
        ];
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
        const line = new THREE.Line(lineGeometry, gridMaterial);
        scene.add(line);
    }
}

// Manejar el movimiento del ratón
function onMouseMove(event) {
    // Normalizar las coordenadas del ratón entre -1 y 1
    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Ajustar el tamaño cuando cambia la ventana
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    
    // Actualizar el progreso del crecimiento
    if (!branchesComplete) {
        growthProgress += growthSpeed;
        if (growthProgress >= 1) {
            branchesComplete = true;
        }
    }
    
    // Actualizar la forma orgánica basada en la posición del ratón
    updateShape();
    
    // Rotar toda la escena ligeramente solo si se presiona el ratón
    if (mouseDown) {
        scene.rotation.y += rotationSpeed * mousePos.x * 5;
        scene.rotation.x += rotationSpeed * mousePos.y * 2;
    } else {
        // Ligero movimiento de respiración cuando no hay interacción
        scene.rotation.y += Math.sin(Date.now() * 0.0005) * rotationSpeed * 0.1;
    }
    
    // Renderizar la escena
    renderer.render(scene, camera);
}

// Variable para controlar si el ratón está presionado
let mouseDown = false;

// Funciones para detectar cuando el usuario presiona/suelta el ratón
function onMouseDown() {
    mouseDown = true;
}

function onMouseUp() {
    mouseDown = false;
}

// Actualizar la forma basada en el movimiento del ratón y el crecimiento
function updateShape() {
    if (branches.length === 0) return;
    
    const time = Date.now() * 0.001;
    const mouseInfluence = 0.5;
    
    // Actualizar cada rama
    branches.forEach((branchObj, index) => {
        // Verificar si esta rama debe ser visible según el progreso del crecimiento
        if (growthProgress >= branchObj.growthThreshold) {
            branchObj.branch.visible = true;
            
            // Calcular qué proporción de la rama debe mostrarse basándose en el progreso
            let branchProgress = (growthProgress - branchObj.growthThreshold) / (1 - branchObj.growthThreshold);
            branchProgress = Math.min(branchProgress, 1); // Limitar a 1
            
            // Obtener las posiciones actuales
            const positions = branchObj.branch.geometry.attributes.position.array;
            const initialVertices = branchObj.initialVertices;
            
            // El punto inicial es fijo, el punto final crece gradualmente
            if (branchProgress < 1) {
                // Durante el crecimiento, interpolar el punto final
                positions[3] = initialVertices[0] + (initialVertices[3] - initialVertices[0]) * branchProgress;
                positions[4] = initialVertices[1] + (initialVertices[4] - initialVertices[1]) * branchProgress;
                positions[5] = initialVertices[2] + (initialVertices[5] - initialVertices[2]) * branchProgress;
            } else {
                // Una vez crecido completamente, permitir movimiento e interacción
                // Movimiento de balanceo natural (como con viento)
                const swayAmount = Math.sin(time + branchObj.swayPhase) * branchObj.swayFactor;
                
                // Influencia del movimiento del ratón
                const distanceFromMouse = branchObj.depth * 0.2; // Más profundo = menos afectado
                const mouseEffect = {
                    x: mousePos.x * mouseInfluence * branchObj.interactionFactor / (distanceFromMouse + 1),
                    y: mousePos.y * mouseInfluence * branchObj.interactionFactor / (distanceFromMouse + 1)
                };
                
                // Aplicar el movimiento principalmente a las puntas de las ramas
                // El punto inicial se mueve menos que el punto final
                const startMoveFactor = 0.2;
                const endMoveFactor = 1.0;
                
                // Mover el punto inicial (ligeramente)
                positions[0] = initialVertices[0] + swayAmount * branchObj.direction.x * startMoveFactor + mouseEffect.x * startMoveFactor;
                positions[1] = initialVertices[1] + swayAmount * branchObj.direction.y * startMoveFactor + mouseEffect.y * startMoveFactor;
                positions[2] = initialVertices[2] + swayAmount * branchObj.direction.z * startMoveFactor;
                
                // Mover el punto final (más notoriamente)
                positions[3] = initialVertices[3] + swayAmount * branchObj.direction.x * endMoveFactor + mouseEffect.x * endMoveFactor;
                positions[4] = initialVertices[4] + swayAmount * branchObj.direction.y * endMoveFactor + mouseEffect.y * endMoveFactor;
                positions[5] = initialVertices[5] + swayAmount * branchObj.direction.z * endMoveFactor;
            }
            
            // Notificar que las posiciones han cambiado
            branchObj.branch.geometry.attributes.position.needsUpdate = true;
        } else {
            branchObj.branch.visible = false;
        }
    });
}

// Iniciar la aplicación
init();
