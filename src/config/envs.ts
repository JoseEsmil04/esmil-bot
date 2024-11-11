import 'dotenv/config'
import env from 'env-var'

export const envs = {
  PEXELS_API_KEY: env.get('PEXELS_API_KEY').asString(),
  GEMINI_API_KEY: env.get('GEMINI_API_KEY').required().asString(),
  PORT: env.get('PORT').required().default(3008).asPortNumber(),
  RAPID_API_KEY: env.get('RAPID_API_KEY').required().asString(),
  INACTIVITY_MINUTES: env.get('INACTIVITY_MINUTES').required().asIntPositive(),
  YOUTUBE_MP310: env.get('YOUTUBE_MP310').required().asString(),
  YOUTUBE_MP36: env.get('YOUTUBE_MP36').required().asString(),
  AI_IMAGE_GENERATOR: env.get('AI_IMAGE_GENERATOR').required().asString(),
  CLOUDINARY_API_SECRET: env.get('CLOUDINARY_API_SECRET').required().asString(),
  CLOUD_NAME: env.get('CLOUD_NAME').required().asString(),
  API_KEY_CLOUDINARY: env.get('API_KEY_CLOUDINARY').required().asString()
}