// Configurações do GitHub
const GITHUB_TOKEN = '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';
const REPO_OWNER = 'GlobalFocusAfs';
const REPO_NAME = 'globalfocus-messages';
const FILE_PATH = 'messages.json';

// Função para carregar mensagens do GitHub
async function loadMessages() {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar mensagens');
        }
        
        const data = await response.json();
        const content = atob(data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        return { messages: [] }; // Retorna estrutura vazia em caso de erro
    }
}

// Função para salvar mensagens no GitHub
async function saveMessages(messages) {
    try {
        // Primeiro, obtemos o SHA do arquivo atual para atualização
        const getUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = '';
        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
        }
        
        // Prepara os dados para enviar
        const content = JSON.stringify(messages, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Atualização de mensagens',
                content: encodedContent,
                sha: sha || undefined
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao salvar mensagens');
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar mensagens:', error);
        return false;
    }
}

// Função para enviar uma nova mensagem
async function sendMessage(newMessage) {
    try {
        const messagesData = await loadMessages();
        const messages = messagesData.messages || [];
        
        // Adiciona a nova mensagem
        messages.push(newMessage);
        
        // Salva de volta no GitHub
        const success = await saveMessages({ messages });
        
        if (success) {
            return true;
        } else {
            throw new Error('Falha ao salvar mensagem');
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return false;
    }
}
