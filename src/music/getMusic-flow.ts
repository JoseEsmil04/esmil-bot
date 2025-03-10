import { envs } from '~/config'
import { addKeyword, EVENTS, MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { reset } from '~/activity/activity-flow'
import { menuFlow } from '~/menu'
import { Keyword } from '~/interfaces'
import { getMp4Video } from './get-music'

export const getMusicFlow = addKeyword<Provider, Database>([
	EVENTS.ACTION,
	'botmenu3'
])
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\nIntroduce el *Titulo* de la cancion y el *Cantante*..\n',
			'Se lo mas especifico posible por favor.',
			'Para volver al menu diga: *botmenu*'
		],
		{ capture: true },
		async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
			reset(ctx, gotoFlow, envs.INACTIVITY_MINUTES)
			if (ctx.body.toLocaleLowerCase() === Keyword.botmenu)
				return gotoFlow(menuFlow)

			const request = await getMp4Video(ctx.body)

			if (!request.videoUrl) {
				console.error('Error')
				return fallBack(request.title || 'No se pudo procesar tu solicitud.')
			}

			await flowDynamic([
				{
					body: request.title,
					delay: 500
				},
				{
					body: request.videoUrl,
					delay: 500
				},
				{
					delay: 500,
					body: 'Disfruta tu canción 🎶'
				}
			])
		}
	).addAnswer(
		'Quieres escuchar otra cancion? Escribe:\n*(Si)* si deseas continuar\n*(No)* si deseas salir!',
		{ capture: true, delay: 1000 },
		async (ctx, { fallBack, gotoFlow }) => {
			if (
				ctx.body.toLocaleLowerCase() !== Keyword.si &&
				ctx.body.toLocaleLowerCase() !== Keyword.no
			) {
				return fallBack('Respuesta no valida!, Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase() === Keyword.si)
				return gotoFlow(getMusicFlow)
			else return
		}
	)
	.addAnswer(
		'Esta bien, regresemos al Menu Principal...',
		{ delay: 1000 },
		async (_, { gotoFlow }) => {
			return gotoFlow(menuFlow)
		}
	)
