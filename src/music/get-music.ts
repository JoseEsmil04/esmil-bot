import ytSearch from 'yt-search';
import { envs, shortUrlFn } from '~/config';
import { UrlVideoInterface } from '~/interfaces';

export const getUrlVideo = async (songName: string): Promise<UrlVideoInterface> => {
	try {
		const results = await ytSearch(songName);
		const video = results.videos.at(0); // Obtiene el primer resultado de video

		if (!results) throw 'No se encontró el video.';

		return {
			title: video.title,
			id: video.videoId,
			url: video.url
		}
	} catch (error) {
		throw `Error al buscar el video: ${error}`;
	}
}

export const getMp4Video = async (songName: string): Promise<GetMp4VideoInterface> => {

	const { title, id } = await getUrlVideo(`${songName} Audio`); // audio to get lighter video
	const fullUrlTofetch = `https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${id}`;

	try {
		const response = await fetch(fullUrlTofetch, {
			method: 'GET',
			headers: {
				'x-rapidapi-key': envs.RAPID_API_KEY,
				'x-rapidapi-host': envs.YT_STREAM_API
			}
		})

		if (!response.ok) {
			throw new Error(
				`Error obteniendo la url mp3: ${response.status} ${response.statusText}`
			)
		}

		const result = await response.json();

		if (result.status !== 'OK') {
			return {
				title:
					'No se encontró el video. Por favor, intenta con un nombre más específico.'
			}
		}

		const videoUrl = await shortUrlFn(result.formats.at(0).url)

		if (!videoUrl) {
			return {
				title:
					'Hubo un problema al generar el enlace de descarga. Intenta de nuevo.'
			}
		}

		return { title, videoUrl }
	} catch (error) {
		console.error(`Error en mp3urlToDownload: ${error}`)

		return {
			title:
				'Ocurrió un problema al procesar tu solicitud. Intenta de nuevo más tarde.'
		}
	}
}