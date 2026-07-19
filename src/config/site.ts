export const SITE_URL = "https://lamaisondesmontres.com";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
