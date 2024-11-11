import ytSearch from 'yt-search'
import { envs, shortUrlFn } from '~/config'
import { UrlVideoInterface } from '~/interfaces'

const getUrlVideo = async (songName: string): Promise<UrlVideoInterface> => {
	try {
		const results = await ytSearch(songName)
		const video = results.videos[0] // Obtiene el primer resultado de video

		if (!video) throw 'No se encontró el video.'

		return {
			title: video.title,
			id: video.videoId,
			url: video.url
		}
	} catch (error) {
		throw `Error al buscar el video: ${error}`
	}
}

const fetchWithTimeout = async (url: string, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Configura el timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Ejecuta fetch con el controlador de timeout
    const response = await fetch(url, { ...options, signal });
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('La solicitud fue cancelada por timeout.');
    } else {
      console.error(`Error en la solicitud: ${error.message}`);
    }
    throw error;
  } finally {
    // Limpia el timeout
    clearTimeout(timeoutId);
  }
};

// Función 1: mp3urlToDownload
export const mp3urlToDownload = async (songName) => {
  const { title, id } = await getUrlVideo(songName);
  const fullUrlTofetch = `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`;

  try {
    const result = await fetchWithTimeout(fullUrlTofetch, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': envs.RAPID_API_KEY,
        'x-rapidapi-host': envs.YOUTUBE_MP36
      }
    });

    if (result.status !== 'ok' || !result.link) {
      return {
        title: 'No se encontró el video. Por favor, intenta con un nombre más específico.'
      };
    }

    const shortLink = await shortUrlFn(result.link);
    if (!shortLink) {
      return {
        title: 'Hubo un problema al generar el enlace de descarga. Intenta de nuevo.'
      };
    }

    return { title, audioUrl: `${shortLink}.mp3` };
  } catch (error) {
    console.error(`Error en mp3urlToDownload: ${error}`);
    return {
      title: 'Ocurrió un problema al procesar tu solicitud. Intenta de nuevo más tarde.'
    };
  }
};

// Función 2: mp3DownloadV2
export const mp3DownloadV2 = async (songName) => {
  const { title, url } = await getUrlVideo(songName);
  const fullUrlTofetch = `https://youtube-mp310.p.rapidapi.com/download/mp3?url=${url}`;

  try {
    const result = await fetchWithTimeout(fullUrlTofetch, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': envs.RAPID_API_KEY,
        'x-rapidapi-host': envs.YOUTUBE_MP310
      }
    });

    if (!result || !result.downloadUrl) {
      return {
        title: 'No se encontró el video. Por favor, intenta con un nombre más específico.'
      };
    }

    const shortLink = await shortUrlFn(result.downloadUrl);
    if (!shortLink) {
      return {
        title: 'No se pudo generar un enlace de descarga. Intenta de nuevo.'
      };
    }

    return { title, audioUrl: `${shortLink}.mp3` };
  } catch (error) {
    console.error(`Error en mp3DownloadV2: ${error}`);
    return {
      title: 'Ocurrió un problema al procesar tu solicitud. Intenta de nuevo más tarde.'
    };
  }
};

