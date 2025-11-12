<?php
session_start();

if (isset($_SESSION['user_id'])) {
    require_once '../DATABASE/database_connection.php';
    $userId = $_SESSION['user_id'];
    $stmt = $database_connection->prepare("SELECT USER_FIRST_NAME, USER_LAST_NAME FROM USER WHERE USER_ID = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode([
            'loggedIn' => true,
            'firstName' => $user['USER_FIRST_NAME'],
            'lastName' => $user['USER_LAST_NAME'],
            'initials' => strtoupper(substr($user['USER_FIRST_NAME'], 0, 1) . substr($user['USER_LAST_NAME'], 0, 1))
        ]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }

    $stmt->close();
    $database_connection->close();
} else {
    echo json_encode(['loggedIn' => false]);
}
