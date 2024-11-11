const deduccion = document.getElementById('deduccion');

// Esperamos a que la página cargue
window.onload = async () => {
    try {
        // Cargar el modelo de Teachable Machine
        const model = await tf.loadLayersModel('modeloIA/model.json');
        console.log("Modelo cargado exitosamente!");

        // Ahora que el modelo está cargado, podemos agregar la funcionalidad de predicción
        setupCameraAndPrediction(model);
    } catch (error) {
        console.error("Error al cargar el modelo:", error);
    }
};

// Función que se encargará de la captura de imagen y predicción
async function setupCameraAndPrediction(model) {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const slider = document.getElementById('slider1'); // Selecciona el slider

    // Cuando se haga clic en el botón de capturar imagen
    document.getElementById("captureButton").addEventListener("click", async () => {
        // Establecer el tamaño del canvas según el video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dibujar el video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir la imagen en tensor para poder procesarla
        let img = tf.browser.fromPixels(canvas);

        // Redimensionar la imagen y normalizarla para la predicción
        img = tf.image.resizeBilinear(img, [224, 224]); // Ajusta según el tamaño de entrada de tu modelo
        img = img.div(255.0); // Normaliza entre 0 y 1

        // Realizar la predicción
        const prediction = await model.predict(img.expandDims(0)); // Añade dimensión de batch

        // Obtén las probabilidades y la clase con mayor confianza
        const predictionArray = prediction.dataSync();
        const highestPredictionValue = Math.max(...predictionArray);
        const confidencePercentage = Math.round(highestPredictionValue * 100);
        
        // Actualiza el slider para reflejar el porcentaje de confianza
        slider.value = confidencePercentage;

        // Muestra en consola la clase y el porcentaje
        const classId = predictionArray.indexOf(highestPredictionValue);
        console.log(`Predicción: Clase ${classId}, Confianza: ${confidencePercentage}%`);
        if(classId==0 && confidencePercentage<=98){
            classId = 4;
        }
        if (confidencePercentage<80) {
            classId = 4;
        }
        switch(classId){
            case 0:
                deduccion.textContent = 'Mano: '+confidencePercentage+'%';
                break;
            case 1:
                deduccion.textContent = 'Oreja: '+confidencePercentage+'%';
                break;
            case 2:
                deduccion.textContent = 'Ojo: '+confidencePercentage+'%';
                break;
            case 3:
                deduccion.textContent = 'Cara: '+confidencePercentage+'%';
                break;
            case 4:
                deduccion.textContent = 'Desconocido';
                break;
        }
    });
}
