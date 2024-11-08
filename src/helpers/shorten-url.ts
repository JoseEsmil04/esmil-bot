import { shortenUrl } from "shaveurl";

export const shortUrlFn = async(link: string): Promise<string> => {
  return await shortenUrl(link).then(sUrl => sUrl);
}