import ytSearch from 'yt-search'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { envs, shortUrlFn } from '~/config';
import { UrlVideoInterface } from '~/interfaces';


// Configuración de Cloudinary
cloudinary.config({
  cloud_name: 'dh9juqxdq', // Sustituye con tu Cloud Name
  api_key: '979467981334317',       // Sustituye con tu API Key
  api_secret: envs.CLOUDINARY_API_SECRET, // Sustituye con tu API Secret
});

const getUrlVideo = async(songName: string): Promise<UrlVideoInterface> => {
  try {
    const results = await ytSearch(songName);
    const video = results.videos[0]; // Obtiene el primer resultado de video

    if (!video) throw 'No se encontró el video.';

    return {
      title: video.title,
      id: video.videoId,
    }
  } catch (error) {
    throw `Error al buscar el video: ${error}`
  }
}

export const mp3urlToDownload = async(songName: string) => {

  const { title, id } = await getUrlVideo(songName);
  const fullUrlTofetch = `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`;

  try {
    const response = await fetch(fullUrlTofetch, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': envs.RAPID_API_KEY,
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
      }
    });

    if(!response.ok) {
      throw new Error(`Error obteniendo la url mp3: ${response.status} ${response.statusText}`);
    }
 
    const result = await response.json();

    if(result.status === 'fail') {
      return { title: 'No se encontro el video, se mas especifico!' }
    }

    if (!result.link) {
      throw new Error('La API no devolvió un enlace de descarga.');
    }
    
    const shortLink = await shortUrlFn(result.link);
   
    if (!shortLink) {
      throw new Error('No se pudo acortar el enlace de descarga.');
    }

    
    const audioDir = 'src/tmp/audios';
    const audioPath = path.join(audioDir, 'audio.mp3');

    // Crear la carpeta temporal si no existe
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Descargar el archivo MP3
    await downloadMp3(result.link, audioPath);

    // Subir el archivo a Cloudinary
    const publicId = `mp3s/${id}`; // Usar un ID único basado en la canción
    const uploadResult = await uploadToCloudinary(audioPath, publicId);

    // Eliminar el archivo temporal después de subirlo
    await deleteMp3(audioPath);

    return { title, audioUrl: uploadResult.secure_url, publicId };

  } catch (error) {
    throw new Error(`Error: ${error}`)
  }
}

// Función para subir a Cloudinary
const uploadToCloudinary = async (mp3Url: string, publicId: string) => {
  try {
    // Subir el archivo MP3 a Cloudinary desde la URL
    const uploadResult = await cloudinary.uploader.upload(mp3Url, {
      resource_type: 'auto', // Detecta automáticamente el tipo de archivo (audio, imagen, video)
      public_id: publicId, // Usa un ID único para cada archivo
      fetch_format: 'auto', // Formato automático de descarga
      quality: 'auto', // Calidad automática
    });

    console.log('Archivo subido con éxito a Cloudinary:', uploadResult);
    return uploadResult; // Devuelve los detalles del archivo subido
  } catch (error) {
    console.error('Error subiendo el archivo a Cloudinary:', error);
    throw new Error('Error al subir el archivo a Cloudinary.');
  }
};

// Función para eliminar archivos de Cloudinary si fuera necesario
export const deleteMp3FromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log('Archivo eliminado de Cloudinary:', publicId);
  } catch (error) {
    console.error('Error al eliminar el archivo de Cloudinary:', error);
    throw new Error('Error al eliminar el archivo de Cloudinary.');
  }
};

async function downloadMp3(url: string, outputPath: string): Promise<void> {
  try {

    await fetch(url, { 'redirect': 'follow', 'method': 'GET' })
      .then(data => data.arrayBuffer())
      .then(buffer => {
        const buff = Buffer.from(buffer)
        // Guardar el Buffer en un archivo
        fs.writeFileSync(outputPath, buff);
      })


  } catch (error) {
    console.error(error)
    throw new Error(`Error en la descarga: ${error}`); 
  }
}

export const deleteMp3 = async(path: string): Promise<void> => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error(error)
    throw `${error}`
  }
}