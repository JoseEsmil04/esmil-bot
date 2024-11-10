import 'dotenv/config'
import env from 'env-var'


export const envs = {
  PEXELS_API_KEY: env.get('PEXELS_API_KEY').asString(),
  GEMINI_API_KEY: env.get('GEMINI_API_KEY').required().asString(),
  PORT: env.get('PORT').required().default(3008).asPortNumber(),
  PHONE_NUMBER: env.get('PHONE_NUMBER').asString(),
  RAPID_API_KEY: env.get('RAPID_API_KEY').required().asString(),
  STABBLE_DIFFUSION_KEY: env.get('STABBLE_DIFFUSION_KEY').required().asString(),
  INACTIVITY_MINUTES: env.get('INACTIVITY_MINUTES').required().asIntPositive(),
  CLOUDINARY_API_SECRET: env.get('CLOUDINARY_API_SECRET').required().asString()
}