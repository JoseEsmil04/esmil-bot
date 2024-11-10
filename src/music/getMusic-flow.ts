import { envs } from "~/config";
import { addKeyword, EVENTS, MemoryDB as Database } from "@builderbot/bot"
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { reset } from "~/activity/activity-flow";
import { menuFlow } from "~/menu";
import { Keyword } from "~/interfaces";
import { mp3urlToDownload, deleteMp3FromCloudinary } from "./get-music";


export const getMusicFlow = addKeyword<Provider, Database>([EVENTS.ACTION, 'botmenu3'])
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\nIntroduce el *Titulo* de la cancion y el *Cantante*..\n',
			'Se lo mas especifico posible por favor.',
			'Para volver al menu diga: *botmenu*'
		],
		{ capture: true },
		async (ctx, { gotoFlow, fallBack, flowDynamic, provider }) => {
			reset(ctx, gotoFlow, envs.INACTIVITY_MINUTES);
			if (ctx.body.toLocaleLowerCase() === Keyword.botmenu) return gotoFlow(menuFlow)

			const { title, audioUrl, publicId } = await mp3urlToDownload(ctx.body)

			if(!audioUrl) {
				return fallBack(title)
			}
			
			await provider.sendFile(ctx.key.remoteJid as string, audioUrl, title)
			await deleteMp3FromCloudinary(publicId)
			
			await flowDynamic([
				{
					delay: 500,
					body: '*EsmilBot* 👨🏽‍💻⚡\nDisfruta tu cancion :)'
				}
			])
		}
	).addAnswer(
		'Quieres bajar otra musica? Escribe:\n*(Si)* si deseas continuar\n*(No)* si deseas salir!',
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
		'Esta bien, regresemos al botmenu...',
		{ delay: 1000 },
		async (_, { gotoFlow }) => {
			return gotoFlow(menuFlow)
		}
	)