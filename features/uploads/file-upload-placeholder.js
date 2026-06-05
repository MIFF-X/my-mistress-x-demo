import { createButton } from "../ui/button.js";
import { createCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

export function createFileUploadPlaceholder({ onUpload } = {}) {
  const file = createFormField({ label: "Choose file", type: "file", helper: "Placeholder for profile images, PPV media, stickers, badges, proof uploads, and content drops." });
  const title = createFormField({ label: "Title", placeholder: "Asset title / content name" });
  const category = createFormField({
    label: "Category",
    type: "select",
    options: ["Profile", "PPV", "Sticker", "Badge", "Rolodex Card", "Proof", "Store", "SMM / Blog"],
  });
  const submit = createButton({ label: "Upload Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-page mx-stack";
  form.appendChild(
    createCard({
      eyebrow: "Uploads",
      title: "File upload placeholder",
      description: "Starter surface for later CDN/media storage, moderation checks, watermarking, and content lifecycle wiring.",
      icon: "📤",
    }),
  );
  form.appendChild(
    createFormSection({
      title: "Upload metadata",
      description: "Ready for media provider, asset packs, transparent PNG logos, GIF decks, and favicon workflows.",
      fields: [file, title, category],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onUpload?.({ file: file.control.files?.[0], title: title.control.value, category: category.control.value });
  });

  return form;
}
