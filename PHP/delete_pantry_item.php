<?php
header("Content-Type: application/json");
require_once '../DATABASE/database_connection.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
error_reporting(E_ALL);
ini_set("display_errors", 1);

try {
    if (!isset($database_connection) || $database_connection->connect_error) {
        throw new Exception("Database connection failed: " . $database_connection->connect_error);
    }

    if (empty($_POST['pantry_id'])) {
        throw new Exception("Missing pantry_id in POST request");
    }

    $pantry_id = intval($_POST['pantry_id']);

    $stmt = $database_connection->prepare("DELETE FROM PANTRY WHERE PANTRY_ID = ?");
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $database_connection->error);
    }

    $stmt->bind_param("i", $pantry_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Pantry item deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => "No pantry item found with ID $pantry_id"]);
    }

    $stmt->close();
    $database_connection->close();

} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}
?>
