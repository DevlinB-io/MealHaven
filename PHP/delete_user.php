<?php
session_start();
header('Content-Type: application/json');

require_once '../DATABASE/database_connection.php';

if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? 0;

    if (!$user_id) {
        echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
        exit;
    }

    try {
        $database_connection->begin_transaction();

        $check_stmt = $database_connection->prepare("SELECT USER_ROLE FROM USER WHERE USER_ID = ?");
        $check_stmt->bind_param("i", $user_id);
        $check_stmt->execute();
        $user = $check_stmt->get_result()->fetch_assoc();

        if (!$user) {
            throw new Exception("User not found");
        }

        if ($user['USER_ROLE'] === 'ADMIN') {
            throw new Exception("Cannot delete admin users");
        }

        $delete_stmt = $database_connection->prepare("DELETE FROM USER WHERE USER_ID = ?");
        $delete_stmt->bind_param("i", $user_id);

        if ($delete_stmt->execute()) {
            $database_connection->commit();
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } else {
            throw new Exception("Failed to delete user");
        }

    } catch (Exception $e) {
        $database_connection->rollback();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
?>