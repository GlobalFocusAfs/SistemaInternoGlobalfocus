// Dados de usuários
const users = {
    consultores: [
        { id: 1, nome: "Consultor 1 GP", email: "consultor1.gp@globalfocus.com", senha: "senha123", area: "gestao-pessoas" },
        { id: 2, nome: "Consultor 2 GP", email: "consultor2.gp@globalfocus.com", senha: "senha123", area: "gestao-pessoas" },
        { id: 3, nome: "Consultor 3 GP", email: "consultor3.gp@globalfocus.com", senha: "senha123", area: "gestao-pessoas" },
        { id: 4, nome: "Consultor 1 MK", email: "consultor1.mk@globalfocus.com", senha: "senha123", area: "marketing" },
        { id: 5, nome: "Consultor 2 MK", email: "consultor2.mk@globalfocus.com", senha: "senha123", area: "marketing" },
        { id: 6, nome: "Consultor 3 MK", email: "consultor3.mk@globalfocus.com", senha: "senha123", area: "marketing" },
        { id: 7, nome: "Consultor 1 FN", email: "consultor1.fn@globalfocus.com", senha: "senha123", area: "financas" },
        { id: 8, nome: "Consultor 2 FN", email: "consultor2.fn@globalfocus.com", senha: "senha123", area: "financas" },
        { id: 9, nome: "Consultor 3 FN", email: "consultor3.fn@globalfocus.com", senha: "senha123", area: "financas" },
        { id: 10, nome: "Consultor 1 LG", email: "consultor1.lg@globalfocus.com", senha: "senha123", area: "logistica" },
        { id: 11, nome: "Consultor 2 LG", email: "consultor2.lg@globalfocus.com", senha: "senha123", area: "logistica" },
        { id: 12, nome: "Consultor 3 LG", email: "consultor3.lg@globalfocus.com", senha: "senha123", area: "logistica" },
        { id: 13, nome: "Consultor 1 NN", email: "consultor1.nn@globalfocus.com", senha: "senha123", area: "novos-negocios" },
        { id: 14, nome: "Consultor 2 NN", email: "consultor2.nn@globalfocus.com", senha: "senha123", area: "novos-negocios" },
        { id: 15, nome: "Consultor 3 NN", email: "consultor3.nn@globalfocus.com", senha: "senha123", area: "novos-negocios" },
        { id: 16, nome: "Consultor 1 AD", email: "consultor1.ad@globalfocus.com", senha: "senha123", area: "administrativa" },
        { id: 17, nome: "Consultor 2 AD", email: "consultor2.ad@globalfocus.com", senha: "senha123", area: "administrativa" },
        { id: 18, nome: "Consultor 3 AD", email: "consultor3.ad@globalfocus.com", senha: "senha123", area: "administrativa" }
    ],
    diretores: [
        { id: 101, nome: "Diretor GP", email: "diretor.gp@globalfocus.com", senha: "senha123", area: "gestao-pessoas" },
        { id: 102, nome: "Diretor MK", email: "diretor.mk@globalfocus.com", senha: "senha123", area: "marketing" },
        { id: 103, nome: "Diretor FN", email: "diretor.fn@globalfocus.com", senha: "senha123", area: "financas" },
        { id: 104, nome: "Diretor LG", email: "diretor.lg@globalfocus.com", senha: "senha123", area: "logistica" },
        { id: 105, nome: "Diretor NN", email: "diretor.nn@globalfocus.com", senha: "senha123", area: "novos-negocios" },
        { id: 106, nome: "Diretor AD", email: "diretor.ad@globalfocus.com", senha: "senha123", area: "administrativa" }
    ]
};

// Função para verificar login
function checkLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (window.location.pathname.includes('dashboard.html') && !currentUser) {
        window.location.href = 'index.html';
    } else if (window.location.pathname.includes('index.html') && currentUser) {
        window.location.href = 'dashboard.html';
    }
}

// Função para fazer login
function login(email, password) {
    // Verifica consultores
    let user = users.consultores.find(u => u.email === email && u.senha === password);
    
    // Se não encontrou, verifica diretores
    if (!user) {
        user = users.diretores.find(u => u.email === email && u.senha === password);
    }
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    
    return false;
}

// Função para logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Configura o evento de login
document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorElement = document.getElementById('loginError');
            
            if (login(email, password)) {
                window.location.href = 'dashboard.html';
            } else {
                errorElement.textContent = 'E-mail ou senha incorretos';
            }
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Exporta funções para uso em outros arquivos
window.auth = {
    checkLogin,
    login,
    logout,
    users
};
