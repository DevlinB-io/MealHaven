// database_pantry.js
console.log("=== database_pantry.js LOADED ===");

let pantryItems = [];

async function loadPantryItems() {
  console.log("🔄 Loading pantry items from database...");
  try {
    const response = await fetch("../PHP/get_pantry_items.php");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    pantryItems = data.error ? [] : data;
    console.log("✅ Pantry items loaded:", pantryItems.length);

    // Update the UI after loading
    populatePantryState();

    return pantryItems;
  } catch (error) {
    console.error("💥 Error loading pantry items:", error);
    return [];
  }
}

async function createPantryItem(pantryData) {
  console.log("🔄 Creating pantry item:", pantryData);
  try {
    const formData = new FormData();
    Object.keys(pantryData).forEach((key) => {
      formData.append(key, pantryData[key]);
    });

    const response = await fetch("../PHP/create_pantry_item.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("📨 Create pantry item response:", result);

    if (result.success) {
      await loadPantryItems();
      return result;
    } else {
      throw new Error(result.error || "Failed to create pantry item");
    }
  } catch (error) {
    console.error("💥 Error creating pantry item:", error);
    throw error;
  }
}
async function deletePantryItem(pantryId) {
  console.log("🗑️ Deleting pantry item ID:", pantryId);

  try {
    const formData = new FormData();
    formData.append("pantry_id", pantryId); // must match PHP

    const response = await fetch("../PHP/delete_pantry_item.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("📨 Delete pantry item response:", result);

    if (result.success) {
      await loadPantryItems();
      return result;
    } else {
      throw new Error(result.error || "Failed to delete pantry item");
    }
  } catch (error) {
    console.error("💥 Error deleting pantry item:", error);
    alert("Error deleting pantry item: " + error.message);
  }
}
window.deletePantryItem = deletePantryItem;

window.deletePantryItem = deletePantryItem;

function populatePantryState() {
  if (!window.state || !window.state.pantry) {
    console.error("❌ Window state not available");
    console.log("Available window properties:", Object.keys(window));
    return;
  }

  const formattedPantry = pantryItems.map((item) => ({
    id: `pantry_${item.id}`,
    db_id: item.id,
    name: item.name,
    qty: parseFloat(item.quantity) || 0,
    unit: item.unit || "pcs",
    expiry: item.expiry_date || "",
    category: item.category || "Other",
  }));

  console.log("📊 Formatted pantry items:", formattedPantry);
  window.state.pantry = formattedPantry;
  console.log(
    "✅ Pantry state updated, items in state:",
    window.state.pantry.length
  );

  if (window.persist) window.persist();
  if (window.renderPantry) {
    console.log("🎨 Calling renderPantry...");
    window.renderPantry();
  } else {
    console.log("❌ renderPantry function not found");
  }
  if (window.renderHome) window.renderHome();
}

// Make functions available globally
window.loadPantryItems = loadPantryItems;
window.createPantryItem = createPantryItem;
window.populatePantryState = populatePantryState;
window.getPantryItems = () => pantryItems;

console.log("🌐 Pantry functions added to window");

// Wait for DOM to load and then set up the form submission and load pantry items.
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Initializing pantry...");

  // Load pantry items
  loadPantryItems();

  // Set up form submission for pantry form
  const pantryForm = document.getElementById("pantryForm");
  if (pantryForm) {
    pantryForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("📝 Pantry form submitted");

      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      console.log("Form data:", data);

      try {
        await createPantryItem(data);
        // Close the dialog
        document.getElementById("pantryDialog").close();
        // Reset the form?
        this.reset();
      } catch (error) {
        console.error("Failed to create pantry item:", error);
        alert("Failed to create pantry item: " + error.message);
      }
    });
  } else {
    console.error("Could not find pantryForm element");
  }
});
