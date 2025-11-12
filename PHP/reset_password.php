<?php
require_once '../DATABASE/database_connection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $token = trim($_POST['token']);
    $new_password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    if (empty($token) || empty($new_password) || empty($confirm_password)) {
        echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="3;url=../HTML/reset_password.html">
    <title>Missing Fields - MealHaven</title>
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
            <h1>Missing Fields</h1>
            <p>All fields are required. Please fill in every field to continue.</p>
            <a href="../HTML/reset_password.html" class="btn">Try Again</a>
        </div>
    </body>
    </html>';
        exit();
    }

    if ($new_password !== $confirm_password) {
        echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="3;url=../HTML/reset_password.html">
    <title>Passwords Do Not Match - MealHaven</title>
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
            <h1>Passwords Do Not Match</h1>
            <p>Your passwords must match. Please re-enter them to continue.</p>
            <a href="../HTML/reset_password.html" class="btn">Try Again</a>
        </div>
    </body>
    </html>';
        exit();
    }

    $stmt = $database_connection->prepare("SELECT user_email, expires_at FROM password_reset WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $email = $row['user_email'];
        $expires = $row['expires_at'];

        if (strtotime($expires) < time()) {
            echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="4;url=../HTML/forgot_password.html">
    <title>Link Expired - MealHaven</title>
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
            <h1>Link Expired</h1>
            <p>This password reset link has expired. Please request a new one.</p>
            <a href="../HTML/forgot_password.html" class="btn">Request New Link</a>
        </div>
    </body>
    </html>';
            exit();
        }

        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $update = $database_connection->prepare("UPDATE USER SET PASSWORD = ? WHERE USER_EMAIL_ADDRESS = ?");
        $update->bind_param("ss", $hashed_password, $email);

        if ($update->execute()) {
            echo '<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="3;url=../HTML/main_website.html">
        <title>Password Reset Successful - MealHaven</title>
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
                <h1>Password Reset Successful</h1>
                <p>Your password has been reset successfully.</p>
                <a href="../HTML/main_website.html" class="btn">Login</a>
            </div>
        </body>
        </html>';
            exit();
        } else {
            echo '<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="3;url=../HTML/reset_password.html">
            <title>Password Update Failed - MealHaven</title>
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
                    <h1>Password Update Failed</h1>
                    <p>Error updating password. Please try again.</p>
                    <a href="../HTML/reset_password.html" class="btn">Try Again</a>
                </div>
            </body>
            </html>';
            exit();
        }

        $delete = $database_connection->prepare("DELETE FROM password_reset WHERE token = ?");
        $delete->bind_param("s", $token);
        $delete->execute();
        $update->close();
        $delete->close();

    } else {
        echo '<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="4;url=../HTML/reset_password.html">
    <title>Invalid or Expired Link - MealHaven</title>
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
            <h1>Invalid or Expired Link</h1>
            <p>The reset link is invalid or has expired. Please request a new one.</p>
            <a href="../HTML/forgot_password.html" class="btn">Request New Link</a>
        </div>
    </body>
    </html>';
        exit();
    }
    $stmt->close();
    $database_connection->close();
}
