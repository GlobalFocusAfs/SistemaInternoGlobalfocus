// Dados de usuários (em um sistema real, isso viria de um backend seguro)
const users = {
    // Gestão de Pessoas
    'gp_consultor1': { password: 'consultor123', role: 'consultor', area: 'people', name: 'Consultor GP 1' },
    'gp_consultor2': { password: 'consultor123', role: 'consultor', area: 'people', name: 'Consultor GP 2' },
    'gp_consultor3': { password: 'consultor123', role: 'consultor', area: 'people', name: 'Consultor GP 3' },
    'gp_diretor': { password: 'diretor123', role: 'diretor', area: 'people', name: 'Diretor GP' },
    
    // Marketing
    'mk_consultor1': { password: 'consultor123', role: 'consultor', area: 'marketing', name: 'Consultor MK 1' },
    'mk_consultor2': { password: 'consultor123', role: 'consultor', area: 'marketing', name: 'Consultor MK 2' },
    'mk_consultor3': { password: 'consultor123', role: 'consultor', area: 'marketing', name: 'Consultor MK 3' },
    'mk_diretor': { password: 'diretor123', role: 'diretor', area: 'marketing', name: 'Diretor MK' },
    
    // Finanças
    'fn_consultor1': { password: 'consultor123', role: 'consultor', area: 'finance', name: 'Consultor FN 1' },
    'fn_consultor2': { password: 'consultor123', role: 'consultor', area: 'finance', name: 'Consultor FN 2' },
    'fn_consultor3': { password: 'consultor123', role: 'consultor', area: 'finance', name: 'Consultor FN 3' },
    'fn_diretor': { password: 'diretor123', role: 'diretor', area: 'finance', name: 'Diretor FN' },
    
    // Logística
    'lg_consultor1': { password: 'consultor123', role: 'consultor', area: 'logistics', name: 'Consultor LG 1' },
    'lg_consultor2': { password: 'consultor123', role: 'consultor', area: 'logistics', name: 'Consultor LG 2' },
    'lg_consultor3': { password: 'consultor123', role: 'consultor', area: 'logistics', name: 'Consultor LG 3' },
    'lg_diretor': { password: 'diretor123', role: 'diretor', area: 'logistics', name: 'Diretor LG' },
    
    // Novos Negócios
    'nb_consultor1': { password: 'consultor123', role: 'consultor', area: 'business', name: 'Consultor NB 1' },
    'nb_consultor2': { password: 'consultor123', role: 'consultor', area: 'business', name: 'Consultor NB 2' },
    'nb_consultor3': { password: 'consultor123', role: 'consultor', area: 'business', name: 'Consultor NB 3' },
    'nb_diretor': { password: 'diretor123', role: 'diretor', area: 'business', name: 'Diretor NB' },
    
    // Administrativa
    'ad_consultor1': { password: 'consultor123', role: 'consultor', area: 'admin', name: 'Consultor AD 1' },
    'ad_consultor2': { password: 'consultor123', role: 'consultor', area: 'admin', name: 'Consultor AD 2' },
    'ad_consultor3': { password: 'consultor123', role: 'consultor', area: 'admin', name: 'Consultor AD 3' },
    'ad_diretor': { password: 'diretor123', role: 'diretor', area: 'admin', name: 'Diretor AD' },
    
    // Usuário especial
    'GlobalFocusAfs': { password: 'admin123', role: 'admin', area: 'all', name: 'Administrador Global' }
};

// Mapeamento de áreas para nomes
const areaNames = {
    'people': 'Gestão de Pessoas',
    'marketing': 'Marketing',
    'finance': 'Finanças',
    'logistics': 'Logística',
    'business': 'Novos Negócios',
    'admin': 'Administrativa',
    'all': 'Todas as Áreas'
};

// Verifica se o usuário está logado
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.endsWith('dashboard.html')) {
        window.location.href = 'index.html';
    } else if (currentUser && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Login
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (users[username] && users[username].password === password) {
                localStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    role: users[username].role,
                    area: users[username].area,
                    name: users[username].name
                }));
                window.location.href = 'dashboard.html';
            } else {
                alert('Usuário ou senha incorretos!');
            }
        });
    }
    
    // Logout
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Carrega informações do usuário no dashboard
    if (document.getElementById('currentUsername')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            document.getElementById('currentUsername').textContent = currentUser.name;
            document.getElementById('currentRole').textContent = currentUser.role === 'consultor' ? 'Consultor' : 
                                                               currentUser.role === 'diretor' ? 'Diretor' : 'Administrador';
            
            document.getElementById('welcomeUsername').textContent = currentUser.name;
            document.getElementById('welcomeRole').textContent = currentUser.role === 'consultor' ? 'Consultor' : 
                                                               currentUser.role === 'diretor' ? 'Diretor' : 'Administrador';
            document.getElementById('welcomeArea').textContent = areaNames[currentUser.area];
        }
    }
    
    checkAuth();
});
