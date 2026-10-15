export const portfolioV2Base = "/works/portfolio-v2";

export function portfolioV2Path(path = "/") {
  if (path === "/") return portfolioV2Base;

  return `${portfolioV2Base}${path.startsWith("/") ? path : `/${path}`}`;
}
