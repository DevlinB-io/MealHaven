<?php

// connect to database
require_once 'db_connect.php';

// check if form submitted
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // get form data
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    // check all fields filled
    if (empty($first_name) || empty($last_name) || empty($email) || empty($password) || empty($confirm_password)) {
        showErrorPage("All required fields must be filled out.");
    }

    // check passwords match
    if ($password !== $confirm_password) {
        showErrorPage("Passwords do not match.");
    }

    // check if email already exists
    $checkEmail = $conn->prepare("SELECT user_email_address FROM users WHERE user_email_address = ?");

    // bind email
    $checkEmail->bind_param("s", $email);

    // run query
    $checkEmail->execute();

    // store results
    $checkEmail->store_result();

    // check if email found
    if ($checkEmail->num_rows() > 0) {
        showErrorPage("This email is already registered. Please log in instead.");
    }

    // hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // prepare insert query
    $stmt = $conn->prepare("
    INSERT INTO users
    (user_first_name, user_last_name, user_email_address, user_phone_number, user_password)
    VALUES (?, ?, ?, ?, ?)");

    // bind all values
    $stmt->bind_param("sssss", $first_name, $last_name, $email, $phone, $hashed_password);

    // save user to database
    if ($stmt->execute()) {
        // start session
        session_start();

        // get new user id
        $newUserId = $conn->insert_id;

        // store user id in session
        $_SESSION['user_id'] = $newUserId;

        // show success message and redirect
        showSuccessPage("Account created successfully! Redirecting to your dashboard...");
    } else {
        // show error
        showErrorPage("Error creating account: " . $stmt->error);
    }
    // close statements
    $stmt->close();
    $checkEmail->close();

    // close connection
    $conn->close();
}

function showErrorPage($message)
{
    echo '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Registration Error - MealHaven</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
:root {
    --primary: #22c55e;
    --secondary: #f97316;
    --error: #ef4444;
    --text: #1e293b;
    --text-light: #64748b;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; font-family: "Inter", system-ui, sans-serif; }
body { display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
.error-card { background: #fff; border: 1px solid #fecaca; border-radius: 16px; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.1); text-align: center; padding: 40px; max-width: 400px; width: 100%; }
.logo-container { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px; }
.logo { width: 60px; height: 60px; }
.brand { font-weight: 800; font-size: 24px; letter-spacing: -0.5px; }
.brand .meal { color: var(--primary); }
.brand .haven { color: var(--secondary); }
h2 { color: var(--error); margin-bottom: 12px; font-size: 24px; }
p { color: var(--text-light); margin-bottom: 24px; font-size: 15px; }
a.btn { display: inline-block; background: var(--error); color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; }
a.btn:hover { background: #dc2626; transform: translateY(-2px); }
</style>
<meta http-equiv="refresh" content="3;url=../index.html" />
</head>
<body>
<div class="error-card">
    <div class="logo-container">
        <svg class="logo" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M92 16c12 2 22 10 26 18-8 6-20 10-36 10-10 0-20-2-28-6 8-14 22-23 38-22z" fill="#22c55e" opacity="0.9" />
            <path d="M16 56l48-28 48 28v10l-48-26-48 26V56z" fill="#22c55e" />
            <path d="M28 58h72v50a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V58z" fill="#f97316" opacity="0.9" />
            <path d="M56 88a8 8 0 0 1 16 0v26H56V88z" fill="#1e293b" opacity="0.85" />
            <g fill="#1e293b" opacity="0.85">
                <rect x="44" y="66" width="10" height="10" rx="1.5" />
                <rect x="58" y="66" width="10" height="10" rx="1.5" />
            </g>
            <path d="M40 106V70c0-1.7 1.3-3 3-3s3 1.3 3 3v8h2v-8c0-1.7 1.3-3 3-3s3 1.3 3 3v36h-14z" fill="#1e293b" opacity="0.85" />
            <path d="M82 70c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.2-1.8 6-4.4 7.3V106H86V77.3c-2.6-1.3-4.4-4.1-4.4-7.3z" fill="#1e293b" opacity="0.85" />
        </svg>
        <div class="brand">
            <span class="meal">MEAL</span> <span class="haven">HAVEN</span>
        </div>
    </div>
    <h2>Registration Failed</h2>
    <p>' . htmlspecialchars($message) . '</p>
    <a href="../index.html" class="btn">Back to Sign Up</a>
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
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Registration Successful - MealHaven</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
:root { --primary: #22c55e; --secondary: #f97316; --success: #10b981; --text: #1e293b; --text-light: #64748b; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; font-family: "Inter", system-ui, sans-serif; }
body { display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
.success-card { background: #fff; border: 1px solid #bbf7d0; border-radius: 16px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1); text-align: center; padding: 40px; max-width: 400px; width: 100%; }
.logo-container { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px; }
.logo { width: 60px; height: 60px; }
.brand { font-weight: 800; font-size: 24px; letter-spacing: -0.5px; }
.brand .meal { color: var(--primary); }
.brand .haven { color: var(--secondary); }
h2 { color: var(--success); margin-bottom: 12px; font-size: 24px; }
p { color: var(--text-light); margin-bottom: 24px; font-size: 15px; }
a.btn { display: inline-block; background: var(--primary); color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.2s ease; }
a.btn:hover { background: #16a34a; transform: translateY(-2px); }
</style>
<meta http-equiv="refresh" content="2;url=../index.html" />
</head>
<body>
<div class="success-card">
    <div class="logo-container">
        <svg class="logo" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path d="M92 16c12 2 22 10 26 18-8 6-20 10-36 10-10 0-20-2-28-6 8-14 22-23 38-22z" fill="#22c55e" opacity="0.9" />
            <path d="M16 56l48-28 48 28v10l-48-26-48 26V56z" fill="#22c55e" />
            <path d="M28 58h72v50a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V58z" fill="#f97316" opacity="0.9" />
            <path d="M56 88a8 8 0 0 1 16 0v26H56V88z" fill="#1e293b" opacity="0.85" />
            <g fill="#1e293b" opacity="0.85">
                <rect x="44" y="66" width="10" height="10" rx="1.5" />
                <rect x="58" y="66" width="10" height="10" rx="1.5" />
            </g>
            <path d="M40 106V70c0-1.7 1.3-3 3-3s3 1.3 3 3v8h2v-8c0-1.7 1.3-3 3-3s3 1.3 3 3v36h-14z" fill="#1e293b" opacity="0.85" />
            <path d="M82 70c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.2-1.8 6-4.4 7.3V106H86V77.3c-2.6-1.3-4.4-4.1-4.4-7.3z" fill="#1e293b" opacity="0.85" />
        </svg>
        <div class="brand">
            <span class="meal">MEAL</span> <span class="haven">HAVEN</span>
        </div>
    </div>
    <h2>Welcome to MealHaven!</h2>
    <p>' . htmlspecialchars($message) . '</p>
    <a href="../index.html" class="btn">Get Started</a>
</div>
</body>
</html>';
    exit();
}
