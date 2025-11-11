<?php

// connect to database
require_once '../DATABASE/database_connection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // get form data
    $name = trim($_POST['name']);
    $description = trim($_POST['description'] ?? '');
    $instructions = trim($_POST['instructions']);
    $difficulty = $_POST['difficulty'] ?? 'EASY';
    $prep_time = intval($_POST['prep_time'] ?? 0);
    $cook_time = intval($_POST['cook_time'] ?? 0);
    $calories = floatval($_POST['calories'] ?? 0);
    $serving_size = intval($_POST['serving_size'] ?? 1);
    $category = trim($_POST['category'] ?? 'Mixed Dishes/Meals');
    $ingredients = trim($_POST['ingredients'] ?? '');
    $user_id = $_POST['user_id'] ?? null; // optional if logged in

    // validate required fields
    if (!$name || !$instructions || !$ingredients) {
        showErrorPage("Please fill in name, ingredients, and instructions.");
    }

    // handle image upload
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $newName = uniqid('recipe_', true) . '.' . $ext;
        $uploadDir = '../IMAGES/recipes/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        $targetPath = $uploadDir . $newName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $imagePath = $targetPath;
        }
    }

    // prepare insert query
    $stmt = $database_connection->prepare("
        INSERT INTO RECIPE
        (RECIPE_NAME, RECIPE_DESCRIPTION, RECIPE_INSTRUCTIONS, RECIPE_DIFFICULTY_LEVEL, RECIPE_PREP_TIME_MINUTES, RECIPE_COOKING_TIME_MINUTES, CALORIES, SERVING_SIZE, RECIPE_IMAGE, CATEGORY, INGREDIENTS, USER_ID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "ssssiiddsssi",
        $name,
        $description,
        $instructions,
        $difficulty,
        $prep_time,
        $cook_time,
        $calories,
        $serving_size,
        $imagePath,
        $category,
        $ingredients,
        $user_id
    );

    if ($stmt->execute()) {
        showSuccessPage("Recipe \"$name\" created successfully!");
    } else {
        showErrorPage("Database error: " . $stmt->error);
    }

    $stmt->close();
    $database_connection->close();
}

// ----------------------
// HTML templates
// ----------------------
function showErrorPage($message)
{
    echo "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>Error</title></head><body><h1>Error</h1><p>" . htmlspecialchars($message) . "</p><a href='../HTML/main_website.html'>Back</a></body></html>";
    exit();
}

function showSuccessPage($message)
{
    echo "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>Success</title><meta http-equiv='refresh' content='3;url=../HTML/main_website.html'></head><body><h1>Success</h1><p>" . htmlspecialchars($message) . "</p><a href='../HTML/main_website.html'>Go to Recipes</a></body></html>";
    exit();
}
?>
