const canvas = document.getElementById('my-canvas');
const ctx = canvas.getContext('2d');

const img = new Image();
img.src = '../assets/images/vanishing-point.jpg'; // Replace with your image path

let brightnessArray = [];
let particlesArray = [];
let rgbArray = [];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.brightness = 0;
        this.velocity = Math.random() * 3 - 0.1;
        this.radius = Math.random() * 1.5 + 1;
    }

    update(){
        this.y += this.velocity;
        if(this.y >= canvas.height){
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
        this.brightness = brightnessArray[Math.floor(this.y-1) * canvas.width + Math.floor(this.x)];
    }

    draw(){
        ctx.beginPath();
        // ctx.fillStyle se define en el bucle de animación para usar el color original
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}


img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Guardar brillo y color RGB de cada píxel
    for (let i = 0; i < imageData.data.length / 4; i++) {
        const red = imageData.data[i * 4];
        const green = imageData.data[i * 4 + 1];
        const blue = imageData.data[i * 4 + 2];
        const brightness = (red + green + blue) / 3;
        brightnessArray.push(brightness);
        rgbArray.push(`rgb(${red},${green},${blue})`);
    }

    for (let i = 0; i < 40000; i++) {
        particlesArray.push(new Particle());
    }

    // Limpiar el canvas después de obtener los datos de la imagen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const animate = () => {
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(particle => {
            particle.update();
            ctx.globalAlpha = particle.brightness * 0.002;
            // Obtener el color original del píxel correspondiente
            const colorIndex = Math.floor(particle.y - 1) * canvas.width + Math.floor(particle.x);
            ctx.fillStyle = rgbArray[colorIndex] || 'white';
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
};
