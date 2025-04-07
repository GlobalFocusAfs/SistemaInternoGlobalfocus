// Configurações do GitHub
const githubConfig = {
    username: 'GlobalFocusAfs',
    token: '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',
    repo: 'globalfocus-data',
    branch: 'main',
    filePath: 'data/messages.json'
};

// URL base da API do GitHub
const githubApiUrl = `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${githubConfig.filePath}`;

// Função para salvar mensagens no GitHub
async function saveMessagesToGitHub(messages) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) throw new Error('Usuário não autenticado');
        
        // Converte as mensagens para JSON
        const content = JSON.stringify(messages, null, 2);
        
        // Codifica o conteúdo em Base64
        const contentBase64 = btoa(unescape(encodeURIComponent(content)));
        
        // Verifica se o arquivo já existe para obter o SHA
        let sha = null;
        try {
            const response = await fetch(githubApiUrl, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                sha = data.sha;
            }
        } catch (e) {
            console.log('Arquivo não existe, será criado um novo');
        }
        
        // Configuração da requisição
        const requestBody = {
            message: `Atualização de mensagens por ${currentUser.name}`,
            content: contentBase64,
            branch: githubConfig.branch
        };
        
        // Adiciona o SHA se o arquivo já existir
        if (sha) {
            requestBody.sha = sha;
        }
        
        // Faz a requisição para criar/atualizar o arquivo
        const response = await fetch(githubApiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao salvar no GitHub');
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar mensagens no GitHub:', error);
        return false;
    }
}

// Função para carregar mensagens do GitHub
async function loadMessagesFromGitHub() {
    try {
        const response = await fetch(githubApiUrl, {
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            // Se o arquivo não existir, retorna array vazio
            if (response.status === 404) {
                return [];
            }
            throw new Error('Erro ao carregar do GitHub');
        }
        
        const data = await response.json();
        const content = decodeURIComponent(escape(atob(data.content)));
        return JSON.parse(content);
    } catch (error) {
        console.error('Erro ao carregar mensagens do GitHub:', error);
        return [];
    }
}
