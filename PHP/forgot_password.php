<?php
// connect to database
require_once '../DATABASE/database_connection.php';

// check if form submitted
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // get email from form
    $email = trim($_POST['email']);

    // Email required
    // check email not empty
    if (empty($email)) {
        echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="3;url=../HTML/forgot_password.html">
    <title>Email Required - MealHaven</title>
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
            <h1>Email Required</h1>
            <p>Please enter your email address before continuing.</p>
            <a href="../HTML/forgot_password.html" class="btn">Back to Reset</a>
        </div>
    </body>
    </html>';
        exit();
    }

    // find user by email and get first name
    $stmt = $database_connection->prepare("SELECT USER_ID, USER_FIRST_NAME FROM USER WHERE USER_EMAIL_ADDRESS = ?");
    // bind email
    $stmt->bind_param("s", $email);

    // run query
    $stmt->execute();
    // get results
    $result = $stmt->get_result();

    // check if user exists
    if ($result->num_rows === 1) {
        // get user data
        $user = $result->fetch_assoc();
        $firstName = $user['USER_FIRST_NAME'];

        // create random token
        $token = bin2hex(random_bytes(32));

        // set expiry time
        $expires = date("Y-m-d H:i:s", strtotime('+1 hour'));

        // save token to database
        $saveToken = $database_connection->prepare("INSERT INTO password_reset (user_email, token, expires_at) VALUES (?, ?, ?)");
        // bind values
        $saveToken->bind_param("sss", $email, $token, $expires);
        // save token
        $saveToken->execute();

        // build reset link
        $reset_link = "http://localhost/MealHaven/HTML/reset_password.html?token=" . $token;


        // email subject
        $subject = "MealHaven Password Reset Request";
        // email body
        $message = "
        <html>
        <head>
        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
        <title>MealHaven Password Reset</title>
        </head>
        <body style='font-family: Arial, sans-serif; background-color: #f7faf9; margin: 0; padding: 20px;'>
        <center>
        <table width='480' cellpadding='0' cellspacing='0' border='0' style='background: #fff; border-radius: 10px; padding: 30px;'>
            <!-- Logo and Brand -->
            <tr>
                <td align='center' style='padding-bottom: 24px;'>
                    <svg class='logo' viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg' style='width: 60px; height: 60px; display: inline-block; vertical-align: middle; margin-right: 12px;'>
                        <path d='M92 16c12 2 22 10 26 18-8 6-20 10-36 10-10 0-20-2-28-6 8-14 22-23 38-22z' fill='#22c55e' opacity='0.9' />
                        <path d='M16 56l48-28 48 28v10l-48-26-48 26V56z' fill='#22c55e' />
                        <path d='M28 58h72v50a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V58z' fill='#f97316' opacity='0.9' />
                        <path d='M56 88a8 8 0 0 1 16 0v26H56V88z' fill='#1e293b' opacity='0.85' />
                        <g fill='#1e293b' opacity='0.85'>
                            <rect x='44' y='66' width='10' height='10' rx='1.5' />
                            <rect x='58' y='66' width='10' height='10' rx='1.5' />
                        </g>
                        <path d='M40 106V70c0-1.7 1.3-3 3-3s3 1.3 3 3v8h2v-8c0-1.7 1.3-3 3-3s3 1.3 3 3v36h-14z' fill='#1e293b' opacity='0.85' />
                        <path d='M82 70c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.2-1.8 6-4.4 7.3V106H86V77.3c-2.6-1.3-4.4-4.1-4.4-7.3z' fill='#1e293b' opacity='0.85' />
                    </svg>
                    <span style='font-weight: 800; font-size: 24px; letter-spacing: -0.5px; vertical-align: middle;'>
                        <span style='color: #22c55e;'>MEAL</span> <span style='color: #f97316;'>HAVEN</span>
                    </span>
                </td>
            </tr>
            
            <!-- Title -->
            <tr>
                <td align='center' style='padding-bottom: 20px;'>
                    <h2 style='color: #22c55e; margin: 0; font-size: 24px;'>Password Reset Request</h2>
                </td>
            </tr>
            
            <!-- Greeting -->
            <tr>
                <td style='color: #64748b; line-height: 1.6; padding-bottom: 16px;'>
                    Hello $firstName,
                </td>
            </tr>
            
            <!-- Message -->
            <tr>
                <td style='color: #64748b; line-height: 1.6; padding-bottom: 16px;'>
                    We received a request to reset your password. Click the button below to set a new one:
                </td>
            </tr>
            
            <!-- Button -->
            <tr>
                <td align='center' style='padding: 30px 0;'>
                    <table cellpadding='0' cellspacing='0' border='0'>
                        <tr>
                            <td align='center' style='background-color: #22c55e; border-radius: 8px;'>
                                <a href='$reset_link' style='display: inline-block; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 16px;'>Reset My Password</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <!-- Footer note -->
            <tr>
                <td style='color: #64748b; line-height: 1.6; padding-bottom: 16px;'>
                    If you didn't request this, please ignore this message.
                </td>
            </tr>
            
            <!-- Signature -->
            <tr>
                <td style='padding-top: 30px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;'>
                    — The MealHaven Team
                </td>
            </tr>
        </table>
        </center>
        </body>
        </html>
        ";
        // set email headers
        $headers = "From: MealHaven <no-reply@mealhaven.com>\r\n";
        $headers .= "Reply-To: no-reply@mealhaven.com\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: 8bit\r\n";

        // sent email card
        if (mail($email, $subject, $message, $headers)) {
            echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="5;url=../HTML/main_website.html">
    <title>Password Reset Email Sent</title>
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
            <h1>Password reset email sent</h1>
            <p>Redirecting to homepage in 5 seconds...</p>
        </div>
    </body>
    </html>';
            exit();
        } else {
            // email failed card
            echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>Email Sending Failed</title>
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
            <h1>Email failed to send</h1>
            <p>Please try again later.</p>
        </div>
    </body>
    </html>';
            exit();
        }

        // close statement
        $saveToken->close();
    } else {
        // user not found card
        echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="5;url=../HTML/main_website.html">
    <title>User Not Found</title>
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
        .alert {
            width: 90px;
            height: 90px;
            background-color: #f97316;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            box-shadow: 0 4px 12px rgba(249,115,22,0.25);
        }
        .alert svg {
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
        }
    </style>
    </head>
    <body>
        <div class="card">
            <div class="alert">
                <svg viewBox="0 0 24 24">
                    <path d="M12 8v5m0 4h.01M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0z"></path>
                </svg>
            </div>
            <h1>No account found</h1>
            <p>If an account exists with that email, a reset link will be sent.</p>
        </div>
    </body>
    </html>';
        exit();
    }

    // close statement and connection
    $stmt->close();
    $database_connection->close();
}
