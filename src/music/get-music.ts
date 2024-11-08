import ytSearch from 'yt-search'
import { shortUrlFn } from '~/helpers/shorten-url';
import { UrlVideoInterface } from '~/interfaces/urlVideo-interface';

export async function getUrlVideo(nombreCancion: string): Promise<UrlVideoInterface> {
  try {
    const results = await ytSearch(nombreCancion);
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

    if(!response.ok) throw 'Error descargando la musica!'

    //todo: Audios on iphone..  
    const result = await response.json();
    const shortLink = await shortUrlFn(result.link)

    return {title, shortLink};

  } catch (error) {
    throw `Error: ${error}`
  }
}