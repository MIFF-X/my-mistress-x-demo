import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const STICKER_TYPES = [
  {
    id: "photo-cutout",
    label: "Photo Cutout Sticker",
    icon: "✂️",
    description: "Sticker made from a Mistress-approved image with transparent/cutout edge and optional white border.",
  },
  {
    id: "matching-item-sticker",
    label: "Matching Item Sticker",
    icon: "🧦",
    description: "Digital collectible tied to a purchased physical item, such as a matching pair or limited drop item.",
  },
  {
    id: "monthly-drop",
    label: "Monthly Drop Sticker",
    icon: "📅",
    description: "Scheduled sticker series released monthly with owned/missing album tracking.",
  },
  {
    id: "award-sticker",
    label: "Award Sticker",
    icon: "🏅",
    description: "Casual sticker given by a Mistress for behaviour, milestone, mood, appreciation, or personality moments.",
  },
  {
    id: "paid-custom-sticker",
    label: "Paid Custom Sticker",
    icon: "💎",
    description: "Custom sticker created for a paying Sub or sold as part of a premium styling/collector pack.",
  },
  {
    id: "album-completion-sticker",
    label: "Album Completion Sticker",
    icon: "📘",
    description: "Reward sticker unlocked when a Sub completes a sticker collection or monthly set.",
  },
];

const ALBUM_STATES = [
  "Not Started",
  "Collecting",
  "Missing Items",
  "Almost Complete",
  "Complete",
  "Reward Unlocked",
  "Archived Collection",
];

const STICKER_ACTIONS = [
  "Create sticker from uploaded image",
  "Apply cutout edge / white border",
  "Save sticker to Mistress collection",
  "Send sticker to linked Sub",
  "Sell sticker in collector marketplace",
  "Attach sticker to physical item purchase",
  "Schedule monthly sticker drop",
  "Track owned and missing album items",
  "Unlock collection completion reward",
  "Moderate or hide reported sticker",
];

export function createStickerCollectorSystemPlaceholder({ onBack, onCreateSticker } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Collectibles Plugin",
      title: "Sticker Collector System",
      description:
        "Sticker creation, sending, purchasing, monthly drops, albums, completion rewards, and matching digital stickers tied to physical item purchases.",
      icon: "🏷️",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Sticker rules captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Sticker Types", value: String(STICKER_TYPES.length), helper: "Cutouts, monthly drops, awards, matching item stickers", icon: "🏷️", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Editor", value: "Pending", helper: "Crop/cutout/white border tools", icon: "✂️", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Album Backend", value: "Pending", helper: "Owned/missing/completion records", icon: "📘", progress: 0 }));
  shell.appendChild(stats);

  const name = createFormField({ label: "Sticker name", placeholder: "Golden Crown Drop / Sock Pair #001 / Good Boy" });
  const stickerType = createFormField({
    label: "Sticker type",
    type: "select",
    options: STICKER_TYPES.map((type) => ({ label: type.label, value: type.id })),
  });
  const album = createFormField({ label: "Album / collection", placeholder: "May Drop / Worn Item Series / Awards" });
  const price = createFormField({
    label: "Price / rule",
    placeholder: "Free send / 5 credits / included with item / completion reward",
  });
  const releaseRule = createFormField({
    label: "Release rule",
    placeholder: "Now / monthly / tied to order / hidden reward",
  });
  const submit = createButton({ label: "Create Sticker Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Sticker setup test form",
      description: "This is a non-upload placeholder. It captures sticker metadata before real image upload, cutout editing, purchase, send, and album backend wiring are added.",
      fields: [name, stickerType, album, price, releaseRule],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateSticker?.({
      name: name.control.value,
      stickerType: stickerType.control.value,
      album: album.control.value,
      price: price.control.value,
      releaseRule: releaseRule.control.value,
    });
  });
  shell.appendChild(form);

  const typeGrid = document.createElement("div");
  typeGrid.className = "mx-grid mx-grid--cards";
  STICKER_TYPES.forEach((type) => {
    typeGrid.appendChild(
      createCard({
        eyebrow: "Sticker Type",
        title: type.label,
        description: type.description,
        icon: type.icon,
        meta: type.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Sticker Types",
      title: "Collectible sticker families",
      description: "Stickers can be free, paid, custom, award-based, tied to physical purchases, or released as part of monthly collections.",
      icon: "🎨",
    }),
  );
  shell.appendChild(typeGrid);

  const actionGrid = document.createElement("div");
  actionGrid.className = "mx-grid mx-grid--cards";
  STICKER_ACTIONS.forEach((action) => {
    actionGrid.appendChild(
      createCard({
        eyebrow: "Sticker Flow",
        title: action,
        description: "Placeholder step for future upload, editor, wallet, chat, store, album, notification, or moderation wiring.",
        icon: "✅",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Sticker Workflow",
      title: "From creation to collection",
      description: "The sticker system feeds chat, store, inventory, albums, collector rewards, profile display, and Mistress monetisation.",
      icon: "🔁",
    }),
  );
  shell.appendChild(actionGrid);

  const albumGrid = document.createElement("div");
  albumGrid.className = "mx-grid mx-grid--cards";
  ALBUM_STATES.forEach((state) => {
    albumGrid.appendChild(
      createCard({
        eyebrow: "Album State",
        title: state,
        description: "Placeholder album state for owned/missing item tracking, completion progress, rewards, or archive history.",
        icon: "📘",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Album Lifecycle",
      title: "Owned, missing, complete, rewarded",
      description: "Sub albums should show owned and missing stickers, progress bars, completed sets, and unlocked rewards.",
      icon: "📘",
    }),
  );
  shell.appendChild(albumGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Matching Item Rule",
      title: "Physical purchase can unlock a matching digital sticker",
      description:
        "When a Sub buys a specific item pair or limited product, the Mistress can attach a matching digital sticker version of that exact item as a collectible proof-of-purchase reward.",
      icon: "🧦",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Sticker ownership ledger path",
      description:
        "Mistress creates sticker → sticker passes visibility/moderation rules → Sub receives, buys, or unlocks sticker → ownership record is created → album progress updates → completion rewards and profile display update.",
      icon: "📒",
    }),
  );

  return shell;
}
