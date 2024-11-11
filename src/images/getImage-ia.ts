import { envs } from "~/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: envs.CLOUD_NAME,
  api_key: envs.API_KEY_CLOUDINARY,
  api_secret: envs.CLOUDINARY_API_SECRET,
});

export const getImagefromImageGen = async (prompt: string) => {
  try {
    const response = await fetch('https://ai-image-generator10.p.rapidapi.com/image_gen_v2', {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': envs.RAPID_API_KEY,
        'x-rapidapi-host': envs.AI_IMAGE_GENERATOR
      },
      method: 'POST',
      body: JSON.stringify({
        "query": prompt
      })
    });

    if (!response.ok) throw new Error(`Error al generar la imagen: ${response.statusText}`);

    const data = await response.json();
    const base64Image = data.imageData;

    if (!base64Image) throw new Error('No se ha recibido una imagen válida');

    const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, "");

    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`, {
      folder: 'generated_images',
      public_id: `generated_image${Date.now()}`
    });

    return { 
      url: result.secure_url,
      publicId: result.public_id
    };
    

  } catch (err) {
    console.error(`Error: ${err.message}`);
    throw new Error(`Error consultando la API o manejando la imagen: ${err}`);
  }
}

export const deleteFile = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    if (result.result === 'ok') {
      return true;
    } else {
      console.error("No se pudo eliminar la imagen de Cloudinary");
      console.log(result)
      return false;
    }
  } catch (err) {
    console.error(`Error al borrar la imagen de Cloudinary: ${err.message}`);
    return false;
  }
}
