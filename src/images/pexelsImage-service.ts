// interface PexelsResponse {
//   body: string
//   media: string|null
// }

// export const getImageFromPexels = async(param: string, key: string): Promise<PexelsResponse> => {
//   try {
//     const urlImg = await fetch(`https://api.pexels.com/v1/search?query=${param}`, {
//       headers: {
//         'Authorization': key
//       }
//     });

//     if(!urlImg.ok) throw `Error conectando la Api! ${urlImg.status}`;

//     const data = await urlImg.json();

//     if (data.photos && data.photos.length > 0) {
//       const imageUrl = data.photos[0].src.original;

//       return {
//         body: "Aqui tiene la imagen!",
//         media: imageUrl
//       };
//     }
//   } catch (error) {
//     return {
//       body: `${error}`,
//       media: undefined
//     };
//   }
// }