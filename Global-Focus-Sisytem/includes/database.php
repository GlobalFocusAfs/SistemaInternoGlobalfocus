<?php
require_once 'config.php';

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $this->connection = getDatabaseConnection();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    // Exemplo de função para executar queries
    public function query($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
}
?>