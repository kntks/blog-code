export type FlashMessageKind = "error" | "success";

export function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function buildPathWithMessage(
  pathname: string,
  kind: FlashMessageKind,
  message: string,
) {
  const targetUrl = new URL(pathname, "http://localhost");
  targetUrl.searchParams.set(kind, message);

  return `${targetUrl.pathname}${targetUrl.search}`;
}
