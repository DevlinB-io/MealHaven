<?php
header('Content-Type: application/json');

require_once '../DATABASE/database_connection.php';

if ($database_connection->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $database_connection->connect_error]);
    exit;
}

try {
    $result = $database_connection->query("
        SELECT 
            RECIPE_ID as id,
            RECIPE_NAME as name,
            INGREDIENTS as ingredients,
            RECIPE_INSTRUCTIONS as instructions,
            RECIPE_DIFFICULTY_LEVEL as difficulty,
            RECIPE_PREP_TIME_MINUTES as prep_time,
            RECIPE_COOKING_TIME_MINUTES as cook_time,
            CALORIES as calories,
            SERVING_SIZE as serving_size,
            CATEGORY as category,
            RECIPE_IMAGE as image_path,
            CREATED_AT as created_at,
            USER_ID as user_id
        FROM RECIPE 
        ORDER BY CREATED_AT DESC
    ");
    
    if ($result === false) {
        throw new Exception($database_connection->error);
    }
    
    $recipes = [];
    while ($row = $result->fetch_assoc()) {
        $recipes[] = $row;
    }
    
    if (empty($recipes)) {
        echo json_encode([]);
        exit;
    }
    
    echo json_encode($recipes);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$database_connection->close();
?>