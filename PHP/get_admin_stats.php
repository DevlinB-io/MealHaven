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
    // Get total users (non-admin)
    $totalUsers = $database_connection->query("
        SELECT COUNT(*) as count FROM USER WHERE USER_ROLE = 'USER'
    ")->fetch_assoc()['count'];

    // Get active users (users with activity in last 30 days)
    $activeUsers = $database_connection->query("
        SELECT COUNT(DISTINCT USER_ID) as count 
        FROM (
            SELECT USER_ID FROM RECIPE WHERE CREATED_AT >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            UNION 
            SELECT USER_ID FROM PANTRY WHERE PANTRY_CREATED_AT >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ) as active_users
    ")->fetch_assoc()['count'];

    // Get total recipes
    $totalRecipes = $database_connection->query("
        SELECT COUNT(*) as count FROM RECIPE
    ")->fetch_assoc()['count'];

    // Get recent users (last 7 days)
    $recentUsers = $database_connection->query("
        SELECT COUNT(*) as count FROM USER 
        WHERE USER_ROLE = 'USER' 
        AND USER_ACCOUNT_CREATED_AT >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ")->fetch_assoc()['count'];

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_users' => (int)$totalUsers,
            'active_users' => (int)$activeUsers,
            'total_recipes' => (int)$totalRecipes,
            'recent_users' => (int)$recentUsers
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>