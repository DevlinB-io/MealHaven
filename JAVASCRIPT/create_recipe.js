document.addEventListener("DOMContentLoaded", () => {
  // Helper: query selector
  const qs = (sel) => document.querySelector(sel);

  // Elements
  const recipeDialog = qs("#recipeDialog");
  const recipeForm = qs("#recipeForm");
  const recipeCancel = qs("#recipeCancelBtn");
  const createBtn = qs("#createRecipeBtn");

  // Open modal
  createBtn?.addEventListener("click", () => {
    recipeForm.reset();
    recipeDialog.showModal();
  });

  // Close modal
  recipeCancel?.addEventListener("click", () => recipeDialog.close());

  // Parse ingredients list
  function parseList(text, splitter = /[\n,;]+/) {
    return (text || "")
      .split(splitter)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Submit recipe
  recipeForm?.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const fd = new FormData(recipeForm);
    const name = (fd.get("name") || "").trim();
    const ingredients = parseList(fd.get("ingredients"));
    const instructions = (fd.get("instructions") || "").trim();
    const difficulty = fd.get("difficulty") || "EASY";
    const prep_time = fd.get("prep_time") || 0;
    const cook_time = fd.get("cook_time") || 0;
    const calories = fd.get("calories") || 0;
    const serving_size = fd.get("serving_size") || 1;
    const category = fd.get("category") || "Mixed Dishes/Meals";
    const file = fd.get("image");

    if (!name || !ingredients.length || !instructions) {
      alert("Please fill in recipe name, ingredients, and instructions.");
      return;
    }

    // Prepare FormData for PHP
    const postData = new FormData();
    postData.append("name", name);
    postData.append("ingredients", ingredients.join("\n"));
    postData.append("instructions", instructions);
    postData.append("difficulty", difficulty);
    postData.append("prep_time", prep_time);
    postData.append("cook_time", cook_time);
    postData.append("calories", calories);
    postData.append("serving_size", serving_size);
    postData.append("category", category);
    if (file && file.size) postData.append("image", file);

    const userId = window.state?.user_id;
    if (userId) postData.append("user_id", userId);

    try {
      const res = await fetch("../PHP/create_recipe.php", {
        method: "POST",
        body: postData,
      });

      if (res.ok) {
        alert("Recipe created successfully!");

        // Refresh recipes from database to include the new one
        if (typeof window.refreshRecipesFromDatabase === "function") {
          await window.refreshRecipesFromDatabase();
        } else {
          console.warn("refreshRecipesFromDatabase function not found");
          // Fallback: reload the page
          window.location.reload();
        }

        recipeForm.reset();
        recipeDialog.close();
      } else {
        // Handle HTTP errors (like 500, 404, etc.)
        alert("Server error: Failed to create recipe");
      }
    } catch (err) {
      console.error("Error submitting recipe:", err);
      alert("Failed to submit recipe to server. Please try again.");
    }
  });
});
