<?php
header('Content-Type: application/json');
require __DIR__.'/../../includes/config.php';

$db = getDatabaseConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $db->query("SELECT * FROM tarefas");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // Validação e inserção no banco
        break;
        
    // ... outros métodos
}
?>