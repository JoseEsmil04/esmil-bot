
export const getImageStableDiffusion = async(prompt: string, key: string) => {

  try {
    const response = await fetch('https://stablediffusionapi.com/api/v3/text2img', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        "key": key,
        "prompt": prompt,
        "negative_prompt": null,
        "width": "512",
        "height": "512",
        "samples": "1",
        "num_inference_steps": "20",
        "seed": null,
        "guidance_scale": 7.5,
        "safety_checker": "yes",
        "multi_lingual": "no",
        "panorama": "no",
        "self_attention": "no",
        "upscale": "no",
        "embeddings_model": null,
        "webhook": null,
        "track_id": null
      })
    })

    if(!response.ok) throw new Error(`Error al generar la imagen: ${response.text}`);

    const data = await response.json();
    return data;

  } catch (err){
    throw new Error(`Error consultando la Api: ${err}`);
  }
}