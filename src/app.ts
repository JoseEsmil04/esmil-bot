import { createBot, createProvider, createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { geminiChat } from './ia/gemini-ai'
import { getImageFromPexels } from './images/get-image-pexels';
import 'dotenv/config'
import { menu } from './helpers/menu'

const PORT = process.env.PORT ?? 3008

const welcomeFlow = addKeyword<Provider, Database>(['Esmil Bot', 'esmilbot', 'botesmil', 'Bot Esmil'])
    .addAnswer(`Hola! Soy *EsmilBot* 👨🏽‍💻⚡\n`)
    .addAnswer(
        [
            'Soy un bot desarrollado por Jose Esmil!\n',
            `👉 Escribe ${'*menu*'} para acceder al menu :)`,
						`Actualmente me encuentro en desarrollo, mas funcionalidades coming soon :D`
        ].join('\n'),
        { delay: 1200, capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            if (ctx.body.toLocaleLowerCase().includes('menu')) {
              return gotoFlow(menuFlow)
            }
            await flowDynamic('Adios!')
        },
    )

//TODO: GET MUSIC
const getMusic = addKeyword<Provider, Database>(EVENTS.ACTION)
	.addAnswer('Musica en desarrollo... el vago de Esmil no termina esto', { capture: true }, async (ctx, { flowDynamic }) => {
	})

const flowConsultasIA = addKeyword<Provider, Database>(EVENTS.ACTION)
	.addAnswer(['*EsmilBot* 👨🏽‍💻⚡\n', 'Preguntame algo!'], { capture: true }, async (ctx, { flowDynamic }) => {
		const consulta = ctx.body;

		const answer = await geminiChat(process.env.GEMINI_API_KEY, consulta);
		await flowDynamic([
			{
				body: answer,
				delay: 1500
			}
		])
	}).addAnswer('Tienes otra pregunta :)? Escribe *(Si)* si deseas continuar,\n*(No)* si deseas salir!',
		{ capture: true },
		async (ctx, { fallBack, gotoFlow }) => {
			if (!ctx.body.toLocaleLowerCase().includes('si') && !ctx.body.toLocaleLowerCase().includes('no')) {
				return fallBack('Respuesta no valida!, Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase().includes('si')) return gotoFlow(flowConsultasIA)
			else return
		}
	).addAnswer('Esta bien, regresemos al menu...', { delay: 1000 }, async (_, { gotoFlow }) => {
		return gotoFlow(menuFlow)
	})

const flowPexelsImg = addKeyword<Provider, Database>(EVENTS.ACTION)
	.addAnswer('Ingrese una palabra clave para buscar la *Imagen*:', { capture: true },
		async (ctx, { flowDynamic }) => {
			const { body, media } = await getImageFromPexels(ctx.body, process.env.PEXELS_API_KEY)

			await flowDynamic([{ body, media }])
		}
	).addAnswer('Quieres buscar otra imagen?', { capture: true },
		async (ctx, { fallBack, gotoFlow }) => {
			if (!ctx.body.toLocaleLowerCase().includes('si') && !ctx.body.toLocaleLowerCase().includes('no')) {
				return fallBack('Respuesta no valida!, Escribe *Si* o *No*')
			}

			if (ctx.body.toLocaleLowerCase().includes('si')) return gotoFlow(flowPexelsImg)
			else return
		}
	).addAnswer('Esta bien, regresemos al menu...', { delay: 1000 }, async (_, { gotoFlow }) => {
		return gotoFlow(menuFlow)
	})

const menuFlow = addKeyword<Provider, Database>('menu').addAnswer(
	menu,
	{ capture: true },
	async (ctx, { gotoFlow, fallBack, endFlow }) => {
		if (!['1', '2', '3', '0'].includes(ctx.body)) {
			return fallBack('Respuesta no valida!')
		}

		switch (ctx.body) {
			case '1':
				return gotoFlow(flowPexelsImg)
			case '2':
				return gotoFlow(flowConsultasIA)
			case '3':
				return gotoFlow(getMusic)
			case '0':
				return endFlow('Hasta luego!, puedes volverme a llamar diciendo *esmilbot*')
			default:
				return gotoFlow(menuFlow)
		}
	}
)

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, menuFlow, flowPexelsImg, flowConsultasIA, getMusic])
    const adapterProvider = createProvider(Provider)

    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
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
