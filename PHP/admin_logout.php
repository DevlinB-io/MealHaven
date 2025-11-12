<?php
session_start();
unset($_SESSION['admin_logged_in']);
unset($_SESSION['admin_user_id']);
unset($_SESSION['admin_name']);
session_destroy();
echo json_encode(['success' => true]);
?>