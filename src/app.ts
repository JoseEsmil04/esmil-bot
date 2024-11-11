import {
	createBot,
	createProvider,
	createFlow,
} from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import cors from 'cors'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { activityFlow } from './activity/activity-flow'
import { promptsIAFlow } from './ia/prompts-ia-flow'
import { imageGenFlow } from './images/imageIA-flow'
import { getMusicFlow } from './music/getMusic-flow'
import { menuFlow } from './menu'
import { mainFlow, shortCutsFlow } from './main/main-flow'
import { envs } from './config'

const main = async () => {
	const adapterFlow = createFlow([
		mainFlow,
		menuFlow,
		imageGenFlow,
		promptsIAFlow,
		getMusicFlow,
		activityFlow,
		shortCutsFlow
	])

	const adapterProvider = createProvider(Provider)

	const adapterDB = new Database()

	const { handleCtx, httpServer } = await createBot({
		flow: adapterFlow,
		provider: adapterProvider,
		database: adapterDB
	})

	adapterProvider.server.use(cors())

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
		'/v1/blacklist',
		handleCtx(async (bot, req, res) => {
			const { number, intent } = req.body
			if (intent === 'remove') bot.blacklist.remove(number)
			if (intent === 'add') bot.blacklist.add(number)

			res.writeHead(200, { 'Content-Type': 'application/json' })
			return res.end(JSON.stringify({ status: 'ok', number, intent }))
		})
	)

	httpServer(envs.PORT)
}

main()
