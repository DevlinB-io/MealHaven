<?php
// start session
session_start();

// check if logged in
if (isset($_SESSION['user_id'])) {
    // connect to database
    require_once 'db_connect.php';

    // get user id
    $userId = $_SESSION['user_id'];
    // prepare query
    $stmt = $conn->prepare("SELECT user_first_name, user_last_name FROM users WHERE user_id = ?");
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
            'firstName' => $user['user_first_name'],
            'lastName' => $user['user_last_name'],
            'initials' => strtoupper(substr($user['user_first_name'], 0, 1) . substr($user['user_last_name'], 0, 1))
        ]);
    } else {
        // user not found
        echo json_encode(['loggedIn' => false]);
    }

    // close statement
    $stmt->close();
    // close connection
    $conn->close();
} else {
    // not logged in
    echo json_encode(['loggedIn' => false]);
}
