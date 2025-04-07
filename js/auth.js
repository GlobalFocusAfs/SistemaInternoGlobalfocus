// Dados de usuários (simulados)
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
    
    // Admin Global
    'GlobalFocusAfs': { password: 'admin123', area: 'administrativa', role: 'admin', name: 'Administrador GlobalFocus' }
};

// Mapeamento de áreas para valores do select
const areaValues = {
    'Gestão de Pessoas': 'gestao',
    'Marketing': 'marketing',
    'Finanças': 'financas',
    'Logística': 'logistica',
    'Novos Negócios': 'negocios',
    'Administrativa': 'administrativa'
};

// Função de login corrigida
function login(username, password, area) {
    // Verifica se é o admin global
    if(username === 'GlobalFocusAfs') {
        const user = users['GlobalFocusAfs'];
        if(user && user.password === password) {
            return user;
        }
        return null;
    }

    // Para outros usuários
    const areaPrefix = areaValues[area] || area;
    const userKey = `${areaPrefix}_${username.toLowerCase()}`;
    const user = users[userKey];
    
    if(user && user.password === password) {
        return user;
    }
    
    return null;
}

// Evento de login corrigido
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const areaSelect = document.getElementById('area');
            const area = areaSelect.options[areaSelect.selectedIndex].text;
            
            const user = login(username, password, area);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    name: user.name,
                    area: user.area,
                    role: user.role
                }));
                window.location.href = 'dashboard.html';
            } else {
                alert('Usuário, senha ou área incorretos. Tente novamente.');
                console.log('Falha no login:', { username, password, area });
            }
        });
    }
    
    // Restante do código permanece o mesmo...
});
