<?php
// start session
session_start();

// check if logged in
if (isset($_SESSION['user_id'])) {
    // connect to database
    require_once '../DATABASE/database_connection.php';

    // get user id
    $userId = $_SESSION['user_id'];
    // prepare query
    $stmt = $database_connection->prepare("SELECT USER_FIRST_NAME, USER_LAST_NAME FROM USER WHERE USER_ID = ?");
    // bind user id
    $stmt->bind_param("i", $userId);
    // run query
    $stmt->execute();
    // get results
    $result = $stmt->get_result();

    // check if user exists
    if ($result->num_rows === 1) {
        // get user data
        $user = $result->fetch_assoc();
        // send user info as json
        echo json_encode([
            'loggedIn' => true,
            'firstName' => $user['USER_FIRST_NAME'],
            'lastName' => $user['USER_LAST_NAME'],
            'initials' => strtoupper(substr($user['USER_FIRST_NAME'], 0, 1) . substr($user['USER_LAST_NAME'], 0, 1))
        ]);
    } else {
        // user not found
        echo json_encode(['loggedIn' => false]);
    }

    // close statement
    $stmt->close();
    // close connection
    $database_connection->close();
} else {
    // not logged in
    echo json_encode(['loggedIn' => false]);
}
