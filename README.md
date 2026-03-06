# MealHaven

> Plan smart • Waste less • Eat better

MealHaven is an intelligent meal planning and grocery management web application. It allows users to discover and create recipes, manage their pantry, plan meals for the week, and maintain dietary preferences — all in one place. The platform includes a full user authentication system and a separate admin portal for platform management.

---

## Features

### User-Facing
- **Authentication** — Register, login, logout with full session management
- **Forgot & Reset Password** — Secure token-based password recovery via email
- **Recipe Management** — Browse, create, and save recipes with images, ingredients, instructions, difficulty level, and prep/cook times
- **Meal Planner** — Plan meals across the week
- **Pantry Management** — Track ingredients, quantities, purchase dates, and expiry dates
- **Favourites** — Save preferred recipes for quick access
- **User Preferences** — Set dietary restrictions, allergies, health goals, household size, and budget limit
- **Notifications** — In-app notification system

### Admin Portal
- **Admin Dashboard** — View platform statistics and manage users
- **User Management** — View and delete user accounts
- **Admin Login** — Separate secure admin authentication

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | PHP 8 |
| Database | MySQL (via phpMyAdmin / MariaDB) |
| Local Server | XAMPP (Apache + MySQL) |
| Fonts | Google Fonts — Inter |

---

## Project Structure

```
MealHaven/
├── CSS/                          # Stylesheets for each page/component
│   ├── index.css                 # Landing/splash screen styles
│   ├── main_website.css          # Main app styles
│   ├── user_login.css            # Login page styles
│   ├── register_user.css         # Registration page styles
│   ├── forgot_password.css       # Forgot password styles
│   ├── reset_password.css        # Reset password styles
│   ├── admin_login.css           # Admin login styles
│   ├── admin_dashboard.css       # Admin dashboard styles
│   ├── recipe_modal.css          # Recipe modal/overlay styles
│   ├── pantry_modal.css          # Pantry modal styles
│   ├── preferences_modal.css     # User preferences modal styles
│   ├── privacy.css               # Privacy policy styles
│   └── terms.css                 # Terms and conditions styles
│
├── HTML/                         # Frontend HTML pages
│   ├── main_website.html         # Main app (recipes, planner, pantry, favourites)
│   ├── login.html                # User login page
│   ├── register.html             # User registration page
│   ├── forgot_password.html      # Forgot password page
│   ├── reset_password.html       # Password reset page
│   ├── admin_login.html          # Admin login page
│   ├── admin_dashboard.html      # Admin dashboard
│   ├── privacy.html              # Privacy policy
│   └── terms.html                # Terms and conditions
│
├── JAVASCRIPT/                   # Frontend logic
│   ├── index.js                  # Splash screen logic
│   ├── main_website.js           # Main app interactions
│   ├── create_recipe.js          # Recipe creation form logic
│   ├── database_recipes.js       # Recipe data operations
│   ├── database_ingredients.js   # Ingredient data operations
│   ├── database_pantry.js        # Pantry data operations
│   ├── admin_dashboard.js        # Admin dashboard logic
│   └── session-handler.js        # Session validation and redirect logic
│
├── PHP/                          # Backend PHP scripts
│   ├── index.php                 # Entry point / splash redirect
│   ├── register_user.php         # Handles user registration
│   ├── login_user.php            # Handles user login
│   ├── logout.php                # Clears user session
│   ├── forgot_password.php       # Sends password reset email
│   ├── reset_password.php        # Handles password reset
│   ├── check_session.php         # Validates active session
│   ├── create_recipe.php         # Saves new recipes to database
│   ├── get_recipes.php           # Fetches recipes from database
│   ├── delete_recipe.php         # Deletes a recipe
│   ├── create_ingredient.php     # Adds an ingredient
│   ├── get_ingredients.php       # Fetches ingredients
│   ├── create_pantry_item.php    # Adds item to pantry
│   ├── get_pantry_items.php      # Fetches pantry items
│   ├── delete_pantry_item.php    # Removes pantry item
│   ├── admin_login.php           # Handles admin authentication
│   ├── admin_logout.php          # Clears admin session
│   ├── get_admin_stats.php       # Returns platform stats for dashboard
│   ├── get_users.php             # Returns all registered users
│   ├── delete_user.php           # Deletes a user account
│   └── insert_admin_user_once.php # One-time admin account seeder
│
├── DATABASE/
│   ├── database_connection.php   # Database connection setup
│   └── database_table_scrips.php # Creates all database tables on first run
│
├── IMAGES/                       # Static assets
│   ├── logo.png                  # MealHaven logo
│   ├── logo.svg                  # MealHaven logo (vector)
│   ├── [recipe food images]      # Default recipe imagery
│   └── recipes/                  # User-uploaded recipe images (gitignored)
│
├── .gitignore
└── README.md
```

---

## Setup Instructions

### 1. Install Required Software

- **XAMPP** — provides Apache (web server) and MySQL (database) locally

### 2. Set Up XAMPP

1. Download and install [XAMPP](https://www.apachefriends.org/index.html)
2. Open the XAMPP Control Panel and start **Apache** and **MySQL**

### 3. Place Project Files

Copy the `MealHaven` folder into XAMPP's web root:

```
C:\xampp\htdocs\MealHaven\
```

### 4. Create the Database

1. Open your browser and go to `http://localhost/phpmyadmin/`
2. Create a new database named `mealhaven`
3. Navigate to `http://localhost/MealHaven/DATABASE/database_table_scrips.php`

> This script runs automatically and creates all required tables in your database. You only need to run it once.

### 5. Configure the Database Connection

Open `DATABASE/database_connection.php` and confirm the credentials match your local setup:

```php
$database_host     = "localhost";
$database_user     = "root";
$database_password = "";        // update this if you set a MySQL password
$db_name           = "mealhaven";
```

> **Note for developers:** For production environments, never store credentials directly in source files. Use environment variables or a `.env` file (which should be listed in `.gitignore`).

### 6. Create the Admin Account

Navigate to the following URL once in your browser:

```
http://localhost/MealHaven/PHP/insert_admin_user_once.php
```

This seeds the admin account. Default admin credentials:
- **Email:** `admin@mealhaven.com`
- **Password:** `password`

> Change the admin password immediately after first login in a production environment.

### 7. Run the Application

Open your browser and go to:

```
http://localhost/MealHaven/PHP/index.php
```

---

## Database Tables

| Table | Description |
|-------|-------------|
| `USER` | Stores user accounts (name, email, phone, password hash, role, subscription) |
| `USER_PREFERENCES` | Dietary restrictions, allergies, health goals, budget, household size |
| `RECIPE` | Recipes with name, description, instructions, difficulty, prep/cook time, image |
| `INGREDIENT` | Ingredient catalogue with categories, units, shelf life, barcode |
| `PANTRY` | User pantry — links users to ingredients with quantity and expiry tracking |
| `password_reset` | Tracks secure password reset tokens and expiry times |

---

## Contributors

| Contributor | GitHub | Contribution |
|-------------|--------|--------------|
| Devlin B. | [@DevlinB-io](https://github.com/DevlinB-io) | Frontend & backend authentication (register, login, forgot password, reset password, session management), MySQL database |
| CodingPhishKeys | [@CodingPhishKeys](https://github.com/CodingPhishKeys) | Project management — project timeline, risk management, documentation, stakeholder liaison, change management |
| Caleb595 | [@Caleb595](https://github.com/Caleb595) | Software development — backend APIs, frontend screens, barcode integration, database infrastructure, testing |
