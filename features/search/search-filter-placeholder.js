import { createButton } from "../ui/button.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

export function createSearchFilterPlaceholder({ onSearch } = {}) {
  const query = createFormField({ label: "Search", placeholder: "Search Mistresses, Subs, plugins, products, tags..." });
  const category = createFormField({
    label: "Category",
    type: "select",
    options: ["All", "Mistresses", "Subs", "Plugins", "Products", "Badges", "Stickers", "Live Rooms"],
  });
  const sort = createFormField({
    label: "Sort by",
    type: "select",
    options: ["Newest", "Popular", "Highest value", "Recently active", "A-Z"],
  });
  const submit = createButton({ label: "Apply Filters", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Search & filters",
      description: "Placeholder filter layer for discovery pages, marketplace grids, Rolodex cards, and plugin dashboards.",
      fields: [query, category, sort],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSearch?.({ query: query.control.value, category: category.control.value, sort: sort.control.value });
  });

  return form;
}
