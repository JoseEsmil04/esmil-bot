// import ffmpeg from 'fluent-ffmpeg';
import ytSearch from 'yt-search'
// import fs from 'fs';
// import { dirname, join } from 'path';
// import { fileURLToPath } from 'url';

interface UrlVideoResponse {
  title: string
  id: string
}

export async function getUrlVideo(nombreCancion: string): Promise<UrlVideoResponse> {
  try {
    const resultados = await ytSearch(nombreCancion);
    const video = resultados.videos[0]; // Obtiene el primer resultado de video
    if (!video) {  
      throw 'No se encontró el video.';
    }

    return {
      title: video.title,
      id: video.videoId,
    }
  } catch (error) {
    throw `Error al buscar el video: ${error}`
  }
}


export const mp3urlToDownload = async(nombreCancion: string, key: string) => {

  const { title, id } = await getUrlVideo(nombreCancion);
  const fullUrlTofetch = `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`;

  try {
    const response = await fetch(fullUrlTofetch, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
      }
    });

    if(!response.ok) throw 'Error descargando la musica!'

    //todo: Audios on iphone..
    // const __filename = fileURLToPath(import.meta.url);
		// const __dirname = dirname(__filename);
		// const audiosPath = join(__dirname, 'audios', `audio.ogg`)
    
    // await convertirUrlAMp3(result.link, audiosPath)
		// 	.then(() => {
      // 		console.log('Archivo convertido exitosamente a OGG Opus:', audiosPath);
      // 	})
      // 	.catch((error) => {
        // 		console.error('Error en la conversión:', error);
        // 	});
        
        // return audiosPath
        
    const result = await response.json();
    return {title, result};

  } catch (error) {
    console.log(error)
    throw `Error: ${error}`
  }
}

//todo: Audios on iphone..
// // Función para convertir un flujo de datos desde URL a OGG Opus
// export async function convertirUrlAMp3(url: string, outputPath: string) {

//   return new Promise((resolve, reject) => {

//     ffmpeg(url)
//       .audioCodec('libopus')  // Usa el códec Opus
//       .toFormat('ogg')
//       .on('end', () => {
//         console.log('Conversión completada.');
//         resolve(outputPath);
//       })
//       .on('error', (err) => {
//         console.error('Error durante la conversión:', err);
//         reject(err);
//       })
//       .save(outputPath);  // Guarda el archivo convertido
//   });
// }		




