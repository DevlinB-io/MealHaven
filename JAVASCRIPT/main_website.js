// === MealHaven – Integrated SPA ===
// Profile (avatar upload), Settings (dark/metric/notify), Preferences,
// Notifications Center with unread badge — all persisted in localStorage.
// Updated for: Pantry Recipes grouping; qty "-" never removes (keeps at 0);
// ingredients coverage counts only pantry items with qty > 0.
// Added: Hover/tilt motion on recipe cards.
// Added: Database recipe deletion.
// Added: Database ingredient and pantry management.

/* ----------------- Utilities ----------------- */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const fmt = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const uid = (pfx = "id") => `${pfx}_${Math.random().toString(36).slice(2, 9)}`;

const today = () => fmt(new Date());
const getLS = (k, fallback) =>
  JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
const setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ----------------- Seed Data ----------------- */
const SAMPLE_RECIPES = [
  {
    id: "r1",
    image: "assets/Pizza.jpg",
    title: "Salami & Cheese Pizza",
    minutes: 30,
    category: "Mixed Dishes/Meals",
    ingredients: [
      "pizza base",
      "tomato sauce",
      "salami",
      "mozzarella",
      "basil",
    ],
    steps: [
      "Preheat oven to 220°C",
      "Spread sauce",
      "Top with salami & cheese",
      "Bake 12–15 min",
    ],
  },
  {
    id: "r2",
    image: "assets/Crispy Shrimp.jpg",
    title: "Crispy Shrimp",
    minutes: 20,
    category: "Proteins & Legumes",
    ingredients: ["shrimp", "flour", "eggs", "breadcrumbs", "oil"],
    steps: ["Coat shrimp", "Fry until golden", "Serve with dip"],
  },
  {
    id: "r3",
    image: "assets/Sticky Chicken Wings.jpg",
    title: "Sticky Chicken Wings",
    minutes: 30,
    category: "Proteins & Legumes",
    ingredients: ["chicken wings", "soy sauce", "honey", "garlic", "ginger"],
    steps: ["Marinate wings", "Bake 25 min", "Brush glaze & serve"],
  },
  {
    id: "r4",
    image: "assets/Veggie Omelette.jpg",
    title: "Veggie Omelette",
    minutes: 10,
    category: "Mixed Dishes/Meals",
    ingredients: ["eggs", "onion", "tomato", "spinach", "cheese"],
    steps: ["Beat eggs", "Sauté veg", "Cook eggs & fold"],
  },
  {
    id: "r5",
    image: "assets/Grilled Lemon Salmon.jpg",
    title: "Grilled Lemon Salmon",
    minutes: 25,
    category: "Proteins & Legumes",
    ingredients: ["salmon fillets", "lemon", "olive oil", "garlic", "parsley"],
    steps: ["Marinate salmon", "Grill 5–6 min each side", "Serve with lemon"],
  },
  {
    id: "r6",
    image: "assets/Beef Tacos.jpg",
    title: "Beef Tacos",
    minutes: 20,
    category: "Mixed Dishes/Meals",
    ingredients: ["tortillas", "ground beef", "onion", "cheddar", "lettuce"],
    steps: ["Cook beef", "Warm tortillas", "Assemble & serve"],
  },
  {
    id: "r7",
    image: "assets/Pasta Carbonara.jpg",
    title: "Pasta Carbonara",
    minutes: 20,
    category: "Grains & Starches",
    ingredients: ["spaghetti", "eggs", "bacon", "parmesan", "black pepper"],
    steps: ["Boil pasta", "Cook bacon", "Mix with eggs & cheese", "Serve hot"],
  },
  {
    id: "r8",
    image: "assets/Avocado Toast.jpg",
    title: "Avocado Toast",
    minutes: 10,
    category: "Mixed Dishes/Meals",
    ingredients: ["bread", "avocado", "lime", "salt", "pepper"],
    steps: ["Toast bread", "Mash avocado", "Spread & season"],
  },
  {
    id: "r9",
    image: "assets/Chicken Curry.jpg",
    title: "Chicken Curry",
    minutes: 40,
    category: "Mixed Dishes/Meals",
    ingredients: ["chicken", "onion", "tomato", "garam masala", "coconut milk"],
    steps: ["Cook onions", "Add spices", "Simmer chicken in sauce"],
  },
  {
    id: "r10",
    image: "assets/Fruit Smoothie.png",
    title: "Tropical Fruit Smoothie",
    minutes: 5,
    category: "Beverages",
    ingredients: ["banana", "mango", "pineapple", "yogurt", "ice"],
    steps: ["Add all to blender", "Blend until smooth", "Serve chilled"],
  },
];

const SAMPLE_PANTRY = [
  {
    id: "p1",
    name: "chicken breast",
    qty: 2,
    unit: "pcs",
    expiry: fmt(new Date(Date.now() + 86400000 * 2)),
    category: "Meat & Poultry",
  },
  {
    id: "p2",
    name: "tomato sauce",
    qty: 1,
    unit: "jar",
    expiry: fmt(new Date(Date.now() + 86400000 * 10)),
    category: "Canned & Jarred Goods",
  },
  {
    id: "p3",
    name: "mozzarella",
    qty: 1,
    unit: "pcs",
    expiry: fmt(new Date(Date.now() + 86400000 * 3)),
    category: "Dairy & Eggs",
  },
  {
    id: "p4",
    name: "eggs",
    qty: 12,
    unit: "pcs",
    expiry: fmt(new Date(Date.now() + 86400000 * 20)),
    category: "Dairy & Eggs",
  },
];

const SAMPLE_PLANS = {};
const SAMPLE_FAVS = ["r1", "r3"];

/* ----------------- Settings-like models ----------------- */
const MH_SETTINGS_KEY = "mh_settings";
const MH_PROFILE_KEY = "mh_profile";
const MH_PREFS_KEY = "mh_preferences";
const MH_NOTIF_KEY = "mh_notifications";

// Default to light so first load isn't dark
const defaultSettings = {
  theme: getLS("mh_theme", "light") || "light",
  metric: getLS("mh_metric", true),
  notificationsEnabled: true,
};
const defaultProfile = { name: "David Modise", initials: "DM", avatar: null };
const defaultPrefs = {
  diet: "none",
  calories: "",
  allergies: "",
  dislikes: "",
};
const defaultNotifs = [
  {
    id: uid("n"),
    title: "Welcome to MealHaven",
    body: "Tap recipes to add to your weekly plan.",
    ts: Date.now() - 86400000,
    read: false,
  },
  {
    id: uid("n"),
    title: "Pantry tip",
    body: "Add expiry for smarter suggestions.",
    ts: Date.now() - 3600000,
    read: false,
  },
];

/* ----------------- App State ----------------- */
const state = {
  recipes: getLS("mh_recipes", SAMPLE_RECIPES),
  pantry: getLS("mh_pantry", SAMPLE_PANTRY),
  plans: getLS("mh_plans", SAMPLE_PLANS),
  favs: getLS("mh_favs", SAMPLE_FAVS),
  monthCursor: new Date(),
  settings: getLS(MH_SETTINGS_KEY, defaultSettings),
  profile: getLS(MH_PROFILE_KEY, defaultProfile),
  prefs: getLS(MH_PREFS_KEY, defaultPrefs),
  notifications: getLS(MH_NOTIF_KEY, defaultNotifs),
};

/* ----------------- Persistence ----------------- */
function persist() {
  setLS("mh_recipes", state.recipes);
  setLS("mh_pantry", state.pantry);
  setLS("mh_plans", state.plans);
  setLS("mh_favs", state.favs);
  setLS(MH_SETTINGS_KEY, state.settings);
  setLS(MH_PROFILE_KEY, state.profile);
  setLS(MH_PREFS_KEY, state.prefs);
  setLS(MH_NOTIF_KEY, state.notifications);
  setLS("mh_metric", state.settings.metric);
  setLS("mh_theme", state.settings.theme);
}

/* ----------------- Ingredient & Pantry Management ----------------- */
async function initializeIngredientSystem() {
  console.log("🔄 Initializing ingredient system...");

  try {
    // Load ingredients
    if (window.loadIngredients) {
      await window.loadIngredients();
    } else {
      console.warn("⚠️ window.loadIngredients not available");
    }

    // Load pantry items
    if (window.loadPantryItems) {
      await window.loadPantryItems();
    } else {
      console.warn("⚠️ window.loadPantryItems not available");
    }

    // Populate pantry state
    if (window.populatePantryState) {
      window.populatePantryState();
    } else {
      console.warn("⚠️ window.populatePantryState not available");
    }

    // Setup ingredient select in pantry modal
    const ingredientSelect = document.getElementById("ingredientSelect");
    if (ingredientSelect && window.populateIngredientSelect) {
      window.populateIngredientSelect(ingredientSelect);
    }

    console.log("✅ Ingredient system initialized");
  } catch (error) {
    console.error("❌ Failed to initialize ingredient system:", error);
  }
}

function setupPantryForm() {
  const pantryForm = document.getElementById("pantryForm");
  const ingredientSelect = document.getElementById("ingredientSelect");
  const newIngredientBtn = document.getElementById("newIngredientBtn");
  const ingredientDialog = document.getElementById("ingredientDialog");
  const ingredientForm = document.getElementById("ingredientForm");
  const ingredientCancelBtn = document.getElementById("ingredientCancelBtn");

  // New ingredient button
  if (newIngredientBtn) {
    newIngredientBtn.addEventListener("click", () => {
      if (ingredientDialog) {
        ingredientDialog.showModal();
      } else {
        console.error("❌ Ingredient dialog not found");
      }
    });
  }

  // Ingredient form submission
  if (ingredientForm) {
    ingredientForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(ingredientForm);
      const ingredientData = {
        name: formData.get("name"),
        category: formData.get("category"),
        unit: formData.get("unit_of_measurement"),
        shelf_life: formData.get("shelf_life_days"),
        barcode: formData.get("barcode"),
      };

      try {
        if (!window.createIngredient) {
          throw new Error("Ingredient creation not available");
        }

        const result = await window.createIngredient(ingredientData);

        if (result.success) {
          // Add new ingredient to select
          if (ingredientSelect) {
            const option = document.createElement("option");
            option.value = result.ingredient_id;
            option.textContent = result.ingredient_name;
            if (ingredientData.category) {
              option.textContent += ` (${ingredientData.category})`;
            }
            ingredientSelect.appendChild(option);
            ingredientSelect.value = result.ingredient_id;

            // Also update the ingredient name field
            const ingredientNameInput = document.querySelector(
              'input[name="ingredient_name"]'
            );
            if (ingredientNameInput) {
              ingredientNameInput.value = result.ingredient_name;
            }
          }

          ingredientDialog.close();
          alert("Ingredient created successfully!");
        }
      } catch (error) {
        console.error("Error creating ingredient:", error);
        alert("Error creating ingredient: " + error.message);
      }
    });
  }

  // Ingredient cancel button - FIXED NULL REFERENCE
  if (ingredientCancelBtn) {
    ingredientCancelBtn.addEventListener("click", () => {
      if (ingredientDialog) {
        ingredientDialog.close();
      }
    });
  }

  // Update ingredient name when select changes
  if (ingredientSelect) {
    ingredientSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const ingredientNameInput = document.querySelector(
        'input[name="ingredient_name"]'
      );
      if (ingredientNameInput && selectedOption.textContent) {
        // Extract just the name without category
        const name = selectedOption.textContent.split(" (")[0];
        ingredientNameInput.value = name;
      }
    });
  }

  // Update pantry form submission - FIXED UNDEFINED ERROR
  // Update pantry form submission - FIXED VERSION
  if (pantryForm) {
    pantryForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(pantryForm);

      // Debug: log all form data
      console.log("📋 Form data entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      console.log("🔄 Submitting pantry data:", pantryData);

      // Validate required fields
      if (!pantryData.ingredient_id || pantryData.ingredient_id === "") {
        alert("Please select an ingredient");
        return;
      }

      if (!pantryData.quantity || parseFloat(pantryData.quantity) <= 0) {
        alert("Please enter a valid quantity");
        return;
      }

      if (!pantryData.purchase_date) {
        alert("Please select a purchase date");
        return;
      }

      try {
        if (!window.createPantryItem) {
          throw new Error("Pantry item creation not available");
        }

        const result = await window.createPantryItem(pantryData);

        if (result.success) {
          const pantryDialog = document.getElementById("pantryDialog");
          if (pantryDialog) {
            pantryDialog.close();
          }
          alert("Pantry item added successfully!");

          // Reload everything
          await initializeIngredientSystem();
          if (window.render) {
            window.render();
          }
        } else {
          throw new Error(result.error || "Failed to create pantry item");
        }
      } catch (error) {
        console.error("Error adding pantry item:", error);
        alert("Error adding pantry item: " + error.message);
      }
    });
  }
}

/* FIXED: Pantry Dialog Function */
function openPantryDialog(item = null) {
  const dlg = document.getElementById("pantryDialog");
  const form = document.getElementById("pantryForm");

  if (!dlg || !form) {
    console.error("❌ Pantry dialog or form not found");
    return;
  }

  form.reset();
  delete form.dataset.editId;

  // Populate ingredient select if available
  const ingredientSelect = document.getElementById("ingredientSelect");
  if (ingredientSelect && window.populateIngredientSelect) {
    window.populateIngredientSelect(ingredientSelect);
  }

  if (item) {
    // For editing existing items
    const nameInput = form.querySelector('input[name="ingredient_name"]');
    const qtyInput = form.querySelector('input[name="quantity"]');
    const expiryInput = form.querySelector('input[name="expiry_date"]');
    const categorySelect = form.querySelector('select[name="category"]');

    if (nameInput) nameInput.value = item.name || "";
    if (qtyInput) qtyInput.value = item.qty ?? 1;
    if (expiryInput) expiryInput.value = item.expiry || "";
    if (categorySelect) categorySelect.value = item.category || "";

    form.dataset.editId = item.id;
  }

  // FIXED: Remove the problematic onclick assignment
  const cancelButton = form.querySelector(".btn-secondary");
  if (cancelButton) {
    // Replace the inline onclick with event listener
    cancelButton.onclick = null; // Clear existing
    cancelButton.addEventListener("click", function () {
      dlg.close();
    });
  }

  dlg.showModal();
}

/* ----------------- View Switching ----------------- */
qsa(".tab").forEach((btn) =>
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    showView(view);
    localStorage.setItem("mh_last_view", view);
  })
);
function showView(view) {
  qsa(".tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view)
  );
  qsa(".view").forEach((v) => v.classList.toggle("active", v.id === view));
  render();
}
showView(localStorage.getItem("mh_last_view") || "home");

/* ----------------- Theme ----------------- */
function applyTheme() {
  const html = document.documentElement;
  const theme = (state.settings.theme || "light").toLowerCase();
  state.settings.theme = theme; // normalize
  html.setAttribute("data-theme", theme);
  document.body.classList.toggle("light", theme === "light");
}
applyTheme();
qs("#toggleThemeBtn")?.addEventListener("click", () => {
  state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
  applyTheme();
  persist();
  const pm = qs("#profileMenu");
  if (pm) pm.hidden = true;
});

/* Settings switches panel */
["dark", "metric", "notify"].forEach((key) => {
  const m = {
    dark: "#darkToggle",
    metric: "#metricToggle",
    notify: "#notifyToggle",
  }[key];
  const el = qs(m);
  if (!el) return;
  if (key === "dark")
    el.checked = (state.settings.theme || "light").toLowerCase() === "dark";
  if (key === "metric") el.checked = !!state.settings.metric;
  if (key === "notify") el.checked = !!state.settings.notificationsEnabled;
});
qs("#darkToggle")?.addEventListener("change", (e) => {
  state.settings.theme = e.target.checked ? "dark" : "light";
  applyTheme();
  persist();
});
qs("#metricToggle")?.addEventListener("change", (e) => {
  state.settings.metric = e.target.checked;
  persist();
});
qs("#notifyToggle")?.addEventListener("change", (e) => {
  state.settings.notificationsEnabled = e.target.checked;
  persist();
});

/* ----------------- Profile menu + Avatar ----------------- */
const profileBtn = qs("#profileBtn");
const profileMenu = qs("#profileMenu");
const profileName = qs("#profileName");
const profileNameInput = qs("#profileNameInput");
const profileAvatar = qs("#profileAvatar");
const avatarFile = qs("#avatarFile");
const saveProfileBtn = qs("#saveProfileBtn");
const clearAvatarBtn = qs("#clearAvatarBtn");

function initialsFromName(name) {
  if (!name?.trim()) return "DM";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("") || "U"
  );
}
function refreshAvatarUI() {
  const initials = initialsFromName(state.profile.name);
  if (profileBtn) {
    if (state.profile.avatar) {
      profileBtn.innerHTML = `<img alt="avatar">`;
      profileBtn.querySelector("img").src = state.profile.avatar;
    } else profileBtn.textContent = initials;
  }
  if (profileAvatar) {
    if (state.profile.avatar) {
      profileAvatar.innerHTML = `<img alt="avatar">`;
      profileAvatar.querySelector("img").src = state.profile.avatar;
    } else profileAvatar.textContent = initials;
  }
  if (profileName)
    profileName.textContent = state.profile.name || "Your Profile";
  if (profileNameInput) profileNameInput.value = state.profile.name || "";
}
refreshAvatarUI();

profileBtn?.addEventListener("click", () => {
  if (!profileMenu) return;
  profileMenu.hidden = !profileMenu.hidden;
  profileBtn.setAttribute("aria-expanded", String(!profileMenu.hidden));
});
document.addEventListener("click", (e) => {
  if (!profileMenu || !profileBtn) return;
  if (!profileMenu.contains(e.target) && e.target !== profileBtn)
    profileMenu.hidden = true;
});
avatarFile?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.profile.avatar = reader.result;
    persist();
    refreshAvatarUI();
  };
  reader.readAsDataURL(file);
});
saveProfileBtn?.addEventListener("click", () => {
  const name = profileNameInput.value.trim();
  state.profile.name = name || "User";
  persist();
  refreshAvatarUI();
  alert("Profile saved");
});
clearAvatarBtn?.addEventListener("click", () => {
  state.profile.avatar = null;
  persist();
  refreshAvatarUI();
});

/* ----------------- Preferences ----------------- */
["diet", "calories", "allergies", "dislikes"].forEach((k) => {
  const map = {
    diet: "#prefDiet",
    calories: "#prefCalories",
    allergies: "#prefAllergies",
    dislikes: "#prefDislikes",
  };
  const el = qs(map[k]);
  if (!el) return;
  el.value = state.prefs[k] ?? "";
});
qs("#savePrefsBtn")?.addEventListener("click", () => {
  state.prefs = {
    diet: qs("#prefDiet")?.value || "none",
    calories: qs("#prefCalories")?.value || "",
    allergies: (qs("#prefAllergies")?.value || "").trim(),
    dislikes: (qs("#prefDislikes")?.value || "").trim(),
  };
  persist();
  alert("Preferences saved");
});

/* ----------------- Notifications Center ----------------- */
const notifBtn = qs("#notifBtn");
const notifBadge = qs("#notifBadge");
const notifDialog = qs("#notifDialog");
const notifList = qs("#notifList");
function unreadCount() {
  return state.notifications.filter((n) => !n.read).length;
}
function updateNotifBadge() {
  const c = unreadCount();
  if (!notifBadge) return;
  notifBadge.textContent = String(c);
  notifBadge.hidden = c === 0;
}
updateNotifBadge();

function renderNotifications(filter = "all") {
  if (!notifList) return;
  let list = state.notifications.slice();
  if (filter === "unread") list = list.filter((n) => !n.read);
  if (filter === "read") list = list.filter((n) => n.read);
  notifList.innerHTML = list.length
    ? ""
    : '<li class="muted">No notifications</li>';
  list
    .sort((a, b) => b.ts - a.ts)
    .forEach((n) => {
      const li = document.createElement("li");
      li.className = "card";
      li.style.padding = "12px";
      li.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div>
          <div style="font-weight:600">${n.title}</div>
          <div style="font-size:13px; opacity:.8">${n.body}</div>
          <div style="font-size:11px; opacity:.6; margin-top:4px">${new Date(
            n.ts
          ).toLocaleString()}</div>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn ${
            n.read ? "" : "active"
          }" data-act="toggle" data-id="${n.id}">${
        n.read ? "Mark unread" : "Mark read"
      }</button>
          <button class="btn danger" data-act="delete" data-id="${
            n.id
          }">Delete</button>
        </div>
      </div>`;
      notifList.appendChild(li);
    });
}
notifBtn?.addEventListener("click", () => {
  renderNotifications("all");
  notifDialog?.showModal();
});
qs("#notifCloseBtn")?.addEventListener("click", () => notifDialog?.close());
qs("#notifFilterAll")?.addEventListener("click", () =>
  renderNotifications("all")
);
qs("#notifFilterUnread")?.addEventListener("click", () =>
  renderNotifications("unread")
);
qs("#notifFilterRead")?.addEventListener("click", () =>
  renderNotifications("read")
);
notifList?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const act = btn.getAttribute("data-act");
  if (act === "toggle") {
    const item = state.notifications.find((n) => n.id === id);
    if (item) item.read = !item.read;
  } else if (act === "delete") {
    state.notifications = state.notifications.filter((n) => n.id !== id);
  }
  persist();
  renderNotifications("all");
  updateNotifBadge();
});
qs("#notifClearBtn")?.addEventListener("click", () => {
  if (!confirm("Clear all notifications?")) return;
  state.notifications = [];
  persist();
  renderNotifications("all");
  updateNotifBadge();
});
window.MHNotify = (title, body) => {
  if (!state.settings.notificationsEnabled) return;
  state.notifications.push({
    id: uid("n"),
    title,
    body,
    ts: Date.now(),
    read: false,
  });
  persist();
  updateNotifBadge();
};

/* ----------------- Home Widgets ----------------- */
function renderTrending() {
  const wrap = qs("#trendingGrid");
  if (!wrap) return;
  wrap.innerHTML =
    state.recipes
      .slice(0, 6)
      .map((r) => recipeCard(r, ""))
      .join("") || "<p>No recipes yet.</p>";
  hookRecipeButtons(wrap);
  hookIngredientChecks(wrap);
  hookRecipeHoverMotion(wrap);
}
function renderExpiringSoon() {
  const ul = qs("#expiringList");
  if (!ul) return;

  const soon = state.pantry
    .filter((p) => p.expiry)
    .map((p) => ({
      ...p,
      days: Math.ceil((new Date(p.expiry) - new Date()) / 86400000),
    }))
    .filter((p) => p.days <= 7)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  ul.innerHTML = soon.length
    ? soon
        .map(
          (s) =>
            `<li>${s.name} — <strong>${s.days} day${
              s.days !== 1 ? "s" : ""
            }</strong></li>`
        )
        .join("")
    : "<li>Nothing expiring soon 🎉</li>";
}
function renderPantrySummary() {
  const el = qs("#pantrySummary");
  if (!el) return;
  const inStock = state.pantry.filter((p) => p.qty > 0).length;
  const low = state.pantry.filter((p) => p.qty > 0 && p.qty <= 1).length;
  const out = state.pantry.filter((p) => p.qty === 0).length;
  el.innerHTML = `
    <div class="stat"><div class="kpi in">${inStock}</div><div>In Stock</div></div>
    <div class="stat"><div class="kpi low">${low}</div><div>Low</div></div>
    <div class="stat"><div class="kpi out">${out}</div><div>Out</div></div>`;
}
function renderWeekStrip() {
  const wrap = qs("#weeklySnapshot");
  if (!wrap) return;
  const start = new Date();
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diff);
  wrap.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = fmt(d);
    const events = state.plans[key] || [];
    const pillsHTML = events.length
      ? events
          .map((ev) => `<span class="pill">${ev.slot}: ${ev.title}</span>`)
          .join("")
      : '<span class="pill">—</span>';
    wrap.innerHTML += `<div class="day" data-date="${key}" role="button" tabindex="0" aria-label="Open recipes for ${key}">
      <h4>${d.toLocaleDateString(undefined, {
        weekday: "short",
      })} ${d.getDate()}</h4>${pillsHTML}</div>`;
  }
  qsa("#weeklySnapshot .day").forEach((el) => {
    const go = () => {
      const key = el.dataset.date;
      const dateFilter = qs("#recipesDateFilter");
      if (dateFilter) dateFilter.value = key;
      showView("recipes");
      localStorage.setItem("mh_last_view", "recipes");
      renderRecipes();
    };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
}

/* ----------------- Recipes logic ----------------- */
function getPlannedSlots(dateKey, recipeId) {
  const events = state.plans[dateKey] || [];
  return events.filter((ev) => ev.id === recipeId).map((ev) => ev.slot);
}
function isPlannedAnyDate(recipeId) {
  return Object.values(state.plans).some((arr) =>
    (arr || []).some((ev) => ev.id === recipeId)
  );
}
function coverageForRecipe(r) {
  // Only items with qty > 0 count as available
  const usable = new Set(
    state.pantry
      .filter((p) => (p.qty || 0) > 0)
      .map((p) => (p.name || "").toLowerCase())
  );
  const have = r.ingredients.filter((i) =>
    usable.has((i || "").toLowerCase())
  ).length;
  const total = r.ingredients.length || 1;
  return {
    have,
    total,
    pct: Math.round((have / total) * 100),
    complete: have === total,
    none: have === 0,
  };
}
function recipeCard(r, selectedDate = "") {
  const cov = coverageForRecipe(r);
  const isFav = state.favs.includes(r.id);
  const plannedSlotsOnDate = selectedDate
    ? getPlannedSlots(selectedDate, r.id)
    : [];
  const plannedOnDate = plannedSlotsOnDate.length > 0;
  const plannedAnywhere = isPlannedAnyDate(r.id);
  const plannedState = selectedDate ? plannedOnDate : plannedAnywhere;
  const usable = new Set(
    state.pantry
      .filter((p) => (p.qty || 0) > 0)
      .map((p) => (p.name || "").toLowerCase())
  );

  let slotsHTML = "";
  if (selectedDate && plannedOnDate) {
    const pills = plannedSlotsOnDate
      .map((s) => `<span class="pill">${s}</span>`)
      .join(" ");
    slotsHTML = `<div class="slot-badges">${pills}</div>`;
  }

  return `<article class="recipe recipe-pop" data-id="${r.id}">
    <div class="thumb"><img src="${r.image}" alt="${r.title}"></div>
    <div class="body">
      <strong>${r.title}</strong>
      <div class="meta"><span>⏱ ${r.minutes} min</span><span>${cov.have}/${
    cov.total
  } ingredients (${cov.pct}%)</span></div>
      ${slotsHTML}
      <details>
        <summary>Ingredients</summary>
        <ul>${r.ingredients
          .map((i) => {
            const has = usable.has((i || "").toLowerCase());
            return `<li class="ingredient-pop">
              <label class="row gap" style="align-items:center; gap:.5rem;">
                <input type="checkbox" class="ing-check" data-ing="${i}" ${
              has ? "checked" : ""
            }>
                <span>${i}</span>
              </label>
            </li>`;
          })
          .join("")}</ul>
      </details>
      <details>
        <summary>Recipe</summary>
        <ol>${r.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      </details>
    </div>
    <div class="actions">
      <button class="btn ${plannedState ? "active" : ""}" data-action="plan">${
    plannedState ? "Added" : "Add to Plan"
  }</button>
      <button class="btn ${isFav ? "active" : ""}" data-action="fav">${
    isFav ? "♥ Saved to Favourites" : "♡ Favourite"
  }</button>
      ${
        r.custom
          ? `<button class="btn danger" data-action="delete">Delete</button>`
          : ""
      }
    </div>
  </article>`;
}

/* Ingredient add/remove dialogs from recipe checkboxes */
function ensureIngredientDialog() {
  if (qs("#ingredientDialog")) return;
  const dlg = document.createElement("dialog");
  dlg.id = "ingredientDialog";
  dlg.className = "modal";
  dlg.innerHTML = `
    <form id="ingredientForm" method="dialog" class="modal-body stack" style="min-width: 480px;">
      <h3 id="ingTitle">Ingredient</h3>
      <div class="form-grid">
        <label><span>Item</span><input name="name" type="text" required /></label>
        <label><span>Quantity</span><input name="qty" type="number" min="0" step="1" value="1" /></label>
        <label><span>Unit</span>
          <select name="unit"><option value="pcs">pcs</option><option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">l</option><option value="">(none)</option></select>
        </label>
        <label><span>Expiry</span><input name="expiry" type="date" /></label>
        <label><span>Category</span>
          <select name="category"><option value="">(none)</option><option>Meat & Poultry</option><option>Dairy & Eggs</option><option>Canned & Jarred Goods</option><option>Produce</option><option>Grains & Starches</option><option>Proteins & Legumes</option><option>Beverages</option><option>Spices & Seasonings</option><option>Other</option></select>
        </label>
      </div>
      <div class="modal-actions">
        <button id="ingCancelBtn" value="cancel" type="button" class="btn">Cancel</button>
        <button class="btn primary" id="ingAddBtn" type="submit">Add to Pantry</button>
      </div>
    </form>`;
  document.body.appendChild(dlg);
}
function openIngredientDialog(ingredientName, checkboxEl) {
  ensureIngredientDialog();
  const dlg = qs("#ingredientDialog");
  const form = qs("#ingredientForm");
  form.name.value = ingredientName;
  form.qty.value = 1;
  form.unit.value = "pcs";
  form.expiry.value = "";
  form.category.value = "";
  const onClose = () => {
    if (dlg.returnValue === "cancel" && checkboxEl) checkboxEl.checked = false;
    dlg.removeEventListener("close", onClose);
  };
  dlg.addEventListener("close", onClose);
  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = (data.name || "").trim();
    const qty = Number(data.qty) || 0;
    const unit = (data.unit || "").trim();
    const expiry = data.expiry || "";
    const category = data.category || "";
    const idx = state.pantry.findIndex(
      (p) => (p.name || "").toLowerCase() === name.toLowerCase()
    );
    if (idx > -1) {
      state.pantry[idx].qty = (Number(state.pantry[idx].qty) || 0) + qty;
      if (unit) state.pantry[idx].unit = unit;
      if (expiry) state.pantry[idx].expiry = expiry;
      if (category) state.pantry[idx].category = category;
    } else {
      state.pantry.push({ id: uid("p"), name, qty, unit, expiry, category });
    }
    persist();
    renderPantry();
    renderHome();
    renderRecipes();
    if (checkboxEl) checkboxEl.checked = true;
    dlg.returnValue = "added";
    dlg.close();
  };
  qs("#ingCancelBtn").onclick = () => {
    dlg.returnValue = "cancel";
    dlg.close();
  };
  dlg.showModal();
}
function ensureRemoveIngredientDialog() {
  if (qs("#removeIngredientDialog")) return;
  const dlg = document.createElement("dialog");
  dlg.id = "removeIngredientDialog";
  dlg.className = "modal";
  dlg.innerHTML = `
    <form method="dialog" class="modal-body stack" style="min-width: 420px;">
      <h3>Remove from Pantry?</h3>
      <p id="removeIngText">Are you sure you want to remove this item from your pantry?</p>
      <div class="modal-actions">
        <button id="remCancelBtn" value="cancel" type="button" class="btn">Cancel</button>
        <button class="btn danger" id="remConfirmBtn" type="button">Remove from Pantry</button>
      </div>
    </form>`;
  document.body.appendChild(dlg);
}
function openRemoveIngredientDialog(ingredientName, checkboxEl) {
  ensureRemoveIngredientDialog();
  const dlg = qs("#removeIngredientDialog");
  qs(
    "#removeIngText"
  ).textContent = `Remove "${ingredientName}" from your pantry?`;
  const onClose = () => {
    if (dlg.returnValue === "cancel" && checkboxEl) checkboxEl.checked = true;
    dlg.removeEventListener("close", onClose);
  };
  dlg.addEventListener("close", onClose);
  qs("#remCancelBtn").onclick = () => {
    dlg.returnValue = "cancel";
    dlg.close();
  };
  qs("#remConfirmBtn").onclick = () => {
    const nameLc = ingredientName.toLowerCase();
    state.pantry = state.pantry.filter(
      (p) => (p.name || "").toLowerCase() !== nameLc
    );
    persist();
    renderPantry();
    renderHome();
    renderRecipes();
    dlg.returnValue = "removed";
    dlg.close();
  };
  dlg.showModal();
}
function hookIngredientChecks(scope = document) {
  qsa(".ing-check", scope).forEach((chk) => {
    if (chk.dataset.bound) return;
    chk.dataset.bound = "1";
    chk.addEventListener("change", (e) => {
      const el = e.currentTarget;
      const ing = el.dataset.ing || "";
      if (el.checked) {
        if (!el.dataset.autochecked) openIngredientDialog(ing, el);
      } else {
        const exists = state.pantry.some(
          (p) => (p.name || "").toLowerCase() === ing.toLowerCase()
        );
        if (exists) openRemoveIngredientDialog(ing, el);
      }
    });
  });
}

/* ----------------- Hover/Tilt Motion for Recipe Cards ----------------- */
function hookRecipeHoverMotion(scope = document) {
  qsa(".recipe", scope).forEach((card) => {
    if (card.dataset.motion) return;
    card.dataset.motion = "1";
    const MAX = 6; // degrees

    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const ry = (px - 0.5) * MAX * 2;
      const rx = -(py - 0.5) * MAX * 2;

      card.style.transform = `translateY(-4px) scale(1.02) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.boxShadow =
        "0 16px 28px rgba(52,199,89,.18), 0 8px 16px rgba(0,0,0,.12)";
      card.style.transition = "transform 120ms ease, box-shadow 120ms ease";
      card.style.transformStyle = "preserve-3d";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
    });
  });
}

/* Buttons inside recipe cards */
function hookRecipeButtons(scope = document) {
  // plan/unplan
  scope
    .querySelectorAll('.recipe .actions [data-action="plan"]')
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".recipe").dataset.id;
        const chosen = qs("#recipesDateFilter")?.value || "";
        if (chosen) {
          const hasSlots = getPlannedSlots(chosen, id).length > 0;
          if (hasSlots) {
            state.plans[chosen] = (state.plans[chosen] || []).filter(
              (ev) => ev.id !== id
            );
            if (state.plans[chosen].length === 0) delete state.plans[chosen];
            persist();
            render();
          } else {
            const r =
              state.recipes.find((rr) => rr.id === id) || state.recipes[0];
            const item = { id: r.id, title: r.title, slot: "dinner" };
            if (!state.plans[chosen]) state.plans[chosen] = [];
            state.plans[chosen].push(item);
            persist();
            render();
          }
        } else {
          const already = isPlannedAnyDate(id);
          if (already) {
            for (const key in state.plans) {
              state.plans[key] = state.plans[key].filter((ev) => ev.id !== id);
              if (state.plans[key].length === 0) delete state.plans[key];
            }
            persist();
            render();
          } else openPlanDialog(id);
        }
      });
    });

  // favourite toggle
  scope
    .querySelectorAll('.recipe .actions [data-action="fav"]')
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".recipe").dataset.id;
        const idx = state.favs.indexOf(id);
        if (idx > -1) state.favs.splice(idx, 1);
        else state.favs.push(id);
        persist();
        render();
      });
    });

  // === UPDATED DELETE HANDLER FOR DATABASE ===
  scope
    .querySelectorAll('.recipe .actions [data-action="delete"]')
    .forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        e.stopPropagation();

        const card = this.closest(".recipe");
        const recipeId = card.dataset.id;
        const recipe = state.recipes.find((r) => r.id === recipeId);

        if (!recipe) {
          console.error("Recipe not found:", recipeId);
          alert("Recipe not found!");
          return;
        }

        console.log("Delete clicked for:", recipe.title, "ID:", recipeId);

        if (
          !confirm(
            `Are you sure you want to delete "${recipe.title}"? This will also remove it from your meal plan and favourites.`
          )
        ) {
          return;
        }

        try {
          // Show loading state
          const originalText = this.textContent;
          this.textContent = "Deleting...";
          this.disabled = true;

          let databaseId = null;

          // Check if this is a database recipe
          if (recipeId.startsWith("db_")) {
            databaseId = recipe.db_id;
            console.log("Deleting database recipe with ID:", databaseId);

            // Delete from database
            const response = await fetch("../PHP/delete_recipe.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ recipe_id: databaseId }),
            });

            console.log("Delete response status:", response.status);

            const result = await response.json();
            console.log("Delete response:", result);

            if (!response.ok || !result.success) {
              throw new Error(result.error || "Failed to delete from database");
            }

            console.log("✅ Database deletion successful:", result.message);
          } else {
            console.log("Deleting sample recipe (local only):", recipeId);
          }

          // Remove from local state (always do this)
          console.log("Removing from local state...");

          // Remove from recipes array
          state.recipes = state.recipes.filter((r) => r.id !== recipeId);
          console.log("✅ Removed from recipes array");

          // Remove from favourites
          state.favs = state.favs.filter((favId) => favId !== recipeId);
          console.log("✅ Removed from favourites");

          // Remove from meal plans
          let planCount = 0;
          Object.keys(state.plans).forEach((date) => {
            const before = state.plans[date].length;
            state.plans[date] = state.plans[date].filter(
              (plan) => plan.id !== recipeId
            );
            const after = state.plans[date].length;

            if (before !== after) {
              planCount += before - after;
            }

            if (state.plans[date].length === 0) {
              delete state.plans[date];
            }
          });
          console.log(`✅ Removed from ${planCount} meal plan entries`);

          // Save to localStorage
          persist();
          console.log("💾 State persisted");

          // Show success notification
          if (typeof MHNotify === "function") {
            MHNotify(
              "Recipe Deleted",
              `"${recipe.title}" was successfully deleted.`
            );
          }

          // Re-render all views
          renderHome();
          renderRecipes();
          renderFavourites();
          renderCalendar();

          console.log("✅ Delete process completed successfully!");
        } catch (error) {
          console.error("❌ Delete failed:", error);
          alert(`Delete failed: ${error.message}`);

          // Reset button
          this.textContent = "Delete";
          this.disabled = false;
        }
      });
    });
}

/* Render Recipes (with Pantry Coverage grouping) */
function renderRecipes() {
  const q = (qs("#recipeSearch")?.value || "").toLowerCase();
  const list = qs("#recipeList");
  if (!list) return;
  const selectedDate = qs("#recipesDateFilter")?.value || "";
  const selectedCategory = (
    qs("#recipeCategory")?.value || "all"
  ).toLowerCase();
  const groupCoverageBtn = qs("#pantryCoverageBtn");
  const groupCoverage = !!groupCoverageBtn?.classList.contains("active");

  let filtered = state.recipes.slice();
  if (q) filtered = filtered.filter((r) => r.title.toLowerCase().includes(q));
  if (selectedCategory !== "all") {
    filtered = filtered.filter(
      (r) =>
        (r.category || "Mixed Dishes/Meals").toLowerCase() === selectedCategory
    );
  }
  if (selectedDate) {
    const plannedIds = new Set(
      (state.plans[selectedDate] || []).map((ev) => ev.id)
    );
    filtered = filtered.filter((r) => plannedIds.has(r.id));
  }

  if (groupCoverage) {
    const complete = [],
      partial = [],
      none = [];
    filtered.forEach((r) => {
      const cov = coverageForRecipe(r);
      if (cov.complete) complete.push({ r, cov });
      else if (cov.none) none.push({ r, cov });
      else partial.push({ r, cov });
    });
    complete.sort((a, b) => b.cov.pct - a.cov.pct);
    partial.sort((a, b) => b.cov.pct - a.cov.pct);

    list.className = "recipe-grid";
    list.innerHTML = "";
    const chunks = [
      { title: "Fully Complete (all ingredients in pantry)", items: complete },
      {
        title: "Partially Complete (some ingredients in pantry)",
        items: partial,
      },
      { title: "No Match (no ingredients in pantry)", items: none },
    ];
    chunks.forEach((chunk) => {
      if (!chunk.items.length) return;
      const header = document.createElement("div");
      header.className = "group-header";
      header.textContent = chunk.title;
      list.appendChild(header);
      chunk.items.forEach(({ r }) => {
        list.insertAdjacentHTML("beforeend", recipeCard(r, selectedDate));
      });
    });
    if (!complete.length && !partial.length && !none.length)
      list.innerHTML = "<p>No recipes found.</p>";
  } else {
    list.className = "recipe-grid";
    list.innerHTML =
      filtered.map((r) => recipeCard(r, selectedDate)).join("") ||
      "<p>No recipes found.</p>";
  }

  hookRecipeButtons(list);
  hookIngredientChecks(list);
  hookRecipeHoverMotion(list);
}

/* Non-tab view switches */
qsa("[data-view]:not(.tab)").forEach((btn) => {
  btn.addEventListener("click", () => {
    showView(btn.dataset.view);
    localStorage.setItem("mh_last_view", btn.dataset.view);
  });
});

/* Favourites */
function renderFavourites() {
  const wrap = qs("#favList");
  if (!wrap) return;
  const favs = state.recipes.filter((r) => state.favs.includes(r.id));
  wrap.innerHTML =
    favs.map((r) => recipeCard(r, "")).join("") || "<p>No favourites yet.</p>";
  hookRecipeButtons(wrap);
  hookIngredientChecks(wrap);
  hookRecipeHoverMotion(wrap);
}

/* Planner (Calendar) */
function renderCalendar() {
  const month = state.monthCursor;
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  qs("#monthLabel").textContent = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const cal = qs("#calendar");
  if (!cal) return;
  cal.innerHTML = "";
  for (let i = 0; i < startDay; i++) cal.innerHTML += `<div></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = fmt(new Date(year, m, d));
    const events = state.plans[dateKey] || [];
    cal.insertAdjacentHTML(
      "beforeend",
      `
      <div class="cell" data-date="${dateKey}">
        <h4>${d}</h4>
        ${events
          .map(
            (ev, idx) => `
          <div class="event">
            <span>${ev.slot}: ${ev.title}</span>
            <span><button class="btn danger" data-ev="del" data-idx="${idx}">🗑</button></span>
          </div>`
          )
          .join("")}
      </div>`
    );
  }
  qsa("#calendar .cell").forEach((cell) => {
    cell.querySelectorAll('[data-ev="del"]').forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const i = +btn.dataset.idx;
        const key = cell.dataset.date;
        state.plans[key].splice(i, 1);
        if (state.plans[key].length === 0) delete state.plans[key];
        persist();
        render();
      })
    );
    cell.addEventListener("click", () => {
      const key = cell.dataset.date;
      const filter = qs("#recipesDateFilter");
      if (filter) filter.value = key;
      showView("recipes");
      localStorage.setItem("mh_last_view", "recipes");
      renderRecipes();
    });
  });
}
qs("#prevMonth")?.addEventListener("click", () => {
  state.monthCursor.setMonth(state.monthCursor.getMonth() - 1);
  renderCalendar();
});
qs("#nextMonth")?.addEventListener("click", () => {
  state.monthCursor.setMonth(state.monthCursor.getMonth() + 1);
  renderCalendar();
});
function openPlanDialog(recipeId = null, dateKey = today(), editIndex = null) {
  const dlg = qs("#planDialog");
  const form = qs("#planForm");
  form.reset();
  delete form.dataset.recipeId;
  if (recipeId) form.dataset.recipeId = recipeId;
  form.date.value = dateKey;
  dlg.showModal();
  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const slot = data.slot;
    const date = data.date;
    const rid = form.dataset.recipeId || state.recipes[0]?.id;
    const r = state.recipes.find((rr) => rr.id === rid) || state.recipes[0];
    const item = { id: r.id, title: r.title, slot };
    if (!state.plans[date]) state.plans[date] = [];
    if (editIndex != null) state.plans[date][editIndex] = item;
    else state.plans[date].push(item);
    persist();
    dlg.close();
    render();
  };
  dlg.querySelector('button[value="cancel"]').onclick = () => dlg.close();
}

/* Pantry */
function statusOf(p) {
  if (p.qty === 0) return "out";
  if (p.qty <= 1) return "low";
  return "in";
}
function openPantryDialog(item = null) {
  const dlg = qs("#pantryDialog");
  const form = qs("#pantryForm");
  form.reset();
  delete form.dataset.editId;

  // Populate ingredient select if available
  const ingredientSelect = document.getElementById("ingredientSelect");
  if (ingredientSelect && window.populateIngredientSelect) {
    window.populateIngredientSelect(ingredientSelect);
  }

  if (item) {
    form.name.value = item.name || "";
    form.qty.value = item.qty ?? 1;
    form.unit.value = item.unit || "pcs";
    form.expiry.value = item.expiry || "";
    if (form.category) form.category.value = item.category || "";
    form.dataset.editId = item.id;
  }
  dlg.showModal();
  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const record = {
      id: form.dataset.editId || uid("p"),
      name: data.name.trim(),
      qty: Number(data.qty) || 0,
      unit: data.unit || "pcs",
      expiry: data.expiry || "",
      category: data.category || "",
    };
    if (form.dataset.editId) {
      const idx = state.pantry.findIndex((p) => p.id === form.dataset.editId);
      if (idx > -1) state.pantry[idx] = record;
    } else state.pantry.push(record);
    persist();
    dlg.close();
    renderPantry();
    renderHome();
    renderRecipes();
  };
  dlg.querySelector('button[value="cancel"]').onclick = () => dlg.close();
}
function renderPantry() {
  const tbody = qs("#pantryTable");
  if (!tbody) return;
  const q = (qs("#pantrySearch")?.value || "").toLowerCase();
  const active = qs("#pantry .chip.active")?.dataset.status || "all";
  const catFilter = (qs("#pantryCategoryFilter")?.value || "all").toLowerCase();

  let rows = state.pantry.filter((p) => p.name.toLowerCase().includes(q));
  rows = rows.filter((p) => active === "all" || statusOf(p) === active);
  if (catFilter !== "all")
    rows = rows.filter((p) => (p.category || "").toLowerCase() === catFilter);
  rows = rows.sort((a, b) => (a.expiry || "").localeCompare(b.expiry || ""));

  const html = rows
    .map(
      (p) => `
    <tr data-id="${p.id}">
      <td>${p.name}</td>
      <td>
        <div class="qty-wrap">
          <div class="qty-number">${p.qty}</div>
          <div class="qty-buttons">
            <button class="btn" data-q="-">–</button>
            <button class="btn" data-q="+">+</button>
          </div>
        </div>
      </td>
      <td>${p.unit || ""}</td>
      <td>${p.expiry || "—"}</td>
      <td>${statusOf(p)}${p.qty === 0 ? " (0)" : ""}</td>
      <td>${p.category || ""}</td>
      <td class="row-actions">
        <button class="btn" data-act="edit">Edit</button>
        <button class="btn danger" data-act="del">Delete</button>
      </td>
    </tr>`
    )
    .join("");
  tbody.innerHTML = html || '<tr><td colspan="7">No items found.</td></tr>';

  // Qty +/- (never remove at 0)
  tbody.querySelectorAll("[data-q]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;
      const it = state.pantry.find((p) => p.id === id);
      if (!it) return;

      if (e.target.dataset.q === "+") it.qty++;
      else it.qty = Math.max(0, it.qty - 1);

      if (it.qty === 0 && typeof MHNotify === "function")
        MHNotify("Pantry item at zero", `${it.name} reached 0.`);
      persist();
      renderPantry();
      renderHome();
      renderRecipes();
    });
  });

  // Delete/Edit
  tbody.querySelectorAll('[data-act="del"]').forEach((b) =>
    b.addEventListener("click", (e) => {
      const id = e.target.closest("tr").dataset.id;
      state.pantry = state.pantry.filter((p) => p.id !== id);
      persist();
      render();
    })
  );
  tbody.querySelectorAll('[data-act="edit"]').forEach((b) =>
    b.addEventListener("click", (e) => {
      const id = e.target.closest("tr").dataset.id;
      const it = state.pantry.find((p) => p.id === id);
      openPantryDialog(it);
    })
  );
}
function setupPantryChips() {
  qsa("#pantry .filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      qsa("#pantry .filters .chip").forEach((c) =>
        c.classList.remove("active")
      );
      chip.classList.add("active");
      renderPantry();
    });
  });
}
qs("#pantrySearch")?.addEventListener("input", renderPantry);
qs("#pantryCategoryFilter")?.addEventListener("change", renderPantry);
qs("#addPantryBtn")?.addEventListener("click", () => openPantryDialog());

/* Search & filters */
qs("#recipeSearch")?.addEventListener("input", renderRecipes);
qs("#recipesDateFilter")?.addEventListener("change", renderRecipes);
qs("#recipeCategory")?.addEventListener("change", renderRecipes);

// Pantry Recipes (grouping) toggle button -> add to your Recipes toolbar HTML:
// <button id="pantryCoverageBtn" class="btn">Pantry Recipes</button>
const pantryCoverageBtn = qs("#pantryCoverageBtn");
if (pantryCoverageBtn) {
  pantryCoverageBtn.addEventListener("click", () => {
    pantryCoverageBtn.classList.toggle("active");
    pantryCoverageBtn.setAttribute(
      "aria-pressed",
      pantryCoverageBtn.classList.contains("active")
    );
    renderRecipes();
  });
}

/* Home aggregate & Master render */
function renderHome() {
  renderTrending();
  renderExpiringSoon();
  renderPantrySummary();
  renderWeekStrip();
}
function render() {
  renderHome();
  renderRecipes();
  renderFavourites();
  renderCalendar();
  renderPantry();
}

// Debug functions
window.debugRecipeInfo = function (recipeId) {
  const recipe = state.recipes.find((r) => r.id === recipeId);
  if (!recipe) {
    console.log("❌ Recipe not found:", recipeId);
    return;
  }

  console.log("=== RECIPE DEBUG INFO ===");
  console.log("Title:", recipe.title);
  console.log("Frontend ID:", recipe.id);
  console.log("Database ID:", recipe.db_id);
  console.log("Is database recipe:", recipe.id.startsWith("db_"));
  console.log("Full recipe object:", recipe);
};

window.listDatabaseRecipes = function () {
  const dbRecipes = state.recipes.filter((r) => r.id.startsWith("db_"));
  console.log("=== DATABASE RECIPES ===");
  dbRecipes.forEach((recipe) => {
    console.log(`- ${recipe.title} (ID: ${recipe.id}, DB: ${recipe.db_id})`);
  });
  console.log("Total:", dbRecipes.length);
};

// Expose functions to global scope
window.state = state;
window.persist = persist;
window.render = render;
window.renderRecipes = renderRecipes;
window.renderHome = renderHome;

// Initialize ingredient system when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🏠 DOM Content Loaded - initializing systems");

  // Initialize ingredient and pantry system
  await initializeIngredientSystem();
  setupPantryForm();

  // Existing initialization
  setupPantryChips();
  render();
});

// Load database recipes when the script loads
setTimeout(async () => {
  console.log("⏰ Timeout elapsed, loading recipes...");
  if (window.refreshRecipesFromDatabase) {
    await window.refreshRecipesFromDatabase();
  }
}, 500);
// Handle pantry form submission
document
  .getElementById("pantryForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("📝 Pantry form submitted");

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    console.log("Form data:", data);

    try {
      await createPantryItem(data);
      // Close the dialog
      document.getElementById("pantryDialog").close();
      // Reset the form
      this.reset();
    } catch (error) {
      console.error("Failed to create pantry item:", error);
      alert("Failed to create pantry item: " + error.message);
    }
  });

// Handle cancel button
document
  .getElementById("pantryCancelBtn")
  .addEventListener("click", function () {
    document.getElementById("pantryDialog").close();
  });

// Handle add pantry button
document.getElementById("addPantryBtn").addEventListener("click", function () {
  document.getElementById("pantryDialog").showModal();
});
