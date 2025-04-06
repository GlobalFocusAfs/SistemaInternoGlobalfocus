<?php
// Configurações do Banco de Dados no Railway
define('DB_HOST', 'mainline.proxy.rlwy.net'); // Host público
define('DB_PORT', '58751'); // Porta pública
define('DB_USER', 'root'); // Usuário
define('DB_PASS', 'vgApFvgYUkXBwGVFjvFMnKxFTpAYjTzA'); // Senha fornecida
define('DB_NAME', 'railway'); // Nome do banco

// Configurações do Sistema
define('SITE_NAME', 'Global Focus');
define('BASE_URL', 'http://seusite.com'); // Altere para seu domínio

// Inicia a sessão
session_start();

// Função para conectar ao banco
function getDatabaseConnection() {
    try {
        $dsn = "mysql:host=".DB_HOST.";port=".DB_PORT.";dbname=".DB_NAME;
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die("Erro de conexão: " . $e->getMessage());
    }
}

// Função para redirecionamento
function redirect($url) {
    header("Location: " . BASE_URL . $url);
    exit();
}
?>