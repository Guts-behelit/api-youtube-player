const fs = require('fs');
const path = require('path');
const ColorThief = require('colorthief');
const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;
const processImage = async () => {
  const imageURL = 'https://via.placeholder.com/300'; // Cambia esta URL por tu imagen

  try {
    // Paso 1: Descargar la imagen
    const response = await axios({
      url: imageURL,
      method: 'GET',
      responseType: 'arraybuffer', // Importante para descargar la imagen como buffer
    });

    // Paso 2: Guardar la imagen como un archivo temporal (opcional)
    const tempFilePath = path.resolve(__dirname, 'temp-image.jpg');
    fs.writeFileSync(tempFilePath, response.data);

    // Paso 3: Usar ColorThief para extraer el color
    const dominantColor = await ColorThief.getColor(tempFilePath);
    console.log('Dominant Color:', dominantColor);

    // Eliminar el archivo temporal (si se creó)
    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error('Error procesando la imagen:', error);
  }
};

//processImage();
app.use(cors()); // Esto habilita CORS para todas las rutas

app.get('/color-image', async (req, res) => {
    const imageUrl = req.query.url; // Leer la URL de los parámetros de consulta

    if (!imageUrl) {
        return res.status(400).json({ error: 'La URL de la imagen es requerida.' });
    }

    // Validar si la URL es válida
    /*const urlRegex = /^(http|https):\\/\\/[^\\s$.?#].[^\\s]*$/gm;
    if (!urlRegex.test(imageUrl)) {
        return res.status(400).json({ error: 'La URL proporcionada no es válida.' });
    }*/

    try {
        // Descargar la imagen como buffer
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(response.data);

        // Usar ColorThief para extraer el color
        const dominantColor = await ColorThief.getColor(imageBuffer);
        const palleteColor = await ColorThief.getPalette(imageBuffer,3);

        res.json({
            url: imageUrl,
            dominantColor:dominantColor,
            pallete:palleteColor
        });
    } catch (error) {
        console.error('Error al procesar la imagen:', error.message);
        res.status(500).json({ error: 'No se pudo procesar la imagen. Verifica la URL y el formato.' });
    }
});

app.listen(PORT,()=>{
    console.log('puerto funcionando')
})