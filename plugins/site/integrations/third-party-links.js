export const defaultThirdPartyLinks = [
  {
    id: 'mistress-x-blog',
    label: 'Mistress-X Blog',
    owner: 'HEADMISTRESS',
    enabled: false,
    url: '',
  },
  {
    id: 'my-adult-extra',
    label: 'My Adult Extra',
    owner: 'HEADMISTRESS',
    enabled: false,
    url: '',
  },
];

export function createThirdPartyLinkConfig(link = {}) {
  return {
    id: link.id ?? `third-party-${Date.now()}`,
    label: link.label ?? 'External Link',
    owner: String(link.owner ?? 'HEADMISTRESS').toUpperCase(),
    enabled: Boolean(link.enabled && link.url),
    url: link.url ?? '',
    imageUrl: link.imageUrl ?? '',
    placement: link.placement ?? 'homepage',
  };
}

export function listEnabledThirdPartyLinks(links = defaultThirdPartyLinks) {
  return links.map(createThirdPartyLinkConfig).filter((link) => link.enabled);
}
