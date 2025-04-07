// Dados de usuários (simulados - em produção, isso viria de um backend seguro)
const users = {
    // Gestão de Pessoas
    'gp_consultor1': { password: 'consultor123', area: 'gestao', role: 'consultor', name: 'Consultor GP 1' },
    'gp_consultor2': { password: 'consultor123', area: 'gestao', role: 'consultor', name: 'Consultor GP 2' },
    'gp_consultor3': { password: 'consultor123', area: 'gestao', role: 'consultor', name: 'Consultor GP 3' },
    'gp_diretor': { password: 'diretor123', area: 'gestao', role: 'diretor', name: 'Diretor GP' },
    
    // Marketing
    'mk_consultor1': { password: 'consultor123', area: 'marketing', role: 'consultor', name: 'Consultor MK 1' },
    'mk_consultor2': { password: 'consultor123', area: 'marketing', role: 'consultor', name: 'Consultor MK 2' },
    'mk_consultor3': { password: 'consultor123', area: 'marketing', role: 'consultor', name: 'Consultor MK 3' },
    'mk_diretor': { password: 'diretor123', area: 'marketing', role: 'diretor', name: 'Diretor MK' },
    
    // Finanças
    'fn_consultor1': { password: 'consultor123', area: 'financas', role: 'consultor', name: 'Consultor FN 1' },
    'fn_consultor2': { password: 'consultor123', area: 'financas', role: 'consultor', name: 'Consultor FN 2' },
    'fn_consultor3': { password: 'consultor123', area: 'financas', role: 'consultor', name: 'Consultor FN 3' },
    'fn_diretor': { password: 'diretor123', area: 'financas', role: 'diretor', name: 'Diretor FN' },
    
    // Logística
    'lg_consultor1': { password: 'consultor123', area: 'logistica', role: 'consultor', name: 'Consultor LG 1' },
    'lg_consultor2': { password: 'consultor123', area: 'logistica', role: 'consultor', name: 'Consultor LG 2' },
    'lg_consultor3': { password: 'consultor123', area: 'logistica', role: 'consultor', name: 'Consultor LG 3' },
    'lg_diretor': { password: 'diretor123', area: 'logistica', role: 'diretor', name: 'Diretor LG' },
    
    // Novos Negócios
    'nn_consultor1': { password: 'consultor123', area: 'negocios', role: 'consultor', name: 'Consultor NN 1' },
    'nn_consultor2': { password: 'consultor123', area: 'negocios', role: 'consultor', name: 'Consultor NN 2' },
    'nn_consultor3': { password: 'consultor123', area: 'negocios', role: 'consultor', name: 'Consultor NN 3' },
    'nn_diretor': { password: 'diretor123', area: 'negocios', role: 'diretor', name: 'Diretor NN' },
    
    // Administrativa
    'adm_consultor1': { password: 'consultor123', area: 'administrativa', role: 'consultor', name: 'Consultor ADM 1' },
    'adm_consultor2': { password: 'consultor123', area: 'administrativa', role: 'consultor', name: 'Consultor ADM 2' },
    'adm_consultor3': { password: 'consultor123', area: 'administrativa', role: 'consultor', name: 'Consultor ADM 3' },
    'adm_diretor': { password: 'diretor123', area: 'administrativa', role: 'diretor', name: 'Diretor ADM' },
    
    // Usuário GlobalFocusAfs
    'GlobalFocusAfs': { password: 'admin123', area: 'administrativa', role: 'admin', name: 'Administrador GlobalFocus' }
};

// Mapeamento de áreas para nomes completos
const areaNames = {
    'gestao': 'Gestão de Pessoas',
    'marketing': 'Marketing',
    'financas': 'Finanças',
    'logistica': 'Logística',
    'negocios': 'Novos Negócios',
    'administrativa': 'Administrativa'
};

// Verifica se o usuário está logado
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
}

// Função de login
function login(username, password, area) {
    const userKey = `${area}_${username.toLowerCase()}`;
    const user = users[userKey] || users[username];
    
    if (user && user.password === password && user.area === area) {
        // Salva os dados do usuário no localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            name: user.name,
            area: area,
            role: user.role
        }));
        
        // Redireciona para o dashboard
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return false;
}

// Função de logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Carrega as informações do usuário logado
function loadUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // Atualiza a sidebar
        document.getElementById('sidebarUsername').textContent = currentUser.name;
        document.getElementById('sidebarRole').textContent = currentUser.role === 'consultor' ? 'Consultor' : 
                                                          currentUser.role === 'diretor' ? 'Diretor' : 'Administrador';
        document.getElementById('sidebarArea').textContent = areaNames[currentUser.area] || currentUser.area;
        
        // Atualiza o header
        document.getElementById('headerUsername').textContent = currentUser.name;
        document.getElementById('welcomeUsername').textContent = currentUser.name;
    }
}

// Evento de login
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const area = document.getElementById('area').value;
            
            if (!username || !password || !area) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            if (!login(username, password, area)) {
                alert('Usuário, senha ou área incorretos.');
            }
        });
    }
    
    // Evento de logout
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
    
    // Carrega as informações do usuário se estiver na dashboard
    if (document.getElementById('sidebarUsername')) {
        loadUserInfo();
        checkAuth();
    }
});
