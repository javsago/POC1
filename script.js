// Selecciona los elementos necesarios
const video = document.getElementById('cameraStream');
const captureButton = document.getElementById('captureButton');
const toggleCameraButton = document.getElementById('toggleCameraButton');
const countdownMessage = document.getElementById('countdownMessage');
const capturedImage = document.getElementById('capturedImage'); // Imagen capturada

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

let currentStream = null;
let countdownInterval = null; // Variable para almacenar el temporizador
let cameraIsOn = false; // Variable para controlar el estado de la cámara

// Pide permiso para acceder a la cámara y muestra el stream en el video
function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                currentStream = stream;
                video.srcObject = stream;
                video.style.display = 'block'; // Asegura que el video se muestre
                capturedImage.style.display = 'none'; // Asegura que la imagen esté oculta
                cameraIsOn = true; // La cámara está encendida
                toggleCameraButton.textContent = 'Apagar Cámara'; // Cambia el texto del botón
            })
            .catch(function(error) {
                console.error("Error al acceder a la cámara:", error);
            });
    } else {
        alert("Tu navegador no soporta el acceso a la cámara.");
    }
}

// Detener la cámara
function stopCamera() {
    if (currentStream) {
        const tracks = currentStream.getTracks();
        tracks.forEach(track => track.stop()); // Detiene todos los tracks del stream
    }
    video.style.display = 'none'; // Oculta el video
    capturedImage.style.display = 'none'; // Asegura que la imagen esté oculta
    cameraIsOn = false; // La cámara está apagada
    toggleCameraButton.textContent = 'Encender Cámara'; // Cambia el texto del botón
}

// Función para capturar la imagen después de un temporizador de 3 segundos
function captureImage() {
    countdownMessage.style.display = 'block'; // Muestra el mensaje de cuenta regresiva

    let remainingTime = 3; // Tiempo en segundos

    countdownMessage.textContent = remainingTime; // Muestra el valor inicial de 3 antes de que empiece la cuenta atrás

    // Si ya hay un temporizador activo, lo cancelamos
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Inicia el temporizador
    countdownInterval = setInterval(function() {
        remainingTime--; // Decrementa el tiempo

        if (remainingTime <= 0) {
            clearInterval(countdownInterval); // Detiene la cuenta regresiva
            countdownInterval = null; // Reinicia la variable para permitir un nuevo temporizador
            countdownMessage.style.display = 'none'; // Oculta el mensaje de cuenta regresiva

            // Captura la imagen
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.save(); // Guarda el estado actual del contexto
            context.scale(-1, 1); // Escala en el eje X para invertir
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL('image/png');

            // Detenemos la cámara
            stopCamera();

            // Reemplazamos el video con la imagen capturada
            capturedImage.src = imageUrl;
            video.style.display = 'none'; // Oculta el video
            capturedImage.style.display = 'block'; // Muestra la imagen
        } else {
            countdownMessage.textContent = remainingTime; // Actualiza el mensaje con los segundos restantes
        }
    }, 1000); // Cada segundo
}

// Función para alternar el estado de la cámara
toggleCameraButton.addEventListener('click', function() {
    if (cameraIsOn) {
        stopCamera(); // Si la cámara está encendida, la apagamos
    } else {
        startCamera(); // Si la cámara está apagada, la encendemos
    }
});

// Añadir evento al botón de captura
captureButton.addEventListener('click', function() {
    if (cameraIsOn) {
        captureImage(); // Solo permite capturar la imagen si la cámara está encendida
    } else {
        alert('Enciende la cámara primero.');
    }
});

// Inicializamos la cámara al cargar la página (pero la cámara está apagada por defecto)
window.onload = function() {
    stopCamera(); // Asegura que la cámara esté apagada al cargar la página
};
