<?php
// includes/auth.php

require_once 'config.php';
require_once 'database.php';

// Função para fazer login
function login($username, $password) {
    $db = getDatabaseConnection();
    
    $stmt = $db->prepare("SELECT * FROM usuarios WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['nome'] = $user['nome'];
        $_SESSION['departamento'] = $user['departamento'];
        $_SESSION['cargo'] = $user['cargo'];
        
        return true;
    }
    
    return false;
}

// Função para fazer logout
function logout() {
    session_unset();
    session_destroy();
}

// Função para popular o banco de dados com os usuários iniciais
function populateInitialUsers() {
    $db = getDatabaseConnection();
    
    // Verifica se já existem usuários
    $stmt = $db->query("SELECT COUNT(*) FROM usuarios");
    if ($stmt->fetchColumn() > 0) {
        return;
    }
    
    // Usuários iniciais
    $users = [
        // Administrador Geral
        [
            'username' => 'admin_total',
            'password' => password_hash('Master@GF2023', PASSWORD_DEFAULT),
            'nome' => 'Administrador Geral',
            'departamento' => 'administracao',
            'cargo' => 'admin_total'
        ],
        
        // Consultores de Finanças
        [
            'username' => 'financas1',
            'password' => password_hash('Fin1@GF2023', PASSWORD_DEFAULT),
            'nome' => 'Consultor Finanças 1',
            'departamento' => 'financas',
            'cargo' => 'consultor'
        ],
        // ... (adicionar todos os outros usuários conforme a lista fornecida)
        
        // Diretores
        [
            'username' => 'presidente',
            'password' => password_hash('Presi@GF2023', PASSWORD_DEFAULT),
            'nome' => 'Diretor Presidente',
            'departamento' => 'presidencia',
            'cargo' => 'diretor_presidente'
        ],
        // ... (adicionar todos os outros diretores)
    ];
    
    // Insere os usuários
    $stmt = $db->prepare("INSERT INTO usuarios (username, password, nome, departamento, cargo) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($users as $user) {
        $stmt->execute([
            $user['username'],
            $user['password'],
            $user['nome'],
            $user['departamento'],
            $user['cargo']
        ]);
    }
}
?>