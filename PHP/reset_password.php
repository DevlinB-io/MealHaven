<?php

// connect to database
require_once 'db_connect.php';

// check if form submitted
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // get form data
    $token = trim($_POST['token']);
    $new_password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    // check all fields filled
    if (empty($token) || empty($new_password) || empty($confirm_password)) {
        die("All fields are required.");
    }

    // check passwords match
    if ($new_password !== $confirm_password) {
        die("Passwords do not match.");
    }

    // find reset token
    $stmt = $conn->prepare("SELECT user_email, expires_at FROM password_reset WHERE token = ?");
    // bind token
    $stmt->bind_param("s", $token);
    // run query
    $stmt->execute();
    // get results
    $result = $stmt->get_result();

    // check if token exists
    if ($result->num_rows === 1) {
        // get token data
        $row = $result->fetch_assoc();
        $email = $row['user_email'];
        $expires = $row['expires_at'];

        // check if token expired
        if (strtotime($expires) < time()) {
            die("This password reset link has expired. Please request a new one.");
        }

        // hash new password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

        // update user password
        $update = $conn->prepare("UPDATE users SET user_password = ? WHERE user_email_address = ?");
        // bind password and email
        $update->bind_param("ss", $hashed_password, $email);

        // save new password
        if ($update->execute()) {
            // show success page
            echo '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Password Reset Successful</title>
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
<meta http-equiv="refresh" content="3;url=../index.html" />
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
    <h2>Password Reset Successful</h2>
    <p>Your password has been reset successfully.</p>
    <a href="../index.html" class="btn">Login</a>
</div>
</body>
</html>';
            exit();
        } else {
            // update failed
            echo "Error updating password. Please try again.";
        }

        // delete used token
        $delete = $conn->prepare("DELETE FROM password_reset WHERE token = ?");
        // bind token
        $delete->bind_param("s", $token);
        // remove token
        $delete->execute();

        // close statements
        $update->close();
        $delete->close();
    } else {
        // token not found or expired
        die("Invalid or expired reset link.");
    }

    // close statement and connection
    $stmt->close();
    $conn->close();
}
