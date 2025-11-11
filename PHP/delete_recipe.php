<?php
// delete_recipe.php
header('Content-Type: application/json');

// Include database connection
require_once '../DATABASE/database_connection.php';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

// Get the raw POST data
$input = json_decode(file_get_contents('php://input'), true);
$recipe_id = isset($input['recipe_id']) ? intval($input['recipe_id']) : 0;

if ($recipe_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid recipe ID: ' . $recipe_id]);
    exit;
}

try {
    // Check if recipe exists first
    $check_sql = "SELECT RECIPE_ID, RECIPE_NAME FROM RECIPE WHERE RECIPE_ID = ?";
    $check_stmt = $database_connection->prepare($check_sql);
    $check_stmt->bind_param("i", $recipe_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $recipe = $result->fetch_assoc();
    $check_stmt->close();

    if (!$recipe) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Recipe not found in database']);
        exit;
    }

    // Delete the recipe
    $delete_sql = "DELETE FROM RECIPE WHERE RECIPE_ID = ?";
    $delete_stmt = $database_connection->prepare($delete_sql);
    $delete_stmt->bind_param("i", $recipe_id);

    if ($delete_stmt->execute()) {
        $affected_rows = $delete_stmt->affected_rows;
        $delete_stmt->close();
        
        if ($affected_rows > 0) {
            echo json_encode([
                'success' => true, 
                'message' => 'Recipe "' . $recipe['RECIPE_NAME'] . '" deleted successfully',
                'deleted_id' => $recipe_id
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No rows affected - recipe not deleted']);
        }
    } else {
        throw new Exception($delete_stmt->error);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$database_connection->close();
?>