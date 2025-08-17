// Configuración inicial de Three.js
let scene, camera, renderer;
let lines = [];
let mousePos = { x: 0, y: 0 };

// Configuración de la forma
const numLines = 700; // Mayor número de líneas para un aspecto más caótico
const maxLineLength = 1.5;
const color = 0xffffff; // Color blanco
const rotationSpeed = 0.0005;

// Inicialización
function init() {
    // Crear escena
    scene = new THREE.Scene();
    
    // Crear cámara con perspectiva
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6; // Más cerca para que se vea mejor la forma
    
    // Crear renderer con fondo negro
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Crear la forma orgánica de líneas
    createOrganicShape();
    
    // Agregar línea horizontal de referencia
    createReferenceLines();
    
    // Agregar eventos de ratón
    document.addEventListener('mousemove', onMouseMove);
    
    // Ajustar el tamaño cuando cambia el tamaño de la ventana
    window.addEventListener('resize', onWindowResize);
    
    // Comenzar la animación
    animate();
}

// Función para crear la forma orgánica de líneas aleatorias
function createOrganicShape() {
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        linewidth: 1
    });
    
    // Centro aproximado de la forma
    const centerX = 0;
    const centerY = 0;
    const centerZ = 0;
    const radius = 3.5;
    
    // Crear múltiples líneas aleatorias
    for (let i = 0; i < numLines; i++) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        // Posición inicial cerca del centro con cierta aleatoriedad
        const startX = centerX + (Math.random() - 0.5) * radius;
        const startY = centerY + (Math.random() - 0.5) * radius;
        const startZ = centerZ + (Math.random() - 0.5) * radius;
        
        // Dirección y longitud aleatorias para la línea
        const dirX = (Math.random() - 0.5) * 2;
        const dirY = (Math.random() - 0.5) * 2;
        const dirZ = (Math.random() - 0.5) * 0.5; // Menor profundidad
        
        const length = Math.random() * maxLineLength + 0.5;
        
        // Crear los puntos de inicio y fin de la línea
        vertices.push(
            startX, startY, startZ,
            startX + dirX * length, startY + dirY * length, startZ + dirZ * length
        );
        
        // Crear la geometría y la línea
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const line = new THREE.Line(geometry, lineMaterial);
        
        // Guardar referencia a la línea y agregarla a la escena
        lines.push({
            line: line,
            initialPos: [...vertices],
            speed: Math.random() * 0.01 + 0.005,
            direction: { x: dirX, y: dirY, z: dirZ },
            phase: Math.random() * Math.PI * 2
        });
        
        scene.add(line);
    }
}

// Crear líneas de referencia como en la imagen
function createReferenceLines() {
    // Solo la línea horizontal como en la imagen
    const horizontalGeometry = new THREE.BufferGeometry();
    const horizontalVertices = [
        -10, 0, 0,
        10, 0, 0
    ];
    horizontalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(horizontalVertices, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
    const horizontalLine = new THREE.Line(horizontalGeometry, lineMaterial);
    scene.add(horizontalLine);
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
    
    // Actualizar la forma orgánica basada en la posición del ratón
    updateShape();
    
    // Rotar toda la escena ligeramente
    scene.rotation.x += rotationSpeed * 0.2;
    scene.rotation.y += rotationSpeed * 0.5;
    
    // Renderizar la escena
    renderer.render(scene, camera);
}

// Actualizar la forma basada en el movimiento del ratón
function updateShape() {
    if (lines.length === 0) return;
    
    const time = Date.now() * 0.001;
    const mouseInfluence = 2.5; // Mayor influencia del ratón
    
    // Actualizar cada línea
    lines.forEach((lineObj, index) => {
        const line = lineObj.line;
        const initialPos = lineObj.initialPos;
        const speed = lineObj.speed;
        const phase = lineObj.phase;
        
        // Factor de movimiento basado en el tiempo y el ratón
        const moveFactor = Math.sin(time * speed + phase) * 0.3;
        const mouseFactor = {
            x: mousePos.x * mouseInfluence * (Math.sin(index * 0.1)),
            y: mousePos.y * mouseInfluence * (Math.cos(index * 0.1))
        };
        
        // Obtener las posiciones actuales
        const positions = line.geometry.attributes.position.array;
        
        // Actualizar las posiciones con movimiento aleatorio y basado en el ratón
        // Punto inicial de la línea
        positions[0] = initialPos[0] + moveFactor * lineObj.direction.x + mouseFactor.x;
        positions[1] = initialPos[1] + moveFactor * lineObj.direction.y + mouseFactor.y;
        positions[2] = initialPos[2] + moveFactor * lineObj.direction.z;
        
        // Punto final de la línea
        positions[3] = initialPos[3] + moveFactor * lineObj.direction.x * 1.5 + mouseFactor.x;
        positions[4] = initialPos[4] + moveFactor * lineObj.direction.y * 1.5 + mouseFactor.y;
        positions[5] = initialPos[5] + moveFactor * lineObj.direction.z * 0.5;
        
        // Notificar que las posiciones han cambiado
        line.geometry.attributes.position.needsUpdate = true;
    });
}

// Iniciar la aplicación
init();
