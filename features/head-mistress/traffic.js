export const HEADMISTRESS_TRAFFIC_CHANNELS = [
  {
    id: "public-home",
    label: "Public homepage",
    status: "Watched",
    detail: "Discovery modules, featured creators, and public conversion paths.",
  },
  {
    id: "my-gate",
    label: "My Gate",
    status: "Restricted",
    detail: "Build, test, and operator-only surfaces kept out of public routes.",
  },
  {
    id: "external",
    label: "External channels",
    status: "Pending OAuth",
    detail: "Blogspot and adult-extra modules remain Headmistress-controlled.",
  },
];

export function getHeadmistressTrafficChannels(overrides = []) {
  return overrides.length > 0 ? overrides : HEADMISTRESS_TRAFFIC_CHANNELS;
}

export function createHeadmistressTrafficPanel({ channels = HEADMISTRESS_TRAFFIC_CHANNELS } = {}) {
  const section = document.createElement("section");
  section.className = "panel headmistress-traffic-panel";

  const title = document.createElement("h2");
  title.innerText = "Traffic Oversight";

  const list = document.createElement("ul");
  list.className = "headmistress-control-list";

  getHeadmistressTrafficChannels(channels).forEach((channel) => {
    const item = document.createElement("li");
    item.dataset.channelId = channel.id;
    item.innerText = `${channel.label}: ${channel.status} - ${channel.detail}`;
    list.appendChild(item);
  });

  section.appendChild(title);
  section.appendChild(list);

  return section;
}
