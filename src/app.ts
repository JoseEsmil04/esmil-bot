import 'dotenv/config'
import {
	createBot,
	createProvider,
	createFlow,
	addKeyword,
	EVENTS
} from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { geminiChat } from './ia/gemini-ai'
import { menu } from './helpers/menu'
import { mp3urlToDownload } from './music/get-music'
import { getImageStableDiffusion } from './images/get-image-stabble'

const PORT = process.env.PORT ?? 3008

const welcomeFlow = addKeyword<Provider, Database>([
	'Esmil Bot',
	'esmilbot',
	'botesmil',
	'Bot Esmil'
])
	.addAnswer(`Hola! Soy *EsmilBot* 👨🏽‍💻⚡\n`)
	.addAnswer(
		[
			'Soy un bot desarrollado por Jose Esmi!\n',
			`👉 Escribe ${'*botmenu*'} para acceder al menu :)`,
			`Actualmente me encuentro en desarrollo, mas funcionalidades coming soon!`
		].join('\n'),
		{ delay: 1200, capture: true },
		async (ctx, { endFlow, gotoFlow }) => {
			if (ctx.body.toLocaleLowerCase().includes('botmenu')) {
				return gotoFlow(menuFlow)
			}

			return endFlow('Adios!, puedes volverme a llamar escribiendo *esmilbot*')
		}
	)

const getMusicFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\nIntroduce el titulo de la cancion y el cantante..\n',
			'Mientras mas claro mejor jeje',
			'Para volver al menu diga: *botmenu*'
		],
		{ capture: true },
		async (ctx, { flowDynamic, gotoFlow }) => {
			if (ctx.body.toLocaleLowerCase() === 'botmenu') return gotoFlow(menuFlow)

			const { title, shortLink } = await mp3urlToDownload(
				ctx.body,
				process.env.RAPID_API_KEY
			)

			await flowDynamic([
				{ delay: 1200, body: `*Audio:* ${title}` },
				{ body: shortLink },
				{
					delay: 500,
					body: '*EsmilBot* 👨🏽‍💻⚡\nAccede al link y Disfruta tu cancion :)'
				}
			])
		}
	)
	.addAnswer(
		'Quieres bajar otra musica?\nEscribe *(Si)* si deseas continuar,\n*(No)* si deseas salir!',
		{ capture: true },
		async (ctx, { fallBack, gotoFlow }) => {
			if (
				!ctx.body.toLocaleLowerCase().includes('si') &&
				!ctx.body.toLocaleLowerCase().includes('no')
			) {
				return fallBack('Respuesta no valida!, Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase().includes('si'))
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

let conversationHistory = []

const promptsIAFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\n',
			'Pregúntame algo!',
			'Para volver al menu diga: *botmenu*'
		],
		{ capture: true },
		async (ctx, { flowDynamic, gotoFlow }) => {
			const consulta = ctx.body

			if (consulta.toLocaleLowerCase() === 'botmenu') {
				conversationHistory = []
				return gotoFlow(menuFlow)
			}

			const { sendMessage } = await geminiChat(
				process.env.GEMINI_API_KEY,
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
			'¿Tienes otra pregunta :)? Escribe *(Si)* si deseas continuar,\n*(No)* si deseas salir!'
		],
		{ capture: true },
		async (ctx, { fallBack, gotoFlow }) => {
			if (
				!ctx.body.toLocaleLowerCase().includes('si') &&
				!ctx.body.toLocaleLowerCase().includes('no')
			) {
				return fallBack('¡Respuesta no válida! Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase().includes('si')) {
				return gotoFlow(promptsIAFlow)
			} else {
				conversationHistory = []
			}
		}
	)
	.addAnswer(
		'Está bien, regresemos al botmenu...',
		{ delay: 1000 },
		async (_, { gotoFlow }) => {
			conversationHistory = []
			return gotoFlow(menuFlow)
		}
	)

const stabbleDiffFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
	.addAnswer(
		[
			'*EsmilBot* 👨🏽‍💻⚡\nIngrese una palabra clave para buscar la *Imagen*:',
			'Para volver al menu diga: *botmenu*'
		],
		{ capture: true },
		async (ctx, { flowDynamic, gotoFlow }) => {
			const response = await getImageStableDiffusion(
				ctx.body,
				process.env.STABBLE_DIFFUSION_KEY
			)
			if (ctx.body.toLocaleLowerCase() === 'botmenu') return gotoFlow(menuFlow)
			await flowDynamic([
				{ body: 'Imagen Generada!', media: response.output[0] }
			])
		}
	)
	.addAnswer(
		'Quieres buscar otra imagen? Escribe *(Si)* si deseas continuar,\n*(No)* si deseas salir!',
		{ capture: true },
		async (ctx, { fallBack, gotoFlow }) => {
			if (
				!ctx.body.toLocaleLowerCase().includes('si') &&
				!ctx.body.toLocaleLowerCase().includes('no')
			) {
				return fallBack('Respuesta no valida!, Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase().includes('si'))
				return gotoFlow(stabbleDiffFlow)
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

const menuFlow = addKeyword<Provider, Database>([
	'botmenu',
	'esmilmenu'
]).addAnswer(
	menu,
	{ capture: true },
	async (ctx, { gotoFlow, fallBack, endFlow }) => {
		if (!['1', '2', '3', '0'].includes(ctx.body)) {
			return fallBack('Respuesta no valida!')
		}

		switch (ctx.body) {
			case '1':
				return gotoFlow(stabbleDiffFlow)
			case '2':
				return gotoFlow(promptsIAFlow)
			case '3':
				return gotoFlow(getMusicFlow)
			case '0':
				return endFlow(
					'Hasta luego!, puedes volverme a llamar escribiendo *esmilbot*'
				)
			default:
				return gotoFlow(menuFlow)
		}
	}
)

const main = async () => {
	const adapterFlow = createFlow([
		welcomeFlow,
		menuFlow,
		stabbleDiffFlow,
		promptsIAFlow,
		getMusicFlow
	])
	const adapterProvider = createProvider(Provider)

	const adapterDB = new Database()

	const { handleCtx, httpServer } = await createBot({
		flow: adapterFlow,
		provider: adapterProvider,
		database: adapterDB
	})

	adapterProvider.server.post(
		'/v1/messages',
		handleCtx(async (bot, req, res) => {
			const { number, message, urlMedia } = req.body
			await bot.sendMessage(number, message, { media: urlMedia ?? null })
			return res.end('sended')
		})
	)

	adapterProvider.server.post(
		'/v1/register',
		handleCtx(async (bot, req, res) => {
			const { number, name } = req.body
			await bot.dispatch('REGISTER_FLOW', { from: number, name })
			return res.end('trigger')
		})
	)

	adapterProvider.server.post(
		'/v1/samples',
		handleCtx(async (bot, req, res) => {
			const { number, name } = req.body
			await bot.dispatch('SAMPLES', { from: number, name })
			return res.end('trigger')
		})
	)

	adapterProvider.server.post(
		'/v1/blacklist',
		handleCtx(async (bot, req, res) => {
			const { number, intent } = req.body
			if (intent === 'remove') bot.blacklist.remove(number)
			if (intent === 'add') bot.blacklist.add(number)

			res.writeHead(200, { 'Content-Type': 'application/json' })
			return res.end(JSON.stringify({ status: 'ok', number, intent }))
		})
	)

	httpServer(+PORT)
}

main()
