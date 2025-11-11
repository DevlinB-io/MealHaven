const recipeDialog = qs("#recipeDialog");
const recipeForm = qs("#recipeForm");
const recipeCancel = qs("#recipeCancelBtn");
const createBtn = qs("#createRecipeBtn");

// Open empty dialog
function openRecipeDialog() {
  if (!recipeDialog || !recipeForm) return;
  recipeForm.reset();
  delete recipeForm.dataset.editId; // (kept for future edit support)
  recipeDialog.showModal();
}

// Parse helpers
function parseList(text, splitter = /[\n,;]+/) {
  return (text || "")
    .split(splitter)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Save (handles optional image upload)
async function saveRecipeFromForm(ev) {
  ev.preventDefault();
  const fd = new FormData(recipeForm);
  const name = (fd.get("name") || "").trim();
  const ingredients = parseList(fd.get("ingredients"));
  const steps = parseList(fd.get("steps"), /\n+/);
  const category = (fd.get("category") || "Mixed Dishes/Meals").trim();
  const file = fd.get("image");

  // Read file -> data URL if provided
  const imageDataURL = await (async () => {
    if (file && file.size) {
      const reader = new FileReader();
      const p = new Promise((res) => {
        reader.onload = () => res(reader.result);
      });
      reader.readAsDataURL(file);
      return p;
    }
    // fallback: keep a placeholder or first sample image
    return "assets/placeholder.jpg";
  })();

  const rec = {
    id: uid("r"),
    image: imageDataURL,
    title: name,
    minutes: 20, // default, you can add a field later
    category,
    ingredients,
    steps,
    custom: true, // mark as user-created so Delete button shows
  };

  // Put new recipe at the top
  state.recipes = [rec, ...state.recipes];
  persist();
  recipeDialog.close();
  // Jump to Recipes so the user sees it immediately
  showView("recipes");
  renderRecipes();
  // small toast via notification center (if enabled)
  if (typeof MHNotify === "function")
    MHNotify("Recipe created", `"${name}" added to your recipes.`);
}

// Wire up
createBtn?.addEventListener("click", openRecipeDialog);
recipeCancel?.addEventListener("click", () => recipeDialog?.close());
recipeForm?.addEventListener("submit", saveRecipeFromForm);
