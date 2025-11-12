<?php
session_start();
header('Content-Type: application/json');

require_once '../DATABASE/database_connection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Email and password are required.']);
        exit;
    }

    try {
        $stmt = $database_connection->prepare("
            SELECT USER_ID, USER_FIRST_NAME, USER_LAST_NAME, PASSWORD, USER_ROLE 
            FROM USER 
            WHERE USER_EMAIL_ADDRESS = ? AND USER_ROLE = 'ADMIN'
        ");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode(['success' => false, 'error' => 'Invalid admin credentials.']);
            exit;
        }

        $user = $result->fetch_assoc();

        if (password_verify($password, $user['PASSWORD'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_user_id'] = $user['USER_ID'];
            $_SESSION['admin_name'] = $user['USER_FIRST_NAME'] . ' ' . $user['USER_LAST_NAME'];
            
            echo json_encode([
                'success' => true,
                'user_id' => $user['USER_ID'],
                'name' => $user['USER_FIRST_NAME'] . ' ' . $user['USER_LAST_NAME']
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid admin credentials.']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>