export function createSessionNotes() {
  const container = document.createElement("section");
  container.style.cssText = "max-width:640px;margin:20px auto;padding:16px;border-radius:12px;background:#151515;color:#fff;border:1px solid #2a2a2a;";

  const title = document.createElement("h2");
  title.textContent = "🗒️ Session Notes";
  title.style.marginTop = "0";

  const hint = document.createElement("p");
  hint.textContent = "Capture training notes, outcomes, and next actions for each session.";
  hint.style.color = "#bbb";

  const form = document.createElement("div");
  form.style.display = "grid";
  form.style.gap = "10px";

  const subInput = document.createElement("input");
  subInput.placeholder = "Sub name";
  subInput.style.cssText = "padding:10px;border-radius:8px;border:1px solid #333;background:#0f0f0f;color:#fff;";

  const noteInput = document.createElement("textarea");
  noteInput.placeholder = "Session note...";
  noteInput.rows = 4;
  noteInput.style.cssText = "padding:10px;border-radius:8px;border:1px solid #333;background:#0f0f0f;color:#fff;resize:vertical;";

  const tagInput = document.createElement("input");
  tagInput.placeholder = "Tags (comma separated): obedience, rewards, limits";
  tagInput.style.cssText = "padding:10px;border-radius:8px;border:1px solid #333;background:#0f0f0f;color:#fff;";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Save Note";
  addBtn.style.cssText = "padding:10px 14px;border:none;border-radius:8px;background:#00ffaa;color:#111;font-weight:700;cursor:pointer;";

  const list = document.createElement("div");
  list.style.marginTop = "14px";

  addBtn.onclick = () => {
    const subName = subInput.value.trim();
    const note = noteInput.value.trim();
    const tags = tagInput.value
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!subName || !note) {
      alert("Please add both sub name and note.");
      return;
    }

    const card = document.createElement("article");
    card.style.cssText = "padding:12px;border-radius:10px;background:#0e0e0e;border:1px solid #292929;margin-bottom:10px;";

    const heading = document.createElement("strong");
    heading.textContent = subName;

    const date = document.createElement("span");
    date.textContent = ` • ${new Date().toLocaleString()}`;
    date.style.color = "#888";
    date.style.fontSize = "12px";

    const noteText = document.createElement("p");
    noteText.textContent = note;
    noteText.style.marginBottom = tags.length ? "6px" : "0";

    card.appendChild(heading);
    card.appendChild(date);
    card.appendChild(noteText);

    if (tags.length) {
      const chipWrap = document.createElement("div");
      chipWrap.style.display = "flex";
      chipWrap.style.flexWrap = "wrap";
      chipWrap.style.gap = "6px";

      tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.textContent = `#${tag}`;
        chip.style.cssText = "font-size:12px;padding:3px 8px;border-radius:999px;background:#1f2f2a;color:#7bffda;";
        chipWrap.appendChild(chip);
      });

      card.appendChild(chipWrap);
    }

    list.prepend(card);
    subInput.value = "";
    noteInput.value = "";
    tagInput.value = "";
  };

  form.appendChild(subInput);
  form.appendChild(noteInput);
  form.appendChild(tagInput);
  form.appendChild(addBtn);

  container.appendChild(title);
  container.appendChild(hint);
  container.appendChild(form);
  container.appendChild(list);

  return container;
}
