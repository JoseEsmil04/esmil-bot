import { EVENTS, addKeyword, MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { BotContext, TFlow } from '@builderbot/bot/dist/types'

const timers = {}

export const activityFlow = addKeyword<Provider, Database>(
	EVENTS.ACTION
).addAction(async (_, { endFlow }) => {
	return endFlow(
		'El tiempo para responderme ha terminado.\nPuedes volverme a llamas escribiendo *esmilbot*'
	)
})

export const start = (
	ctx: BotContext,
	gotoFlow: (a: TFlow) => Promise<void>,
	ms: number
) => {
	timers[ctx.from] = setTimeout(() => {
		return gotoFlow(activityFlow)
	}, ms)
}

export const reset = (
	ctx: BotContext,
	gotoFlow: (a: TFlow) => Promise<void>,
	ms: number
) => {
	stop(ctx)
	if (timers[ctx.from]) {
		clearTimeout(timers[ctx.from])
	}
	start(ctx, gotoFlow, ms)
}

export const stop = (ctx: BotContext) => {
	if (timers[ctx.from]) {
		clearTimeout(timers[ctx.from])
	}
}
