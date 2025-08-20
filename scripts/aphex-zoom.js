/**
 * Aphex Twin Infinite Zoom Animation
 * Controlador principal para la animación de zoom infinito
 */

class AphexZoomController {
    constructor() {
        this.container = null;
        this.isPaused = false;
        this.layers = [];
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.audioEnabled = false;
        
        this.svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
            <g id="Capa_2" data-name="Capa 2">
                <g id="Capa_1-2" data-name="Capa 1">
                    <path d="M640.11,401.11Q621.94,350,603.79,299a122,122,0,0,0-15.14-29.85c-12.66-17.93-29.1-30-48.88-35.93A96.09,96.09,0,0,0,512,229.55h-.1q-56.3,0-112.6,0H332.3q-61.49,0-123,0H209a82.24,82.24,0,0,0-12,.59a65.72,65.72,0,0,0-49.38,35.14,64.69,64.69,0,0,0-.39,59.65c12,23.75,32.7,36.49,59.78,36.84,17.54.23,35.36.19,52.6.14,10.77,0,21.9-.05,32.85,0h.23a62.75,62.75,0,0,0,33.67-9.73,103.63,103.63,0,0,0,21.18-17.77c3.67-4,7.28-8.14,10.77-12.14q3-3.41,5.94-6.79c.38-.42.75-.85,1.13-1.28a47,47,0,0,1,4.31-4.53c6.49-5.68,13.2-7.1,20.49-4.35s11.36,8.09,12.26,16.28c.43,3.91-.64,7.83-3.58,13.12-54.64,98.35-109.24,196.71-150.7,271.42a58.13,58.13,0,0,0-3.64,7.41,31.46,31.46,0,0,0,28.17,42.71c10.74.41,19.93-4,27.32-13.16,26-32.15,52.33-64.62,77.83-96,1.88-2.32,3.93-4.49,6.09-6.8l.61-.64a12.72,12.72,0,0,1,8.49-4.27c3.4-.29,7.41-.59,11.38-.68a55.75,55.75,0,0,0,52.73-67.17a62.74,62.74,0,0,0-8.46-19.88a25.39,25.39,0,0,1,42.7-27.47c.81,1.19,1.57,2.44,2.36,3.77L662.13,701.05l2.69,4.47c2.08,3.49,4.24,7.1,6.52,10.6a38.72,38.72,0,0,0,47.81,14.54c18.93-8.12,27.78-29.46,20.58-49.65C706.46,587.73,672.73,492.86,640.11,401.11ZM715.6,722.39a29.39,29.39,0,0,1-36.72-11.18c-2.18-3.35-4.3-6.89-6.34-10.31q-1.35-2.26-2.72-4.52L502,420.3l-.58-1c-.83-1.37-1.68-2.79-2.63-4.18A34.39,34.39,0,0,0,441,452.42a54.16,54.16,0,0,1,7.32,17.08,46.74,46.74,0,0,1-44.16,56.23c-4.2.1-8.38.41-11.91.71A21.67,21.67,0,0,0,378,533.52l-.59.64c-2.18,2.32-4.44,4.72-6.53,7.29-25.5,31.39-51.87,63.86-77.84,96-5.66,7-12,10.13-20,9.83a22.47,22.47,0,0,1-20.12-30.5,50,50,0,0,1,3.11-6.26c41.46-74.71,96.06-173.07,150.7-271.42,2.6-4.68,5.48-11,4.66-18.48-1.28-11.55-7.51-19.75-18-23.72s-20.62-1.83-29.59,6a54.49,54.49,0,0,0-5.18,5.4c-.35.41-.71.82-1.07,1.22-2,2.27-4,4.56-6,6.84-3.45,4-7,8.06-10.61,12a93.83,93.83,0,0,1-19.32,16.23,53.06,53.06,0,0,1-28.89,8.37h-.21c-11,0-22.12,0-32.9,0-17.2.05-35,.09-52.46-.14-23.85-.31-41.31-11-51.87-31.91a55.75,55.75,0,0,1,.35-51.43,56.79,56.79,0,0,1,42.69-30.38a73.86,73.86,0,0,1,10.67-.5h.35q61.48,0,123,0h66.95q56.31,0,112.61,0H512a87.47,87.47,0,0,1,25.24,3.27c18,5.4,32.48,16,44.11,32.5a113.06,113.06,0,0,1,14,27.68q18.16,51.06,36.32,102.13C664.25,495.88,698,590.75,731.26,684,737.61,701.86,727.94,717.1,715.6,722.39Z"/>
                    <path d="M864.63,274.84A451.4,451.4,0,1,0,900,450A448.51,448.51,0,0,0,864.63,274.84ZM450,892C206.28,892,8,693.72,8,450S206.28,8,450,8,892,206.28,892,450,693.72,892,450,892Z"/>
                </g>
            </g>
        </svg>`;
        
        this.colors = [
            '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
            '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'
        ];
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found');
            return;
        }

        this.createLogoLayers(6); // Reducido a 6 capas para evitar sobreposición
        this.setupEventListeners();
        this.startMouseTracking();
    }

    createLogoLayers(count = 6) {
        for (let i = 0; i < count; i++) {
            const logoLayer = document.createElement('div');
            logoLayer.className = 'logo-layer';
            logoLayer.innerHTML = this.svgContent;
            
            // Aplicar solo color blanco
            const svg = logoLayer.querySelector('svg');
            svg.style.fill = '#ffffff';
            
            // Espaciar más los delays para evitar sobreposición
            logoLayer.style.animationDelay = `${-i * 1.3}s`;
            
            this.container.appendChild(logoLayer);
            this.layers.push(logoLayer);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.body.classList.toggle('paused', this.isPaused);
    }

    changeSpeed(speed) {
        const grid = document.querySelector('.background-grid');
        let duration, gridDuration;
        
        switch(speed) {
            case 'slow':
                duration = '8s';
                gridDuration = '40s';
                break;
            case 'fast':
                duration = '2s';
                gridDuration = '10s';
                break;
            default:
                duration = '4s';
                gridDuration = '20s';
        }
        
        this.layers.forEach(layer => {
            layer.style.animationDuration = duration;
        });
        
        if (grid) {
            grid.style.animationDuration = gridDuration;
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'Digit1':
                    this.changeSpeed('slow');
                    break;
                case 'Digit2':
                    this.changeSpeed('normal');
                    break;
                case 'Digit3':
                    this.changeSpeed('fast');
                    break;
                case 'KeyA':
                    this.toggleAudio();
                    break;
            }
        });
    }

    startMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            if (this.isPaused) return;
            
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
            
            this.container.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });
    }

    async toggleAudio() {
        if (!this.audioEnabled) {
            try {
                await this.initAudio();
                this.audioEnabled = true;
                this.container.classList.add('audio-reactive');
                
                // Mostrar niveles de audio
                const audioLevels = document.getElementById('audioLevels');
                if (audioLevels) audioLevels.style.display = 'block';
                
                console.log('Audio habilitado - El logo se deformará con el sonido');
            } catch (error) {
                console.error('Error al habilitar audio:', error);
            }
        } else {
            this.audioEnabled = false;
            this.container.classList.remove('audio-reactive');
            
            // Ocultar niveles de audio
            const audioLevels = document.getElementById('audioLevels');
            if (audioLevels) audioLevels.style.display = 'none';
            
            if (this.audioContext) {
                this.audioContext.close();
            }
            // Resetear transformaciones
            this.resetAudioEffects();
            console.log('Audio deshabilitado');
        }
    }

    resetAudioEffects() {
        this.layers.forEach(layer => {
            const svg = layer.querySelector('svg');
            if (svg) {
                svg.style.transform = '';
                svg.style.opacity = '';
                svg.style.filter = '';
                
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                    path.style.transform = '';
                    path.style.strokeWidth = '';
                    path.style.stroke = '';
                    path.style.fill = '#ffffff';
                });
            }
        });
    }

    async initAudio() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.analyser.fftSize = 512; // Aumentado para mejor análisis
            this.analyser.smoothingTimeConstant = 0.8;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.animateWithAudio();
        } catch (error) {
            throw new Error('No se pudo acceder al micrófono');
        }
    }

    animateWithAudio() {
        if (!this.audioEnabled || !this.analyser || !this.dataArray) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getByteTimeDomainData(this.freqData);
        
        // Análisis de diferentes rangos de frecuencia
        const bassRange = this.getAverageVolume(0, 60); // Bajos
        const midRange = this.getAverageVolume(60, 170); // Medios
        const highRange = this.getAverageVolume(170, 255); // Agudos
        const overall = this.getAverageVolume(0, 255); // General
        
        const bassIntensity = bassRange / 255;
        const midIntensity = midRange / 255;
        const highIntensity = highRange / 255;
        const overallIntensity = overall / 255;
        
        // Actualizar UI de niveles de audio
        this.updateAudioLevels(bassIntensity, midIntensity, highIntensity);
        
        // Aplicar deformaciones a cada logo
        this.layers.forEach((layer, index) => {
            const svg = layer.querySelector('svg');
            if (svg) {
                this.applyAudioDeformation(svg, {
                    bass: bassIntensity,
                    mid: midIntensity,
                    high: highIntensity,
                    overall: overallIntensity,
                    index: index
                });
            }
        });
        
        // Modular la velocidad de animación según el audio
        const speedMultiplier = 1 + overallIntensity * 0.8;
        this.layers.forEach((layer, index) => {
            const baseDelay = -index * 1.3;
            const audioDelay = overallIntensity * 0.2;
            layer.style.animationDuration = `${8 / speedMultiplier}s`;
        });
        
        requestAnimationFrame(() => this.animateWithAudio());
    }

    updateAudioLevels(bass, mid, high) {
        const bassElement = document.getElementById('bassLevel');
        const midElement = document.getElementById('midLevel');
        const highElement = document.getElementById('highLevel');
        
        if (bassElement) bassElement.textContent = `${Math.round(bass * 100)}%`;
        if (midElement) midElement.textContent = `${Math.round(mid * 100)}%`;
        if (highElement) highElement.textContent = `${Math.round(high * 100)}%`;
    }

    getAverageVolume(startIndex, endIndex) {
        let sum = 0;
        const count = endIndex - startIndex;
        for (let i = startIndex; i < endIndex && i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / count;
    }

    applyAudioDeformation(svg, audioData) {
        const { bass, mid, high, overall, index } = audioData;
        
        // Crear transformaciones dinámicas basadas en audio
        let transform = '';
        
        // Deformación por bajos - escala vertical
        const bassScale = 1 + bass * 0.4;
        
        // Deformación por medios - escala horizontal
        const midScale = 1 + mid * 0.3;
        
        // Deformación por agudos - rotación sutil
        const highRotation = high * 10;
        
        // Skew basado en intensidad general
        const skewX = (overall - 0.5) * 15;
        const skewY = (bass - 0.5) * 10;
        
        // Vibración en altas frecuencias
        const vibrationX = high > 0.3 ? (Math.random() - 0.5) * high * 4 : 0;
        const vibrationY = high > 0.3 ? (Math.random() - 0.5) * high * 4 : 0;
        
        // Aplicar todas las transformaciones
        transform = `
            scale(${midScale}, ${bassScale})
            rotate(${highRotation}deg)
            skew(${skewX}deg, ${skewY}deg)
            translate(${vibrationX}px, ${vibrationY}px)
        `;
        
        svg.style.transform = transform;
        
        // Cambiar opacidad basada en intensidad
        const opacity = 0.7 + (overall * 0.3);
        svg.style.opacity = opacity;
        
        // Aplicar filtros adicionales para efectos extremos
        if (overall > 0.7) {
            // Efecto de "glitch" en volúmenes altos
            const glitchFilter = `
                contrast(${1 + overall * 0.5})
                blur(${overall > 0.9 ? (overall - 0.9) * 10 : 0}px)
            `;
            svg.style.filter = glitchFilter;
        } else {
            svg.style.filter = 'none';
        }
        
        // Deformación especial para el logo de Aphex Twin
        this.applyAphexDeformation(svg, audioData);
    }

    applyAphexDeformation(svg, audioData) {
        const { bass, mid, high, overall } = audioData;
        const paths = svg.querySelectorAll('path');
        
        paths.forEach((path, pathIndex) => {
            // Aplicar transformaciones específicas a cada path del logo
            let pathTransform = '';
            
            // Los bajos afectan más el path exterior (cara)
            if (pathIndex === 1) { // Path del círculo exterior
                const faceDeformation = 1 + bass * 0.2;
                pathTransform += `scale(${faceDeformation}) `;
            }
            
            // Los agudos afectan más los detalles internos
            if (pathIndex === 0) { // Path de los detalles internos
                const detailShake = high > 0.4 ? (Math.random() - 0.5) * high * 2 : 0;
                pathTransform += `translate(${detailShake}px, ${detailShake}px) `;
                
                // Deformación de sonrisa
                const smileStretch = 1 + mid * 0.3;
                pathTransform += `scaleX(${smileStretch}) `;
            }
            
            path.style.transform = pathTransform;
            
            // Variaciones de stroke-width basadas en audio
            if (overall > 0.5) {
                const strokeWidth = overall * 2;
                path.style.strokeWidth = `${strokeWidth}px`;
                path.style.stroke = '#ffffff';
                path.style.fill = 'none';
            } else {
                path.style.strokeWidth = '0';
                path.style.stroke = 'none';
                path.style.fill = '#ffffff';
            }
        });
    }

    addRandomLayers(count = 3) {
        for (let i = 0; i < count; i++) {
            const logoLayer = document.createElement('div');
            logoLayer.className = 'logo-layer';
            logoLayer.innerHTML = this.svgContent;
            
            // Solo color blanco
            const svg = logoLayer.querySelector('svg');
            svg.style.fill = '#ffffff';
            
            // Animación con delay aleatorio más espaciado
            logoLayer.style.animationDelay = `${Math.random() * -8}s`;
            logoLayer.style.animationDuration = `${6 + Math.random() * 4}s`;
            
            this.container.appendChild(logoLayer);
            this.layers.push(logoLayer);
            
            // Remover después de un tiempo
            setTimeout(() => {
                if (logoLayer.parentNode) {
                    logoLayer.parentNode.removeChild(logoLayer);
                    const index = this.layers.indexOf(logoLayer);
                    if (index > -1) {
                        this.layers.splice(index, 1);
                    }
                }
            }, 20000);
        }
    }

    cycleThroughEffects() {
        const effects = ['normal'];
        let currentEffect = 0;
        
        setInterval(() => {
            // Solo mantener el efecto normal - sin cambios de color
            document.body.style.filter = 'none';
            currentEffect = 0;
        }, 5000);
    }
}

// Hacer disponible globalmente
window.AphexZoomController = AphexZoomController;
