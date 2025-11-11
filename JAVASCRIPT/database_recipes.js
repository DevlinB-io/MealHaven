// database_recipes.js
console.log("=== database_recipes.js LOADED ===");

async function refreshRecipesFromDatabase() {
  console.log("🔄 Starting refreshRecipesFromDatabase...");

  try {
    const response = await fetch("../PHP/get_recipes.php");
    console.log(
      "📡 Fetch response status:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const databaseRecipes = await response.json();
    console.log("📊 Raw database recipes:", databaseRecipes);

    // Check if we got an error response
    if (databaseRecipes.error) {
      console.error("❌ Server error:", databaseRecipes.error);
      return [];
    }

    // Transform database recipes to match your app's format
    const formattedRecipes = databaseRecipes.map((recipe) => {
      const ingredients = recipe.ingredients
        ? recipe.ingredients.split("\n").filter((i) => i.trim())
        : [];

      const steps = recipe.instructions
        ? recipe.instructions.split("\n").filter((s) => s.trim())
        : [];

      const totalTime =
        (parseInt(recipe.prep_time) || 0) + (parseInt(recipe.cook_time) || 0);

      return {
        id: `db_${recipe.id}`,
        image: recipe.image_path || getFallbackImage(recipe.category),
        title: recipe.name,
        minutes: totalTime,
        category: recipe.category || "Mixed Dishes/Meals",
        ingredients: ingredients,
        steps: steps,
        custom: true,
        // Keep database fields for reference
        db_id: recipe.id,
        calories: recipe.calories,
        serving_size: recipe.serving_size,
        difficulty: recipe.difficulty,
      };
    });

    console.log("🎨 Formatted recipes:", formattedRecipes);

    // Update state with database recipes
    if (window.state && window.state.recipes) {
      console.log(
        "📝 Current state recipes before merge:",
        window.state.recipes
      );

      // Remove any existing database recipes to avoid duplicates
      const nonDbRecipes = window.state.recipes.filter(
        (r) => !r.id.startsWith("db_")
      );
      console.log("🗑️ Non-db recipes to keep:", nonDbRecipes);

      // Combine non-db recipes with new database recipes
      window.state.recipes = [...nonDbRecipes, ...formattedRecipes];
      console.log("✅ Final merged recipes:", window.state.recipes);

      // Persist to localStorage
      if (window.persist) {
        window.persist();
        console.log("💾 Persisted to localStorage");
      }

      // Trigger re-render
      if (window.render) {
        console.log("🎬 Calling window.render()");
        window.render();
      } else if (window.renderRecipes) {
        console.log("🎬 Calling window.renderRecipes()");
        window.renderRecipes();
      } else {
        console.warn("⚠️ No render function found!");
      }
    } else {
      console.error("❌ window.state not available!");
    }

    return formattedRecipes;
  } catch (error) {
    console.error("💥 Error refreshing recipes from database:", error);
    return [];
  }
}

function getFallbackImage(category) {
  const fallbackImages = {
    "Proteins & Legumes": "../IMAGES/placeholder_protein.jpg",
    "Grains & Starches": "../IMAGES/placeholder_grain.jpg",
    Beverages: "../IMAGES/placeholder_drink.jpg",
    "Mixed Dishes/Meals": "../IMAGES/placeholder_meal.jpg",
    Vegetables: "../IMAGES/placeholder_veg.jpg",
    Fruits: "../IMAGES/placeholder_fruit.jpg",
    Dairy: "../IMAGES/placeholder_dairy.jpg",
  };

  return fallbackImages[category] || "../IMAGES/placeholder.jpg";
}

// Make it available globally
window.refreshRecipesFromDatabase = refreshRecipesFromDatabase;
console.log("🌐 refreshRecipesFromDatabase added to window");

// Load database recipes when the script loads
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🏠 DOM Content Loaded - starting database load");

  // Wait for main_website.js to initialize
  setTimeout(async () => {
    console.log("⏰ Timeout elapsed, loading recipes...");
    await refreshRecipesFromDatabase();
  }, 500);
});
