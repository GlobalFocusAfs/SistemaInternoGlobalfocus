<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';

if (!isLoggedIn()) {
    redirect('/login.php');
}

$currentUser = [
    'id' => $_SESSION['user_id'],
    'username' => $_SESSION['username'],
    'nome' => $_SESSION['nome'],
    'departamento' => $_SESSION['departamento'],
    'cargo' => $_SESSION['cargo']
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= SITE_NAME ?> - Dashboard</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="dashboard-container">
        <aside class="sidebar">
            <div class="user-profile">
                <div class="avatar"><?= strtoupper(substr($currentUser['nome'], 0, 1)) ?></div>
                <div class="user-info">
                    <h3><?= $currentUser['nome'] ?></h3>
                    <p><?= ucfirst($currentUser['departamento']) ?></p>
                </div>
            </div>
            
            <nav class="main-menu">
                <ul>
                    <li class="active"><a href="index.php"><i class="icon-dashboard"></i> Dashboard</a></li>
                    <li><a href="tarefas.php"><i class="icon-tasks"></i> Tarefas</a></li>
                    <li><a href="mensagens.php"><i class="icon-messages"></i> Mensagens</a></li>
                    
                    <?php if ($currentUser['cargo'] === 'consultor' || $currentUser['cargo'] === 'admin_total'): ?>
                        <li><a href="empresas.php"><i class="icon-companies"></i> Empresas</a></li>
                    <?php endif; ?>
                    
                    <li><a href="perfil.php"><i class="icon-profile"></i> Perfil</a></li>
                    <li><a href="logout.php"><i class="icon-logout"></i> Sair</a></li>
                </ul>
            </nav>
        </aside>
        
        <main class="main-content">
            <header class="main-header">
                <h1>Dashboard</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input type="text" placeholder="Pesquisar...">
                        <button><i class="icon-search"></i></button>
                    </div>
                    <div class="notifications">
                        <i class="icon-bell"></i>
                        <span class="badge">3</span>
                    </div>
                </div>
            </header>
            
            <div class="content-grid">
                <!-- Widgets do dashboard -->
                <div class="widget">
                    <h2>Tarefas Pendentes</h2>
                    <div class="widget-content">
                        <span class="big-number">5</span>
                        <a href="tarefas.php" class="btn btn-small">Ver todas</a>
                    </div>
                </div>
                
                <div class="widget">
                    <h2>Mensagens Não Lidas</h2>
                    <div class="widget-content">
                        <span class="big-number">3</span>
                        <a href="mensagens.php" class="btn btn-small">Ver todas</a>
                    </div>
                </div>
                
                <?php if ($currentUser['cargo'] === 'consultor'): ?>
                    <div class="widget">
                        <h2>Empresas Ativas</h2>
                        <div class="widget-content">
                            <span class="big-number">12</span>
                            <a href="empresas.php" class="btn btn-small">Ver todas</a>
                        </div>
                    </div>
                <?php endif; ?>
                
                <!-- Últimas atividades -->
                <div class="widget full-width">
                    <h2>Últimas Atividades</h2>
                    <div class="widget-content">
                        <ul class="activity-list">
                            <li>
                                <span class="activity-time">10 min atrás</span>
                                <span class="activity-text">Nova tarefa atribuída: "Relatório mensal"</span>
                            </li>
                            <li>
                                <span class="activity-time">1 hora atrás</span>
                                <span class="activity-text">Mensagem recebida de Marketing</span>
                            </li>
                            <li>
                                <span class="activity-time">3 horas atrás</span>
                                <span class="activity-text">Empresa "ABC Corp" atualizada</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <script src="assets/js/main.js"></script>
</body>
</html>