import { addKeyword, MemoryDB as Database, EVENTS } from "@builderbot/bot"
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { reset, stop } from "~/activity/activity-flow"
import { envs } from "~/config/envs"
import { promptsIAFlow } from "~/ia/prompts-ia-flow"
import { stabbleDiffFlow } from "~/images/stabbleImage-flow"
import { getMusicFlow } from "~/music/getMusic-flow"
import { menuEsmilBot } from "./menu-esmilbot-view"
import { Keyword } from "~/interfaces"
import { shortCutsFlow } from "~/main/main-flow"


export const menuFlow = addKeyword<Provider, Database>([Keyword.botmenu],
  { sensitive: true }).addAnswer(menuEsmilBot,{ capture: true },   
	async (ctx, { gotoFlow, fallBack, endFlow }) => {
		reset(ctx, gotoFlow, envs.INACTIVITY_MINUTES)

		if (!['1', '2', '3', '4', '0'].includes(ctx.body)) {
			return fallBack('Respuesta no valida!')
		}

		switch (ctx.body) {
			case '1':
				return gotoFlow(stabbleDiffFlow)
			case '2':
				return gotoFlow(promptsIAFlow)
			case '3':
				return gotoFlow(getMusicFlow)
      case '4':
        return gotoFlow(shortCutsFlow)
			case '0':
				stop(ctx);
				return endFlow(`Adios ${ctx.name}, puedes volverme a llamar escribiendo *esmilbot*`)
			default:
				return gotoFlow(menuFlow)
		}
	}
)

