async function loadDatabase() {
    const { owner, repo, path, token } = GITHUB_CONFIG;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json"
            }
        });
        
        if (!response.ok) {
            // Se o arquivo não existe, cria um novo
            if (response.status === 404) {
                return {
                    users: createInitialUsers(),
                    messages: createInitialMessages()
                };
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return JSON.parse(atob(data.content.replace(/\s/g, '')));
    } catch (error) {
        console.error("Erro ao carregar database:", error);
        throw error;
    }
}

async function saveDatabase() {
    const { owner, repo, path, token } = GITHUB_CONFIG;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    try {
        // Primeiro obtemos o SHA do arquivo atual
        const currentFile = await fetch(url, {
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json"
            }
        }).then(res => res.ok ? res.json() : null);
        
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Atualização do banco de dados GlobalFocus",
                content: btoa(unescape(encodeURIComponent(JSON.stringify(database, null, 2)))),
                sha: currentFile?.sha
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao salvar: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Erro ao salvar database:", error);
        throw error;
    }
}

function createInitialUsers() {
    return {
        // Financeiro
        'financeiro_diretor': { password: 'fin123', name: 'Diretor Financeiro', role: 'diretor', area: 'Financeiro' },
        'financeiro_consultor1': { password: 'fin1', name: 'Consultor 1 Financeiro', role: 'consultor', area: 'Financeiro' },
        'financeiro_consultor2': { password: 'fin2', name: 'Consultor 2 Financeiro', role: 'consultor', area: 'Financeiro' },
        'financeiro_consultor3': { password: 'fin3', name: 'Consultor 3 Financeiro', role: 'consultor', area: 'Financeiro' },
        
        // Marketing
        'marketing_diretor': { password: 'mkt123', name: 'Diretor Marketing', role: 'diretor', area: 'Marketing' },
        'marketing_consultor1': { password: 'mkt1', name: 'Consultor 1 Marketing', role: 'consultor', area: 'Marketing' },
        'marketing_consultor2': { password: 'mkt2', name: 'Consultor 2 Marketing', role: 'consultor', area: 'Marketing' },
        'marketing_consultor3': { password: 'mkt3', name: 'Consultor 3 Marketing', role: 'consultor', area: 'Marketing' },
        
        // Recursos Humanos
        'rh_diretor': { password: 'rh123', name: 'Diretor RH', role: 'diretor', area: 'Recursos Humanos' },
        'rh_consultor1': { password: 'rh1', name: 'Consultor 1 RH', role: 'consultor', area: 'Recursos Humanos' },
        'rh_consultor2': { password: 'rh2', name: 'Consultor 2 RH', role: 'consultor', area: 'Recursos Humanos' },
        'rh_consultor3': { password: 'rh3', name: 'Consultor 3 RH', role: 'consultor', area: 'Recursos Humanos' },
        
        // Novos Negócios
        'negocios_diretor': { password: 'neg123', name: 'Diretor Novos Negócios', role: 'diretor', area: 'Novos Negócios' },
        'negocios_consultor1': { password: 'neg1', name: 'Consultor 1 Novos Negócios', role: 'consultor', area: 'Novos Negócios' },
        'negocios_consultor2': { password: 'neg2', name: 'Consultor 2 Novos Negócios', role: 'consultor', area: 'Novos Negócios' },
        'negocios_consultor3': { password: 'neg3', name: 'Consultor 3 Novos Negócios', role: 'consultor', area: 'Novos Negócios' },
        
        // Administrativo
        'admin_diretor': { password: 'adm123', name: 'Diretor Administrativo', role: 'diretor', area: 'Administrativo' },
        'admin_consultor1': { password: 'adm1', name: 'Consultor 1 Administrativo', role: 'consultor', area: 'Administrativo' },
        'admin_consultor2': { password: 'adm2', name: 'Consultor 2 Administrativo', role: 'consultor', area: 'Administrativo' },
        'admin_consultor3': { password: 'adm3', name: 'Consultor 3 Administrativo', role: 'consultor', area: 'Administrativo' },
        
        // Logística
        'logistica_diretor': { password: 'log123', name: 'Diretor Logística', role: 'diretor', area: 'Logística' },
        'logistica_consultor1': { password: 'log1', name: 'Consultor 1 Logística', role: 'consultor', area: 'Logística' },
        'logistica_consultor2': { password: 'log2', name: 'Consultor 2 Logística', role: 'consultor', area: 'Logística' },
        'logistica_consultor3': { password: 'log3', name: 'Consultor 3 Logística', role: 'consultor', area: 'Logística' }
    };
}

function createInitialMessages() {
    return {
        'Financeiro': [],
        'Marketing': [],
        'Recursos Humanos': [],
        'Novos Negócios': [],
        'Administrativo': [],
        'Logística': []
    };
}
