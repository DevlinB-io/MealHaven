<?php
require_once '../DATABASE/database_connection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if (empty($email) || empty($password)) {
        showErrorPage("Both email and password are required.");
    }

    $stmt = $database_connection->prepare("SELECT USER_ID, PASSWORD FROM USER WHERE USER_EMAIL_ADDRESS = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
       
        if (password_verify($password, $user['PASSWORD'])) {
            session_start();
            $_SESSION['user_id'] = $user['USER_ID'];
            header("Location: ../HTML/login.html");
            exit();
        } else {
            showErrorPage("Invalid password. Please try again.");
        }
    } else {
        showErrorPage("No account found with that email address.");
    }

    $stmt->close();
    $database_connection->close();
}

function showErrorPage($message)
{
    echo  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="3;url=../HTML/main_website.html">
<title>Login Failed - MealHaven</title>
<style>
    body {
        font-family: "Inter", system-ui, sans-serif;
        background-color: #f1f5f9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
    }
    .card {
        background-color: #ffffff;
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        padding: 50px 40px;
        text-align: center;
        width: 400px;
        max-width: 90%;
    }
    .cross {
        width: 90px;
        height: 90px;
        background-color: #ef4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        box-shadow: 0 4px 12px rgba(239,68,68,0.25);
    }
    .cross svg {
        width: 45px;
        height: 45px;
        stroke: #ffffff;
        stroke-width: 4;
        fill: none;
    }
    h1 {
        font-size: 22px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 10px;
    }
    p {
        color: #64748b;
        font-size: 15px;
        margin-bottom: 24px;
    }
    a.btn {
        display: inline-block;
        background: #ef4444;
        color: #fff;
        padding: 12px 24px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    a.btn:hover {
        background: #dc2626;
        transform: translateY(-2px);
    }
</style>
</head>
<body>
    <div class="card">
        <div class="cross">
            <svg viewBox="0 0 24 24">
                <path d="M6 6L18 18M6 18L18 6"></path>
            </svg>
        </div>
        <h1>Login Failed</h1>
        <p>' . htmlspecialchars($message) . '</p>
        <a href="../HTML/main_website.html" class="btn">Back to Login</a>
    </div>
</body>
</html>';

    exit();
}
