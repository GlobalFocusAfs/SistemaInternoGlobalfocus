<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

if (!isLoggedIn()) {
    redirect('/login.php');
}

$currentUser = getCurrentUser();
$db = getDatabaseConnection();

// Lógica para adicionar nova tarefa (apenas admin_total)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_task']) && $currentUser['username'] === 'admin_total') {
    $titulo = $_POST['titulo'];
    $descricao = $_POST['descricao'];
    $atribuido_para = $_POST['atribuido_para'];
    $prioridade = $_POST['prioridade'];
    $data_limite = $_POST['data_limite'];
    
    $stmt = $db->prepare("INSERT INTO tarefas (titulo, descricao, atribuido_para, atribuido_por, prioridade, data_limite) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$titulo, $descricao, $atribuido_para, $currentUser['id'], $prioridade, $data_limite]);
    
    $_SESSION['success_message'] = "Tarefa adicionada com sucesso!";
    redirect('/tarefas.php');
}

// Lógica para atualizar status da tarefa
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    $task_id = $_POST['task_id'];
    $new_status = $_POST['new_status'];
    
    $stmt = $db->prepare("UPDATE tarefas SET status = ? WHERE id = ? AND (atribuido_para = ? OR ? = 'admin_total')");
    $stmt->execute([$new_status, $task_id, $currentUser['id'], $currentUser['cargo']]);
    
    $_SESSION['success_message'] = "Status da tarefa atualizado!";
    redirect('/tarefas.php');
}

// Buscar tarefas
if ($currentUser['username'] === 'admin_total') {
    // Admin vê todas as tarefas
    $tasks = $db->query("SELECT t.*, u.nome as atribuido_para_nome FROM tarefas t JOIN usuarios u ON t.atribuido_para = u.id ORDER BY t.data_limite ASC")->fetchAll();
} else {
    // Outros usuários veem apenas suas tarefas
    $stmt = $db->prepare("SELECT t.*, u.nome as atribuido_para_nome FROM tarefas t JOIN usuarios u ON t.atribuido_para = u.id WHERE t.atribuido_para = ? ORDER BY t.data_limite ASC");
    $stmt->execute([$currentUser['id']]);
    $tasks = $stmt->fetchAll();
}

// Buscar usuários para o select (apenas para admin)
$users = [];
if ($currentUser['username'] === 'admin_total') {
    $users = $db->query("SELECT id, nome, departamento FROM usuarios ORDER BY departamento, nome")->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= SITE_NAME ?> - Tarefas</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Incluir sidebar igual ao index.php -->
        <?php include 'includes/sidebar.php'; ?>
        
        <main class="main-content">
            <header class="main-header">
                <h1>Tarefas</h1>
                <div class="header-actions">
                    <?php if ($currentUser['username'] === 'admin_total'): ?>
                        <button id="addTaskBtn" class="btn btn-primary">Adicionar Tarefa</button>
                    <?php endif; ?>
                </div>
            </header>
            
            <?php if (isset($_SESSION['success_message'])): ?>
                <div class="alert alert-success"><?= $_SESSION['success_message'] ?></div>
                <?php unset($_SESSION['success_message']); ?>
            <?php endif; ?>
            
            <div class="tasks-container">
                <div class="task-filters">
                    <button class="btn btn-small active" data-filter="all">Todas</button>
                    <button class="btn btn-small" data-filter="pendente">Pendentes</button>
                    <button class="btn btn-small" data-filter="em_andamento">Em Andamento</button>
                    <button class="btn btn-small" data-filter="concluida">Concluídas</button>
                </div>
                
                <div class="tasks-list">
                    <?php if (empty($tasks)): ?>
                        <p class="no-tasks">Nenhuma tarefa encontrada.</p>
                    <?php else: ?>
                        <?php foreach ($tasks as $task): ?>
                            <div class="task-card" data-status="<?= $task['status'] ?>">
                                <div class="task-header">
                                    <span class="task-priority <?= $task['prioridade'] ?>"><?= ucfirst($task['prioridade']) ?></span>
                                    <span class="task-status"><?= ucfirst(str_replace('_', ' ', $task['status'])) ?></span>
                                </div>
                                
                                <div class="task-body">
                                    <h3><?= htmlspecialchars($task['titulo']) ?></h3>
                                    <p><?= nl2br(htmlspecialchars($task['descricao'])) ?></p>
                                    
                                    <div class="task-meta">
                                        <span><i class="icon-user"></i> <?= htmlspecialchars($task['atribuido_para_nome']) ?></span>
                                        <span><i class="icon-calendar"></i> <?= date('d/m/Y', strtotime($task['data_limite'])) ?></span>
                                    </div>
                                </div>
                                
                                <div class="task-actions">
                                    <?php if ($currentUser['id'] == $task['atribuido_para'] || $currentUser['username'] === 'admin_total'): ?>
                                        <form method="POST" class="status-form">
                                            <input type="hidden" name="task_id" value="<?= $task['id'] ?>">
                                            <select name="new_status" class="status-select">
                                                <option value="pendente" <?= $task['status'] === 'pendente' ? 'selected' : '' ?>>Pendente</option>
                                                <option value="em_andamento" <?= $task['status'] === 'em_andamento' ? 'selected' : '' ?>>Em Andamento</option>
                                                <option value="concluida" <?= $task['status'] === 'concluida' ? 'selected' : '' ?>>Concluída</option>
                                            </select>
                                            <button type="submit" name="update_status" class="btn btn-small">Atualizar</button>
                                        </form>
                                    <?php endif; ?>
                                    
                                    <?php if ($currentUser['username'] === 'admin_total'): ?>
                                        <button class="btn btn-small btn-danger delete-task" data-task-id="<?= $task['id'] ?>">Excluir</button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Modal para adicionar tarefa (apenas para admin_total) -->
    <?php if ($currentUser['username'] === 'admin_total'): ?>
        <div id="addTaskModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Adicionar Nova Tarefa</h2>
                
                <form method="POST">
                    <div class="form-group">
                        <label for="titulo">Título</label>
                        <input type="text" id="titulo" name="titulo" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="descricao">Descrição</label>
                        <textarea id="descricao" name="descricao" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="atribuido_para">Atribuir para</label>
                        <select id="atribuido_para" name="atribuido_para" required>
                            <?php foreach ($users as $user): ?>
                                <option value="<?= $user['id'] ?>"><?= htmlspecialchars($user['nome']) ?> (<?= ucfirst($user['departamento']) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="prioridade">Prioridade</label>
                        <select id="prioridade" name="prioridade" required>
                            <option value="baixa">Baixa</option>
                            <option value="media" selected>Média</option>
                            <option value="alta">Alta</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="data_limite">Data Limite</label>
                        <input type="datetime-local" id="data_limite" name="data_limite" required>
                    </div>
                    
                    <button type="submit" name="add_task" class="btn btn-primary">Adicionar Tarefa</button>
                </form>
            </div>
        </div>
    <?php endif; ?>
    
    <script src="assets/js/tasks.js"></script>
</body>
</html>