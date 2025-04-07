// Função para navegar entre as seções
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = {
        'dashboard': 'dashboardSection',
        'messages': 'messagesSection',
        'reports': 'reportsSection',
        'settings': 'settingsSection'
    };
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            
            // Atualiza a classe ativa
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            link.parentElement.classList.add('active');
            
            // Atualiza o título da página
            document.getElementById('pageTitle').textContent = 
                target === 'dashboard' ? 'Dashboard' :
                target === 'messages' ? 'Mensagens' :
                target === 'reports' ? 'Relatórios' : 'Configurações';
            
            // Mostra a seção correspondente
            Object.keys(sections).forEach(section => {
                const element = document.getElementById(sections[section]);
                if (section === target) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            });
            
            // Se for a seção de mensagens, recarrega as mensagens
            if (target === 'messages') {
                loadMessages();
            }
            
            // Atualiza a URL sem recarregar a página
            window.history.pushState({}, '', `#${target}`);
        });
    });
    
    // Verifica o hash da URL ao carregar a página
    const initialHash = window.location.hash.substring(1) || 'dashboard';
    const initialLink = document.querySelector(`.sidebar-nav a[href="#${initialHash}"]`);
    
    if (initialLink) {
        initialLink.click();
    } else {
        document.querySelector('.sidebar-nav a[href="#dashboard"]').click();
    }
}

// Função para carregar atividade recente
function loadRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    
    // Simulação de atividade (em um sistema real, isso viria do backend)
    const activities = [
        { icon: 'fas fa-envelope', text: 'Nova mensagem recebida de Diretor GP', time: '10 minutos atrás' },
        { icon: 'fas fa-user-plus', text: 'Novo consultor adicionado à equipe', time: '2 horas atrás' },
        { icon: 'fas fa-file-alt', text: 'Relatório mensal atualizado', time: 'Ontem' },
        { icon: 'fas fa-check-circle', text: 'Tarefa "Revisão de processos" concluída', time: '2 dias atrás' }
    ];
    
    recentActivity.innerHTML = '';
    activities.forEach(activity => {
        const li = document.createElement('li');
        li.innerHTML = `
            <i class="${activity.icon}"></i>
            <div>
                <p>${activity.text}</p>
                <span>${activity.time}</span>
            </div>
        `;
        recentActivity.appendChild(li);
    });
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('dashboardSection')) {
        setupNavigation();
        loadRecentActivity();
    }
    
    // Verifica autenticação em todas as páginas exceto login
    if (!window.location.pathname.endsWith('index.html')) {
        checkAuth();
    }
});
