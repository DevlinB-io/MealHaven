<?php
session_start();
header('Content-Type: application/json');

require_once '../DATABASE/database_connection.php';

if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

try {
    $totalUsers = $database_connection->query("
        SELECT COUNT(*) as count FROM USER WHERE USER_ROLE = 'USER'
    ")->fetch_assoc()['count'];

    $activeUsers = $database_connection->query("
        SELECT COUNT(DISTINCT USER_ID) as count 
        FROM (
            SELECT USER_ID FROM RECIPE WHERE CREATED_AT >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            UNION 
            SELECT USER_ID FROM PANTRY WHERE PANTRY_CREATED_AT >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ) as active_users
    ")->fetch_assoc()['count'];

    $totalRecipes = $database_connection->query("
        SELECT COUNT(*) as count FROM RECIPE
    ")->fetch_assoc()['count'];

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