export const portfolioV2Base = "/archive/portfolio-v2";

export function portfolioV2Path(path = "/") {
  if (path === "/") return portfolioV2Base;

  return `${portfolioV2Base}${path.startsWith("/") ? path : `/${path}`}`;
}
