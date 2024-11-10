import ytSearch from 'yt-search'
import fs from 'fs';
import path from 'path';
import { envs, shortUrlFn } from '~/config';
import { UrlVideoInterface } from '~/interfaces';



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
    console.log({result})

    if(result.status === 'fail') {
      return { title: 'No se encontro el video, se mas especifico!' }
    }

    if (!result.link) {
      throw new Error('La API no devolvió un enlace de descarga.');
    }
    
    const shortLink = await shortUrlFn(result.link);
    console.log({shortLink})

    if (!shortLink) {
      throw new Error('No se pudo acortar el enlace de descarga.');
    }

    
    const audioDir = 'src/tmp/audios';

    // Crear la carpeta temporal si no existe
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const audioPath = path.join(audioDir, `${id}.mp3`);
    console.log({audioPath})
    await downloadMp3(result.link, audioPath);

    return { title, audioPath };

  } catch (error) {
    throw new Error(`Error: ${error}`)
  }
}

async function downloadMp3(url: string, outputPath: string): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log({ response })
      throw new Error(`Error en la descarga: ${response.status} ${response.statusText}`);
    }

    // Leer el ReadableStream y convertirlo en un Buffer
    const responseBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(responseBuffer);

    // Guardar el Buffer en un archivo
    fs.writeFileSync(outputPath, buffer);

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