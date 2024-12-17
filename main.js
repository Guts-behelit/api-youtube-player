const fs = require('fs');
const path = require('path');
const ColorThief = require('colorthief');
const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();  // Carga las variables de entorno desde el archivo .env
const PORT = process.env.PORT || 3000;  

const corsOptions = {
  origin: ["https://youvideo.vercel.app"], // Agrega los dominios permitidos
  methods: ["GET"],
  credentials: false,
};

app.use(cors(corsOptions));


app.get('/color-image', async (req, res) => {
    const imageUrl = req.query.url; // Leer la URL de los parámetros de consulta

    if (!imageUrl) {
        return res.status(400).json({ error: 'La URL de la imagen es requerida.' });
    }

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

app.get('/search-videos',async (req, res)=>{
let { search } = req.query;

if(!search){
  res.status(404).json({
    succes:false,
    message:'falta el parametro "search" en la consulta '
  })
}
try {
  const API_KEY = process.env.API_KEY_SEARCH_VIDEOS;
  const API_URL_SEARCH_VIDEO = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${search}&key=${API_KEY}&maxResults=20`;
  const response = await axios.get(API_URL_SEARCH_VIDEO);
  
  res.status(200).json(response.data); 

} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error fetching data" });
}
});

app.get('/videos-related', async (req, res) => {
  const { id } = req.query;

  // Validar si el parámetro 'id' está presente
  if (!id) {
    return res.status(404).json({
      success: false, // Corregido el typo
      message: 'Falta el parámetro "id" en la consulta',
    });
  }

  try {
    const URL_VIDEO_RELATED = `https://youtube-v3-alternative.p.rapidapi.com/related?id=${id}&geo=US&lang=en`;
    const API_KEY_RELATED = process.env.API_KEY_VIDEOS_RELATED;
    const urlTemporal = 'https://youtube-v3-alternative.p.rapidapi.com/related?id=YlUKcNNmywk&geo=US&lang=en'
    // Validar si la API Key está configurada
    if (!API_KEY_RELATED) {
      return res.status(500).json({
        success: false,
        message: 'La API_KEY_VIDEOS_RELATED no está configurada.',
      });
    }

    const options = {
      headers: {
        'x-rapidapi-key': API_KEY_RELATED,
        'x-rapidapi-host': 'youtube-v3-alternative.p.rapidapi.com'
      },
    };

    // Realizar la solicitud con Axios
    const response = await axios.get(URL_VIDEO_RELATED, options);

    // Enviar solo los datos relevantes en la respuesta
    res.status(200).json({
      success: true,
      data: response.data.data,
    });
  } catch (error) {
    console.error(error);

    // Mejorar el manejo de errores
    const errorMessage = error.response?.data || 'Error al obtener los datos.';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

app.listen(PORT,()=>{
    console.log('puerto funcionando',PORT)
})