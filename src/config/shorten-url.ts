import { shortenUrl } from "shaveurl";

export const shortUrlFn = async(link?: string): Promise<string> => {
  try {
    const short = await shortenUrl(link).then(sUrl => sUrl);
    return short
  } catch (error) {
    return `${error}`
  }
}