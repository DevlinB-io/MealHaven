<?php
// connect to database

// database details
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'mealhaven_db';

// create connection
$conn = new mysqli($host, $user, $pass, $dbname);

// check connection
if ($conn->connect_error) {
    // stop if failed
    die('Database connection failed: ' . $conn->connect_error);
}
