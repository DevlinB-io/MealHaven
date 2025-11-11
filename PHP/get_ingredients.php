<?php
header('Content-Type: application/json');
require_once '../DATABASE/database_connection.php';

// Check connection
if ($database_connection->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $database_connection->connect_error]);
    exit;
}

try {
    // Get ingredients from database
    $result = $database_connection->query("
        SELECT 
            INGREDIENT_ID as id,
            INGREDIENT_NAME as name,
            INGREDIENT_CATEGORY as category,
            UNIT_OF_MEASUREMENT as unit,
            INGREDIENT_SHELF_LIFE_DAYS as shelf_life,
            INGREDIENT_BARCODE_SCAN as barcode,
            INGREDIENT_CREATED_AT as created_at
        FROM INGREDIENT 
        ORDER BY INGREDIENT_NAME ASC
    ");
    
    if ($result === false) {
        throw new Exception($database_connection->error);
    }
    
    $ingredients = [];
    while ($row = $result->fetch_assoc()) {
        $ingredients[] = $row;
    }
    
    echo json_encode($ingredients);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$database_connection->close();
?>