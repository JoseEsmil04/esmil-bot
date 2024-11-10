import { addKeyword, EVENTS, MemoryDB as Database } from "@builderbot/bot"
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { reset } from "~/activity/activity-flow"
import { getImageStableDiffusion } from "./stabbleImage-service"
import { envs } from "~/config/envs"
import { Keyword } from "~/interfaces"
import { menuFlow } from "~/menu"


export const stabbleDiffFlow = addKeyword<Provider, Database>([EVENTS.ACTION, 'botmenu1'])
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\nIngrese una palabra clave para buscar la *Imagen*:',
			'Para volver al menu diga: *botmenu*'
		],
		{ capture: true },
		async (ctx, { flowDynamic, gotoFlow }) => {

			reset(ctx, gotoFlow, envs.INACTIVITY_MINUTES)

			const response = await getImageStableDiffusion(
				ctx.body,
				envs.STABBLE_DIFFUSION_KEY
			)

			if (ctx.body.toLocaleLowerCase() === Keyword.botmenu)
      {
        return gotoFlow(menuFlow)
      }

			await flowDynamic([
				{ body: 'Imagen generada!', media: response.output[0] }
			])
		}
	)
	.addAnswer(
		'Quieres buscar otra imagen? Escribe:\n*(Si)* si deseas continuar\n*(No)* si deseas salir!',
		{ capture: true, delay: 1000 },
		async (ctx, { fallBack, gotoFlow }) => {
			
			if (
				ctx.body.toLocaleLowerCase() !== Keyword.si &&
				ctx.body.toLocaleLowerCase() !== Keyword.no
			) {
				return fallBack('Respuesta no valida!, Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase() === Keyword.si)
				return gotoFlow(stabbleDiffFlow)
			else return
		}
	)
	.addAnswer(
		'Esta bien, regresemos al botmenu...',
		{ delay: 800 },
		async (_, { gotoFlow }) => {
			return gotoFlow(menuFlow)
		}
	)