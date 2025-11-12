<?php
require_once '../DATABASE/database_connection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    if (empty($first_name) || empty($last_name) || empty($email) || empty($password) || empty($confirm_password)) {
        showErrorPage("All required fields must be filled out.");
    }

    if ($password !== $confirm_password) {
        showErrorPage("Passwords do not match.");
    }

    $checkEmail = $database_connection->prepare("SELECT USER_EMAIL_ADDRESS FROM USER WHERE USER_EMAIL_ADDRESS = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $checkEmail->store_result();

    if ($checkEmail->num_rows() > 0) {
        showErrorPage("This email is already registered. Please log in instead.");
    }
    
        $checkPhone = $database_connection->prepare("SELECT USER_PHONE_NUMBER FROM USER WHERE USER_PHONE_NUMBER = ?");
        $checkPhone->bind_param("s", $phone);
        $checkPhone->execute();
        $checkPhone->store_result();

        if ($checkPhone->num_rows() > 0) {
           showErrorPage('This phone number is already registered.');
        }
   

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $database_connection->prepare("
    INSERT INTO USER
    (USER_FIRST_NAME, USER_LAST_NAME, USER_EMAIL_ADDRESS, USER_PHONE_NUMBER, PASSWORD)
    VALUES (?, ?, ?, ?, ?)");

    $stmt->bind_param("sssss", $first_name, $last_name, $email, $phone, $hashed_password);

    if ($stmt->execute()) {
        session_start();

        $newUserId = $database_connection->insert_id;

        $_SESSION['user_id'] = $newUserId;

        showSuccessPage("Account created successfully! Redirecting to your dashboard...");
    } else {
        showErrorPage("Error creating account: " . $stmt->error);
    }
    $stmt->close();
    $checkEmail->close();

    $database_connection->close();
}

function showErrorPage($message)
{
    echo '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="3;url=../HTML/main_website.html">
<title>Registration Failed - MealHaven</title>
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
        <h1>Registration Failed</h1>
        <p>' . htmlspecialchars($message) . '</p>
        <a href="../HTML/register.html" class="btn">Back to Sign Up</a>
    </div>
</body>
</html>';
    exit();
}

function showSuccessPage($message)
{
    echo '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="3;url=../HTML/main_website.html">
<title>Registration Successful - MealHaven</title>
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
    .checkmark {
        width: 90px;
        height: 90px;
        background-color: #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        box-shadow: 0 4px 12px rgba(34,197,94,0.25);
    }
    .checkmark svg {
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
        background: #22c55e;
        color: #fff;
        padding: 12px 24px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    a.btn:hover {
        background: #16a34a;
        transform: translateY(-2px);
    }
</style>
</head>
<body>
    <div class="card">
        <div class="checkmark">
            <svg viewBox="0 0 24 24">
                <path d="M20 6L9 17L4 12"></path>
            </svg>
        </div>
        <h1>Registration Successful</h1>
        <p>' . htmlspecialchars($message) . '</p>
        <a href="../HTML/main_website.html" class="btn">Get Started</a>
    </div>
</body>
</html>';
    exit();
}
