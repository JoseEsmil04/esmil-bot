import { addKeyword, EVENTS, MemoryDB as Database  } from "@builderbot/bot"
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { reset } from "~/activity/activity-flow"
import { geminiChat } from "./gemini-ia-service"
import { envs } from "~/config"
import { menuFlow } from "~/menu"
import { Keyword } from "~/interfaces"


let conversationHistory = []
export const promptsIAFlow = addKeyword<Provider, Database>([EVENTS.ACTION, 'botmenu2'])
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\n',
			'Pregúntame algo!',
			'Para volver al menu diga: *botmenu*'
		],
		{ capture: true },
		async (ctx, { flowDynamic, gotoFlow }) => {
			reset(ctx, gotoFlow, envs.INACTIVITY_MINUTES)

			const consulta = ctx.body

			if (consulta.toLocaleLowerCase() === Keyword.botmenu) {
				conversationHistory = []
				return gotoFlow(menuFlow)
			}

			const { sendMessage } = await geminiChat(
				envs.GEMINI_API_KEY,
				conversationHistory
			)

			const aiResponse = await sendMessage(consulta)
			conversationHistory.push(
				{ role: 'user', parts: [{ text: consulta }] },
				{ role: 'model', parts: [{ text: aiResponse }] }
			)

			await flowDynamic([{ body: aiResponse, delay: 1500 }])
		}
	)
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\n',
			'¿Tienes otra pregunta :)? Escribe:\n*(Si)* si deseas continuar\n*(No)* si deseas salir!'
		],
		{ capture: true },
		async (ctx, { fallBack, gotoFlow }) => {
			if (
				ctx.body.toLocaleLowerCase() !== Keyword.si &&
				ctx.body.toLocaleLowerCase() !== Keyword.no
			) {
				return fallBack('Respuesta no valida!, Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase() === Keyword.si)
			{
				return gotoFlow(promptsIAFlow)
			} else {
				conversationHistory = []
			}
		}
	).addAnswer(
		'Esta bien, regresemos al Menu Principal...',
		{ delay: 1000 },
		async (_, { gotoFlow }) => {
			conversationHistory = []
			return gotoFlow(menuFlow)
		}
	)