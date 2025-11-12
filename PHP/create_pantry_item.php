<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ob_start();

// Start session to get the actual logged-in user
session_start();

require_once '../DATABASE/database_connection.php';

function sendResponse($success, $message = '', $error = '') {
    ob_clean();
    
    $response = ['success' => $success];
    if ($success) {
        $response['message'] = $message;
    } else {
        $response['error'] = $error;
    }
    
    echo json_encode($response);
    exit;
}

if ($database_connection->connect_error) {
    sendResponse(false, '', 'Database connection failed: ' . $database_connection->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, '', 'Invalid request method. Expected POST.');
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    sendResponse(false, '', 'Please log in to add pantry items.');
}

try {
    $ingredient_id = isset($_POST['ingredient_id']) ? intval($_POST['ingredient_id']) : 0;
    $ingredient_name = isset($_POST['ingredient_name']) ? trim($_POST['ingredient_name']) : '';
    $quantity = isset($_POST['quantity']) ? floatval($_POST['quantity']) : 0;
    $purchase_date = isset($_POST['purchase_date']) ? $_POST['purchase_date'] : date('Y-m-d');
    $expiry_date = isset($_POST['expiry_date']) ? ($_POST['expiry_date'] ?: null) : null;
    $barcode = isset($_POST['barcode']) ? trim($_POST['barcode']) : '';
    $location_in_pantry = isset($_POST['location_in_pantry']) ? trim($_POST['location_in_pantry']) : '';
    
    // Use the actual logged-in user ID from session
    $user_id = $_SESSION['user_id'];

    if ($ingredient_id <= 0) {
        sendResponse(false, '', 'Valid ingredient is required.');
    }

    if ($quantity <= 0) {
        sendResponse(false, '', 'Valid quantity is required.');
    }

    if (empty($purchase_date)) {
        sendResponse(false, '', 'Purchase date is required.');
    }

    // Verify the user exists in the database
    $user_check_stmt = $database_connection->prepare("SELECT USER_ID FROM USER WHERE USER_ID = ?");
    $user_check_stmt->bind_param("i", $user_id);
    $user_check_stmt->execute();
    $user_check_result = $user_check_stmt->get_result();
    
    if ($user_check_result->num_rows === 0) {
        sendResponse(false, '', 'User account not found. Please log in again.');
    }
    $user_check_stmt->close();

    $check_stmt = $database_connection->prepare("SELECT INGREDIENT_ID, INGREDIENT_NAME FROM INGREDIENT WHERE INGREDIENT_ID = ?");
    $check_stmt->bind_param("i", $ingredient_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        sendResponse(false, '', 'Ingredient not found with ID: ' . $ingredient_id);
    }
    
    $ingredient_row = $check_result->fetch_assoc();
    if (empty($ingredient_name)) {
        $ingredient_name = $ingredient_row['INGREDIENT_NAME'];
    }
    
    $check_stmt->close();

    $stmt = $database_connection->prepare("
        INSERT INTO PANTRY 
        (USER_ID, INGREDIENT_ID, INGREDIENT_NAME, QUANTITY, PURCHASE_DATE, EXPIRY_DATE, BARCODE, LOCATION_IN_PANTRY)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$stmt) {
        sendResponse(false, '', 'Prepare failed: ' . $database_connection->error);
    }

    if (empty($expiry_date)) {
        $expiry_date = null;
    }
    if (empty($barcode)) {
        $barcode = null;
    }
    if (empty($location_in_pantry)) {
        $location_in_pantry = null;
    }

    $stmt->bind_param(
        "iisdssss",
        $user_id,
        $ingredient_id,
        $ingredient_name,
        $quantity,
        $purchase_date,
        $expiry_date,
        $barcode,
        $location_in_pantry
    );

    if ($stmt->execute()) {
        sendResponse(true, 'Pantry item added successfully!');
    } else {
        sendResponse(false, '', 'Database error: ' . $stmt->error);
    }

    $stmt->close();

} catch (Exception $e) {
    sendResponse(false, '', 'Unexpected error: ' . $e->getMessage());
}

$database_connection->close();
?>