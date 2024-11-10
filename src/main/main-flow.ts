import { envs } from "~/config";
import { MemoryDB as Database, EVENTS } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { addKeyword } from "@builderbot/bot";
import { reset, start } from "~/activity/activity-flow";
import { menuFlow } from "~/menu";
import { Keyword } from "~/interfaces";

export const mainFlow = addKeyword<Provider, Database>([
	'Esmil Bot',
	'esmilbot',
	'botesmil',
	'Bot Esmil'
])
.addAction(async(ctx, { gotoFlow, flowDynamic }) => {
	start(ctx, gotoFlow, envs.INACTIVITY_MINUTES)
  await flowDynamic([`Hola! _${ctx.name}_, Soy *EsmilBot* 👨🏽‍💻⚡\n`])
}).addAnswer(
		[
			'Soy un bot desarrollado por Jose Esmi!\n',
			`👉 Escribe *botmenu* para acceder al menu :)`,
			`Actualmente me encuentro en desarrollo.`,
			`mas funcionalidades coming soon!`
		].join('\n'),
		{ delay: 1200, capture: true, sensitive: true },
		async (ctx, { endFlow, gotoFlow }) => {
			reset(ctx, gotoFlow, envs.INACTIVITY_MINUTES);
			if (ctx.body.toLocaleLowerCase().includes(Keyword.botmenu)) {
				return gotoFlow(menuFlow)
			}

			return endFlow('Adios!, puedes volverme a llamar escribiendo *esmilbot*')
		}
	)

export const shortCutsFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
	.addAnswer([
		'Acceder directamente la opcion Generar Imagen: *botmenu1*',
		'Acceder directamente la opcion Preguntarle a la IA: *botmenu2*',
		'Acceder directamente la opcion Descargar Cancion: *botmenu3*'
	].join('\n'), { delay: 500 },
	(_, { endFlow }) => { return endFlow('Intenta Usarlos!')})