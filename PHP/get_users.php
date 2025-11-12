<?php
session_start();
header('Content-Type: application/json');

require_once '../DATABASE/database_connection.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

try {
    // Get all regular users (not admins) with their recipe counts
    $stmt = $database_connection->prepare("
        SELECT 
            u.USER_ID,
            u.USER_FIRST_NAME,
            u.USER_LAST_NAME,
            u.USER_EMAIL_ADDRESS,
            u.USER_PHONE_NUMBER,
            u.USER_ACCOUNT_CREATED_AT,
            COUNT(r.RECIPE_ID) as recipe_count
        FROM USER u
        LEFT JOIN RECIPE r ON u.USER_ID = r.USER_ID
        WHERE u.USER_ROLE = 'USER'
        GROUP BY u.USER_ID
        ORDER BY u.USER_ACCOUNT_CREATED_AT DESC
    ");

    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];

    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    echo json_encode([
        'success' => true,
        'users' => $users
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>