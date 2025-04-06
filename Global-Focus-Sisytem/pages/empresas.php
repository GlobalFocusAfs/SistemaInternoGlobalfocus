<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

if (!isLoggedIn()) {
    redirect('/login.php');
}

$currentUser = getCurrentUser();

// Verificar se o usuário tem acesso à página de empresas
if ($currentUser['cargo'] !== 'consultor' && $currentUser['username'] !== 'admin_total') {
    redirect('/index.php');
}

$db = getDatabaseConnection();

// Lógica para adicionar nova empresa
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_company'])) {
    $nome = trim($_POST['nome']);
    $cnpj = trim($_POST['cnpj']);
    $endereco = trim($_POST['endereco']);
    $contato_principal = trim($_POST['contato_principal']);
    $telefone = trim($_POST['telefone']);
    $email = trim($_POST['email']);
    $status = $_POST['status'];
    $observacoes = trim($_POST['observacoes']);
    
    $stmt = $db->prepare("INSERT INTO empresas (nome, cnpj, endereco, contato_principal, telefone, email, responsavel_id, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->