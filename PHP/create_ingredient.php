<?php
require_once '../DATABASE/database_connection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST['name']);
    $category = trim($_POST['category'] ?? '');
    $unit_of_measurement = trim($_POST['unit_of_measurement'] ?? '');
    $shelf_life_days = intval($_POST['shelf_life_days'] ?? 0);
    $barcode = trim($_POST['barcode'] ?? '');

    if (!$name) {
        echo json_encode(['success' => false, 'error' => 'Ingredient name is required.']);
        exit;
    }

    $check_stmt = $database_connection->prepare("SELECT INGREDIENT_ID FROM INGREDIENT WHERE INGREDIENT_NAME = ?");
    $check_stmt->bind_param("s", $name);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'Ingredient already exists.']);
        exit;
    }
    $check_stmt->close();

    $stmt = $database_connection->prepare("
        INSERT INTO INGREDIENT 
        (INGREDIENT_NAME, INGREDIENT_CATEGORY, UNIT_OF_MEASUREMENT, INGREDIENT_SHELF_LIFE_DAYS, INGREDIENT_BARCODE_SCAN)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "sssis",
        $name,
        $category,
        $unit_of_measurement,
        $shelf_life_days,
        $barcode
    );

    if ($stmt->execute()) {
        $ingredient_id = $stmt->insert_id;
        echo json_encode([
            'success' => true, 
            'message' => 'Ingredient created successfully!',
            'ingredient_id' => $ingredient_id,
            'ingredient_name' => $name
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $stmt->error]);
    }

    $stmt->close();
    $database_connection->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>