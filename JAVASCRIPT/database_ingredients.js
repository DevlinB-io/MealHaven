// database_ingredients.js
console.log("=== database_ingredients.js LOADED ===");

let ingredients = [];

async function loadIngredients() {
  console.log("🔄 Loading ingredients from database...");

  try {
    const response = await fetch("../PHP/get_ingredients.php");
    console.log("📡 Ingredients fetch response:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📊 Raw ingredients data:", data);

    if (data.error) {
      console.error("❌ Server error:", data.error);
      return [];
    }

    ingredients = data;
    console.log("✅ Ingredients loaded:", ingredients.length);
    return ingredients;
  } catch (error) {
    console.error("💥 Error loading ingredients:", error);
    return [];
  }
}

async function createIngredient(ingredientData) {
  console.log("🔄 Creating ingredient:", ingredientData);

  try {
    const formData = new FormData();
    formData.append("name", ingredientData.name);
    formData.append("category", ingredientData.category || "");
    formData.append("unit_of_measurement", ingredientData.unit || "");
    formData.append("shelf_life_days", ingredientData.shelf_life || 0);
    formData.append("barcode", ingredientData.barcode || "");

    const response = await fetch("../PHP/create_ingredient.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("📨 Create ingredient response:", result);

    if (result.success) {
      // Reload ingredients
      await loadIngredients();
      return result;
    } else {
      throw new Error(result.error || "Failed to create ingredient");
    }
  } catch (error) {
    console.error("💥 Error creating ingredient:", error);
    throw error;
  }
}

function populateIngredientSelect(selectElement) {
  if (!selectElement) return;

  // Clear existing options except the first one
  while (selectElement.options.length > 1) {
    selectElement.remove(1);
  }

  // Add ingredient options
  ingredients.forEach((ingredient) => {
    const option = document.createElement("option");
    option.value = ingredient.id;
    option.textContent = ingredient.name;
    if (ingredient.category) {
      option.textContent += ` (${ingredient.category})`;
    }
    selectElement.appendChild(option);
  });

  console.log(`✅ Populated select with ${ingredients.length} ingredients`);
}

// Make functions available globally
window.loadIngredients = loadIngredients;
window.createIngredient = createIngredient;
window.populateIngredientSelect = populateIngredientSelect;
window.getIngredients = () => ingredients;

console.log("🌐 Ingredient functions added to window");
