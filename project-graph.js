// Clase para crear y administrar el grafo de proyectos
class ProjectGraph {
    constructor(canvasId, projects) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.projects = projects;
        this.nodes = [];
        this.edges = [];
        this.hoveredNode = null;
        this.selectedNode = null;
        this.nodeInfo = document.querySelector('.node-info');
        this.animationId = null;
        this.transitionActive = false;
        this.time = 0;
        
        // Configuración
        this.nodeRadius = 25;
        this.edgeStrength = 0.03;
        this.repulsionStrength = 5000;
        this.centerAttraction = 0.000002;
        this.damping = 0.75;
        this.continousMovement = true; // Habilitar movimiento continuo
        this.hoverTolerance = 5; // Mayor tolerancia para la detección de hover
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.setupNodes();
        this.setupEdges();
        this.setupEventListeners();
        
        // Añadir movimiento inicial a los nodos para que empiecen a moverse
        for (const node of this.nodes) {
            node.vx = (Math.random() - 0.5) * 2; // Velocidad inicial aleatoria
            node.vy = (Math.random() - 0.5) * 2;
        }
        
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Ajustar las posiciones de los nodos cuando se redimensiona
        if (this.nodes.length > 0) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            // Calculamos el centro anterior
            let oldCenterX = 0, oldCenterY = 0;
            for (const node of this.nodes) {
                oldCenterX += node.x;
                oldCenterY += node.y;
            }
            oldCenterX /= this.nodes.length;
            oldCenterY /= this.nodes.length;
            
            // Ajustamos las posiciones relativas al nuevo centro
            for (const node of this.nodes) {
                const dx = node.x - oldCenterX;
                const dy = node.y - oldCenterY;
                node.x = centerX + dx;
                node.y = centerY + dy;
            }
        }
    }
    
    setupNodes() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.35; // Aumentado para usar más espacio
        
        this.projects.forEach((project, index) => {
            // Posición en círculo con un poco de aleatoriedad
            const angle = (index / this.projects.length) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
            const y = centerY + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
            
            this.nodes.push({
                id: index,
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                radius: this.nodeRadius,
                color: this.getRandomColor(),
                project: project
            });
        });
    }
    
    setupEdges() {
        // Crear una red más densa de conexiones entre nodos (similar a la imagen)
        for (let i = 0; i < this.nodes.length; i++) {
            // Conectar con más nodos para crear una red densa
            const connections = 4 + Math.floor(Math.random() * 3); // 4-6 conexiones por nodo
            
            // Array de distancias a otros nodos
            const distances = [];
            for (let j = 0; j < this.nodes.length; j++) {
                if (i !== j) {
                    const dx = this.nodes[i].x - this.nodes[j].x;
                    const dy = this.nodes[i].y - this.nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    distances.push({ index: j, distance: distance });
                }
            }
            
            // Ordenar por distancia y tomar los más cercanos
            distances.sort((a, b) => a.distance - b.distance);
            for (let k = 0; k < Math.min(connections, distances.length); k++) {
                const j = distances[k].index;
                // Evitar duplicados (solo agregar si i < j)
                if (i < j) {
                    this.edges.push({
                        source: i,
                        target: j,
                        strength: this.edgeStrength,
                        length: this.canvas.width * 0.13,
                        color: 'rgba(255, 255, 255, 0.2)'
                    });
                }
            }
        }
        
        // Asegurar que todos los nodos están conectados
        for (let i = 0; i < this.nodes.length - 1; i++) {
            const connected = this.edges.some(edge => 
                (edge.source === i && edge.target === i + 1) || 
                (edge.source === i + 1 && edge.target === i)
            );
            
            if (!connected) {
                this.edges.push({
                    source: i,
                    target: i + 1,
                    strength: this.edgeStrength,
                    length: this.canvas.width * 0.13,
                    color: 'rgba(255, 255, 255, 0.2)'
                });
            }
        }
        
        // Añadir algunas conexiones adicionales aleatorias para una red más densa
        const extraConnections = Math.floor(this.nodes.length * 0.5);
        for (let i = 0; i < extraConnections; i++) {
            const source = Math.floor(Math.random() * this.nodes.length);
            let target = Math.floor(Math.random() * this.nodes.length);
            
            // Asegurar que no sea el mismo nodo
            while (source === target) {
                target = Math.floor(Math.random() * this.nodes.length);
            }
            
            // Verificar que esta conexión no exista ya
            const connectionExists = this.edges.some(edge => 
                (edge.source === source && edge.target === target) || 
                (edge.source === target && edge.target === source)
            );
            
            if (!connectionExists) {
                this.edges.push({
                    source: Math.min(source, target),
                    target: Math.max(source, target),
                    strength: this.edgeStrength,
                    length: this.canvas.width * 0.15,
                    color: 'rgba(255, 255, 255, 0.2)'
                });
            }
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Verificar si el cursor está sobre algún nodo con mayor tolerancia para rectangulos
        let hoveredNode = null;
        for (const node of this.nodes) {
            // Calcular las dimensiones del rectángulo del nodo
            const width = node.radius * 3.5;
            const height = node.radius * 1.5;
            
            // Verificar si el cursor está dentro del rectángulo del nodo con tolerancia adicional
            if (
                mouseX >= node.x - width/2 - this.hoverTolerance && 
                mouseX <= node.x + width/2 + this.hoverTolerance && 
                mouseY >= node.y - height/2 - this.hoverTolerance && 
                mouseY <= node.y + height/2 + this.hoverTolerance
            ) {
                hoveredNode = node;
                break;
            }
        }
        
        // Actualizar cursor y mostrar info si hay nodo bajo el cursor
        if (hoveredNode) {
            this.canvas.style.cursor = 'pointer';
            this.showNodeInfo(hoveredNode, event.clientX, event.clientY);
        } else {
            this.canvas.style.cursor = 'default';
            this.hideNodeInfo();
        }
        
        this.hoveredNode = hoveredNode;
    }
    
    handleClick(event) {
        if (this.hoveredNode && !this.transitionActive) {
            this.selectedNode = this.hoveredNode;
            this.transitionToProject(this.selectedNode.project.url);
        }
    }
    
    showNodeInfo(node, x, y) {
        const project = node.project;
        this.nodeInfo.innerHTML = `
            <strong>${project.title}</strong>
            <p>${project.description}</p>
        `;
        
        this.nodeInfo.style.display = 'block';
        // Posicionar el cuadro de información cerca del cursor
        const infoWidth = this.nodeInfo.offsetWidth;
        const infoHeight = this.nodeInfo.offsetHeight;
        
        // Ajustar posición para que no se salga de la ventana
        let posX = x + 15;
        let posY = y + 15;
        
        if (posX + infoWidth > window.innerWidth) {
            posX = x - infoWidth - 15;
        }
        
        if (posY + infoHeight > window.innerHeight) {
            posY = y - infoHeight - 15;
        }
        
        this.nodeInfo.style.left = posX + 'px';
        this.nodeInfo.style.top = posY + 'px';
    }
    
    hideNodeInfo() {
        this.nodeInfo.style.display = 'none';
    }
    
    transitionToProject(url) {
        this.transitionActive = true;
        const transition = document.querySelector('.page-transition');
        
        // Activar transición
        transition.classList.add('active');
        
        // Navegar a la página después de la transición
        setTimeout(() => {
            window.location.href = url;
        }, 600);
    }
    
    update() {
        // Incrementar contador de tiempo para el movimiento continuo
        this.time += 0.01;
        
        // Aplicar fuerzas para posicionar los nodos
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            
            // Resetear aceleración
            let fx = 0;
            let fy = 0;
            
            // Añadir movimiento continuo sutil
            if (this.continousMovement) {
                // Movimiento ondulatorio único para cada nodo basado en su posición inicial
                const nodeId = i;
                const phaseX = this.time + nodeId * 0.3;
                const phaseY = this.time + nodeId * 0.5;
                
                // Fuerzas de movimiento continuo (más sutiles)
                const continuousFx = Math.sin(phaseX) * 0.1;
                const continuousFy = Math.cos(phaseY) * 0.1;
                
                fx += continuousFx;
                fy += continuousFy;
            }
            
            // Fuerza de repulsión entre nodos
            for (let j = 0; j < this.nodes.length; j++) {
                if (i !== j) {
                    const other = this.nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        // Fuerza inversamente proporcional al cuadrado de la distancia
                        const force = this.repulsionStrength / (distance * distance);
                        fx += (dx / distance) * force;
                        fy += (dy / distance) * force;
                    }
                }
            }
            
            // Fuerza de atracción para las conexiones
            for (const edge of this.edges) {
                let source, target;
                
                if (edge.source === i) {
                    source = node;
                    target = this.nodes[edge.target];
                } else if (edge.target === i) {
                    source = node;
                    target = this.nodes[edge.source];
                } else {
                    continue;
                }
                
                const dx = source.x - target.x;
                const dy = source.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Fuerza basada en la ley de Hooke (resorte)
                    const force = (distance - edge.length) * edge.strength;
                    fx -= (dx / distance) * force;
                    fy -= (dy / distance) * force;
                }
            }
            
            // Fuerza de atracción hacia el centro
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const dx = node.x - centerX;
            const dy = node.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Fuerza proporcional a la distancia al centro
            fx -= dx * distance * this.centerAttraction;
            fy -= dy * distance * this.centerAttraction;
            
            // Aplicar aceleración con amortiguación
            node.vx = node.vx * this.damping + fx;
            node.vy = node.vy * this.damping + fy;
            
            // Actualizar posición
            node.x += node.vx;
            node.y += node.vy;
            
            // Limitar posición dentro del canvas con margen
            const margin = node.radius * 2;
            if (node.x < margin) {
                node.x = margin;
                node.vx *= -0.5; // Rebote suave
            }
            if (node.x > this.canvas.width - margin) {
                node.x = this.canvas.width - margin;
                node.vx *= -0.5; // Rebote suave
            }
            if (node.y < margin) {
                node.y = margin;
                node.vy *= -0.5; // Rebote suave
            }
            if (node.y > this.canvas.height - margin) {
                node.y = this.canvas.height - margin;
                node.vy *= -0.5; // Rebote suave
            }
        }
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar conexiones
        this.drawEdges();
        
        // Dibujar nodos
        this.drawNodes();
    }
    
    drawEdges() {
        // Primero, dibujar todas las conexiones normales
        for (const edge of this.edges) {
            const source = this.nodes[edge.source];
            const target = this.nodes[edge.target];
            
            this.ctx.beginPath();
            this.ctx.moveTo(source.x, source.y);
            this.ctx.lineTo(target.x, target.y);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // Luego, resaltar las conexiones relacionadas con el nodo sobre el que está el cursor
        if (this.hoveredNode) {
            for (const edge of this.edges) {
                if (edge.source === this.hoveredNode.id || edge.target === this.hoveredNode.id) {
                    const source = this.nodes[edge.source];
                    const target = this.nodes[edge.target];
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(source.x, source.y);
                    this.ctx.lineTo(target.x, target.y);
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawNodes() {
        // Dibujar nodos
        for (const node of this.nodes) {
            // Calcular dimensiones
            const width = node.radius * 3.5;
            const height = node.radius * 1.5;
            const x = node.x - width/2;
            const y = node.y - height/2;
            const cornerRadius = 5;
            
            // Dibujar sombra para todos los nodos
            this.ctx.save();
            if (node === this.hoveredNode) {
                this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            } else {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 8;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 2;
            }
            
            // Dibujar rectángulo redondeado
            this.ctx.beginPath();
            this.roundRect(this.ctx, x, y, width, height, cornerRadius);
            
            // Aplicar estilo según estado
            if (node === this.hoveredNode) {
                // Estilo cuando el cursor está encima
                this.ctx.fillStyle = '#444';
            } else {
                // Estilo normal - más oscuro y sólido como en la imagen
                this.ctx.fillStyle = '#222';
            }
            
            this.ctx.fill();
            
            // Borde del nodo
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            this.ctx.restore();
            
            // Dibujar nombre del proyecto en el nodo
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '13px Roboto';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Usar nombre corto - simplificado para que se parezca a la imagen
            // Convertir nombre de proyecto a nombres cortos como en la imagen de referencia
            let displayText = this.getShortName(node.project.title);
            this.ctx.fillText(displayText, node.x, node.y);
        }
    }
    
    // Función para obtener un nombre corto para los nodos
    getShortName(fullTitle) {
        // Mapeo de nombres según la imagen de referencia
        const nameMap = {
            'Audio Visualizer': 'Audio',
            'Forma Semi-Orgánica': 'Forma',
            'Parallax Form': 'Parallax',
            'Teseracto': 'Teseracto',
            'Cubo Interactivo': 'Cubo',
            'Partículas Interactivas': 'Partículas',
            'Generador de Átomos': 'Generador',
            'Efecto Píxel': 'Efecto',
            'Efecto Rama': 'Efecto',
            'Triángulo de Sierpinski': 'Triángulo'
        };
        
        return nameMap[fullTitle] || fullTitle.split(' ')[0];
    }
    
    // Función auxiliar para dibujar rectángulos redondeados
    roundRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        return ctx;
    }
    
    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    getRandomColor() {
        // Generar colores en tonos azul-cian
        const h = 180 + Math.random() * 40; // Tonos entre azul y cian
        const s = 70 + Math.random() * 30;  // Saturación alta
        const l = 40 + Math.random() * 20;  // Luminosidad media
        
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    lightenColor(color, amount) {
        // Función para aclarar un color HSL
        const hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(color);
        if (hsl) {
            const h = parseInt(hsl[1]);
            const s = parseFloat(hsl[2]);
            const l = Math.min(100, parseFloat(hsl[3]) + amount * 100);
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
        return color;
    }
}

// Inicializar la página cuando se carga
document.addEventListener('DOMContentLoaded', () => {
    // Definir proyectos
    const projects = [
        {
            title: 'Audio Visualizer',
            description: 'Visualizador de audio interactivo que responde a la música',
            url: 'pages/project-audio-visualizer.html',
            jsFile: 'scripts/audio-visualizer.js'
        },
        {
            title: 'Forma Semi-Orgánica',
            description: 'Forma orgánica generativa que evoluciona con el tiempo',
            url: 'pages/project-semi-organic-shape.html',
            jsFile: 'scripts/semi-organic-shape.js'
        },
        {
            title: 'Parallax Form',
            description: 'Formulario 3D con efecto parallax',
            url: 'pages/project-parallax-form.html',
            jsFile: 'scripts/parallax-form.js'
        },
        {
            title: 'Teseracto',
            description: 'Visualización 4D de un teseracto (hipercubo)',
            url: 'pages/project-teseract.html',
            jsFile: 'scripts/teseract.js'
        },
        {
            title: 'Cubo Interactivo',
            description: 'Cubo 3D interactivo con efectos de iluminación',
            url: 'pages/project-interactive-cube.html',
            jsFile: 'scripts/interactive-cube.js'
        },
        {
            title: 'Partículas Interactivas',
            description: 'Sistema de partículas que responde al movimiento del cursor',
            url: 'pages/project-interactive-particles.html',
            jsFile: 'scripts/interactive-particles.js'
        },
        {
            title: 'Generador de Átomos',
            description: 'Simulación de estructuras atómicas en movimiento',
            url: 'pages/project-generate-atoms.html',
            jsFile: 'scripts/generate-atoms.js'
        },
        {
            title: 'Efecto Píxel',
            description: 'Efecto de pixelación dinámica para imágenes',
            url: 'pages/project-pixel-effect.html',
            jsFile: 'scripts/pixel-effect.js'
        },
        {
            title: 'Efecto Rama',
            description: 'Simulación de crecimiento orgánico tipo ramificación',
            url: 'pages/project-branch-effect.html',
            jsFile: 'scripts/branch-effect.js'
        },
        {
            title: 'Triángulo de Sierpinski',
            description: 'Visualización fractal del triángulo de Sierpinski',
            url: 'pages/project-sierpinski-triangle.html',
            jsFile: 'scripts/sierpinski-triangle.js'
        }
    ];
    
    // Crear el grafo de proyectos
    const graph = new ProjectGraph('graph-canvas', projects);
    
    // Gestionar transición de entrada en la página
    const transition = document.querySelector('.page-transition');
    if (transition) {
        transition.classList.add('active');
        setTimeout(() => {
            transition.classList.remove('active');
        }, 100);
    }
});

// Función para realizar transición de página
function navigateTo(url) {
    const transition = document.querySelector('.page-transition');
    
    // Activar transición
    transition.classList.add('active');
    
    // Navegar a la página después de la transición
    setTimeout(() => {
        window.location.href = url;
    }, 600);
    
    return false; // Evitar comportamiento predeterminado del enlace
}
