<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

if (!isLoggedIn()) {
    redirect('/login.php');
}

$currentUser = getCurrentUser();
$db = getDatabaseConnection();

// Lógica para enviar mensagem
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['send_message'])) {
    $destinatario_id = $_POST['destinatario_id'] ?? null;
    $departamento_destino = $_POST['departamento_destino'] ?? null;
    $assunto = trim($_POST['assunto']);
    $mensagem = trim($_POST['mensagem']);
    
    // Validação
    if (empty($assunto) || empty($mensagem)) {
        $_SESSION['error_message'] = "Assunto e mensagem são obrigatórios";
    } elseif (!$destinatario_id && !$departamento_destino) {
        $_SESSION['error_message'] = "Selecione um destinatário ou departamento";
    } else {
        $stmt = $db->prepare("INSERT INTO mensagens (remetente_id, destinatario_id, departamento_destino, assunto, mensagem) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$currentUser['id'], $destinatario_id, $departamento_destino, $assunto, $mensagem]);
        
        $_SESSION['success_message'] = "Mensagem enviada com sucesso!";
        redirect('/mensagens.php');
    }
}

// Buscar mensagens recebidas
$receivedStmt = $db->prepare("
    SELECT m.*, u.nome as remetente_nome 
    FROM mensagens m 
    JOIN usuarios u ON m.remetente_id = u.id 
    WHERE m.destinatario_id = ? OR m.departamento_destino = ? OR (m.departamento_destino IS NULL AND m.destinatario_id IS NULL)
    ORDER BY m.data_envio DESC
");
$receivedStmt->execute([$currentUser['id'], $currentUser['departamento']]);
$receivedMessages = $receivedStmt->fetchAll();

// Buscar mensagens enviadas
$sentStmt = $db->prepare("
    SELECT m.*, 
           CASE 
               WHEN m.destinatario_id IS NOT NULL THEN (SELECT nome FROM usuarios WHERE id = m.destinatario_id)
               WHEN m.departamento_destino IS NOT NULL THEN CONCAT('Departamento de ', m.departamento_destino)
               ELSE 'Todos'
           END as destinatario_nome
    FROM mensagens m
    WHERE m.remetente_id = ?
    ORDER BY m.data_envio DESC
");
$sentStmt->execute([$currentUser['id']]);
$sentMessages = $sentStmt->fetchAll();

// Buscar usuários e departamentos para o select
$users = $db->query("SELECT id, nome, departamento FROM usuarios WHERE id != ? ORDER BY departamento, nome", [$currentUser['id']])->fetchAll();
$departments = $db->query("SELECT DISTINCT departamento FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= SITE_NAME ?> - Mensagens</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Incluir sidebar igual ao index.php -->
        <?php include 'includes/sidebar.php'; ?>
        
        <main class="main-content">
            <header class="main-header">
                <h1>Mensagens</h1>
                <div class="header-actions">
                    <button id="newMessageBtn" class="btn btn-primary">Nova Mensagem</button>
                </div>
            </header>
            
            <?php if (isset($_SESSION['success_message'])): ?>
                <div class="alert alert-success"><?= $_SESSION['success_message'] ?></div>
                <?php unset($_SESSION['success_message']); ?>
            <?php endif; ?>
            
            <?php if (isset($_SESSION['error_message'])): ?>
                <div class="alert alert-danger"><?= $_SESSION['error_message'] ?></div>
                <?php unset($_SESSION['error_message']); ?>
            <?php endif; ?>
            
            <div class="messages-tabs">
                <button class="tab-btn active" data-tab="received">Recebidas</button>
                <button class="tab-btn" data-tab="sent">Enviadas</button>
            </div>
            
            <div class="messages-container">
                <div id="received-tab" class="tab-content active">
                    <?php if (empty($receivedMessages)): ?>
                        <p class="no-messages">Nenhuma mensagem recebida.</p>
                    <?php else: ?>
                        <div class="messages-list">
                            <?php foreach ($receivedMessages as $message): ?>
                                <div class="message-card <?= !$message['lida'] ? 'unread' : '' ?>">
                                    <div class="message-header">
                                        <h3><?= htmlspecialchars($message['assunto']) ?></h3>
                                        <span class="message-date"><?= formatDate($message['data_envio']) ?></span>
                                    </div>
                                    
                                    <div class="message-sender">
                                        De: <?= htmlspecialchars($message['remetente_nome']) ?>
                                    </div>
                                    
                                    <div class="message-body">
                                        <p><?= nl2br(htmlspecialchars($message['mensagem'])) ?></p>
                                    </div>
                                    
                                    <div class="message-actions">
                                        <button class="btn btn-small reply-btn" data-sender-id="<?= $message['remetente_id'] ?>" data-sender-name="<?= htmlspecialchars($message['remetente_nome']) ?>" data-subject="Re: <?= htmlspecialchars($message['assunto']) ?>">Responder</button>
                                        
                                        <?php if (!$message['lida']): ?>
                                            <form method="POST" action="mark_as_read.php" class="mark-read-form">
                                                <input type="hidden" name="message_id" value="<?= $message['id'] ?>">
                                                <button type="submit" class="btn btn-small">Marcar como lida</button>
                                            </form>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div id="sent-tab" class="tab-content">
                    <?php if (empty($sentMessages)): ?>
                        <p class="no-messages">Nenhuma mensagem enviada.</p>
                    <?php else: ?>
                        <div class="messages-list">
                            <?php foreach ($sentMessages as $message): ?>
                                <div class="message-card">
                                    <div class="message-header">
                                        <h3><?= htmlspecialchars($message['assunto']) ?></h3>
                                        <span class="message-date"><?= formatDate($message['data_envio']) ?></span>
                                    </div>
                                    
                                    <div class="message-sender">
                                        Para: <?= htmlspecialchars($message['destinatario_nome']) ?>
                                    </div>
                                    
                                    <div class="message-body">
                                        <p><?= nl2br(htmlspecialchars($message['mensagem'])) ?></p>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Modal para nova mensagem -->
    <div id="newMessageModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Nova Mensagem</h2>
            
            <form method="POST">
                <div class="form-group">
                    <label for="assunto">Assunto</label>
                    <input type="text" id="assunto" name="assunto" required>
                </div>
                
                <div class="form-group">
                    <label for="mensagem">Mensagem</label>
                    <textarea id="mensagem" name="mensagem" rows="6" required></textarea>
                </div>
                
                <div class="form-group">
                    <label>Enviar para:</label>
                    <div class="recipient-options">
                        <div class="option">
                            <input type="radio" id="recipient-user" name="recipient-type" value="user" checked>
                            <label for="recipient-user">Usuário específico</label>
                            <select id="destinatario_id" name="destinatario_id" class="recipient-select">
                                <option value="">Selecione um usuário</option>
                                <?php foreach ($users as $user): ?>
                                    <option value="<?= $user['id'] ?>"><?= htmlspecialchars($user['nome']) ?> (<?= ucfirst($user['departamento']) ?>)</option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="option">
                            <input type="radio" id="recipient-dept" name="recipient-type" value="department">
                            <label for="recipient-dept">Departamento</label>
                            <select id="departamento_destino" name="departamento_destino" class="recipient-select" disabled>
                                <option value="">Selecione um departamento</option>
                                <?php foreach ($departments as $dept): ?>
                                    <option value="<?= $dept ?>"><?= ucfirst($dept) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="option">
                            <input type="radio" id="recipient-all" name="recipient-type" value="all">
                            <label for="recipient-all">Todos os usuários</label>
                        </div>
                    </div>
                </div>
                
                <button type="submit" name="send_message" class="btn btn-primary">Enviar Mensagem</button>
            </form>
        </div>
    </div>
    
    <script src="assets/js/messages.js"></script>
</body>
</html>