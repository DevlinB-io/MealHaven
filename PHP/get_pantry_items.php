<?php
header('Content-Type: application/json');

// Start session to get the actual logged-in user
session_start();

require_once '../DATABASE/database_connection.php';

if ($database_connection->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $database_connection->connect_error]);
    exit;
}

try {
    // Check if user is logged in, otherwise return empty array
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([]);
        exit;
    }
    
    // Use the actual logged-in user ID from session
    $user_id = $_SESSION['user_id'];
    
    $stmt = $database_connection->prepare("
        SELECT 
            p.PANTRY_ID as id,
            p.USER_ID as user_id,
            p.INGREDIENT_ID as ingredient_id,
            p.INGREDIENT_NAME as name,
            p.QUANTITY as quantity,
            p.PURCHASE_DATE as purchase_date,
            p.EXPIRY_DATE as expiry_date,
            p.BARCODE as barcode,
            p.LOCATION_IN_PANTRY as location,
            i.UNIT_OF_MEASUREMENT as unit,
            i.INGREDIENT_CATEGORY as category
        FROM PANTRY p
        LEFT JOIN INGREDIENT i ON p.INGREDIENT_ID = i.INGREDIENT_ID
        WHERE p.USER_ID = ?
        ORDER BY p.EXPIRY_DATE ASC, p.INGREDIENT_NAME ASC
    ");
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $pantry_items = [];
    while ($row = $result->fetch_assoc()) {
        $pantry_items[] = $row;
    }
    
    echo json_encode($pantry_items);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$database_connection->close();
?>