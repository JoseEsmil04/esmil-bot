import { envs, shortUrlFn } from "~/config"
import { getUrlVideo } from "./get-music"

export const mp3urlToDownload = async (songName: string) => {
	const { title, id } = await getUrlVideo(songName)
	const fullUrlTofetch = `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`

	try {
		const response = await fetch(fullUrlTofetch, {
			method: 'GET',
			headers: {
				'x-rapidapi-key': envs.RAPID_API_KEY,
				'x-rapidapi-host': envs.YOUTUBE_MP36
			}
		})

		if (!response.ok) {
			throw new Error(
				`Error obteniendo la url mp3: ${response.status} ${response.statusText}`
			)
		}

		const result = await response.json()
		if (result.status !== 'ok' || !result.link) {
			return {
				title:
					'No se encontró el video. Por favor, intenta con un nombre más específico.'
			}
		}

		const shortLink = await shortUrlFn(result.link)

		if (!shortLink) {
			return {
				title:
					'Hubo un problema al generar el enlace de descarga. Intenta de nuevo.'
			}
		}

		return { title, audioUrl: shortLink }
	} catch (error) {
		console.error(`Error en mp3urlToDownload: ${error}`)

		return {
			title:
				'Ocurrió un problema al procesar tu solicitud. Intenta de nuevo más tarde.'
		}
	}
}