import ytSearch from 'yt-search'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { shortUrlFn } from '~/config';
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

export const mp3urlToDownload = async(songName: string, key: string) => {

  const { title, id } = await getUrlVideo(songName);
  const fullUrlTofetch = `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`;

  try {
    const response = await fetch(fullUrlTofetch, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
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

    const shortLink = await shortUrlFn(result.link) // Url Shortener
    const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const audioPath = path.join(__dirname, 'audios', `${id}.mp3`);

    await downloadMp3(shortLink, audioPath)

    return { title, audioPath };

  } catch (error) {
    throw new Error(`Error: ${error}`)
  }
}

const downloadMp3 = async(url: string, outputPath: string): Promise<void> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error en la descarga: ${response.status} ${response.statusText}`);
    }

    // Leer el ReadableStream y convertirlo en un Buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Guardar el Buffer en un archivo
    await fs.promises.writeFile(outputPath, buffer);
  } catch (error) {
    throw new Error(`Error en la descarga: ${error}`); 
  }
}

export const deleteMp3 = async(path: string): Promise<void> => {
  try {
    await fs.promises.unlink(path);
  } catch (error) {
    throw `${error}`
  }
}