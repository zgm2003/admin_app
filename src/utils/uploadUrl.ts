export function buildPublicFileURL(
  bucketDomain: string | null | undefined,
  bucket: string,
  region: string,
  key: string,
): string {
  const fallbackDomain = `${bucket}.cos.${region}.myqcloud.com`
  let domain = (bucketDomain || fallbackDomain).trim().replace(/\/+$/, '')

  if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
    domain = `https://${domain.replace(/^\/+/, '')}`
  }

  return `${domain}/${encodeURI(key.replace(/^\/+/, ''))}`
}
