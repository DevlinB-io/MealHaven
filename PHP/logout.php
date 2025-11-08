<?php
// starts session
session_start();

// clears all session
session_unset();

// logs user out completely
session_destroy();

// redirects to homepage
header("Location: ../HTML/main_website.html");
exit();
