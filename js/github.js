// Configuração para integração com GitHub
const GITHUB_REPO = 'GlobalFocusAfs/globalfocus-data';
const GITHUB_FILE_PATH = 'data/database.json';
const GITHUB_TOKEN = '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';

// Variável para controle de carregamento
let isLoading = false;
let messages = [];

// Função para mostrar alertas
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `github-alert github-alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Função para mostrar/ocultar loading
function toggleLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// Função para carregar dados do GitHub
async function loadDataFromGitHub() {
    if (isLoading) return { messages: [] };
    isLoading = true;
    toggleLoading(true);
    
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                const created = await saveDataToGitHub();
                return created ? { messages: [] } : { messages: [] };
            }
            throw new Error(`Erro ao carregar dados: ${response.status}`);
        }
        
        const data = await response.json();
        const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
        
        messages = content.messages || [];
        return content;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlert('Erro ao carregar dados. Usando dados locais.', 'error');
        return { messages: [] };
    } finally {
        isLoading = false;
        toggleLoading(false);
    }
}

// Função para salvar dados no GitHub
async function saveDataToGitHub() {
    if (isLoading) return false;
    isLoading = true;
    toggleLoading(true);
    
    try {
        // Obtém SHA do arquivo atual
        let sha = '';
        try {
            const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }
        } catch (e) {
            console.log('Arquivo não existe ainda, será criado novo');
        }
        
        // Prepara os dados para salvar
        const dataToSave = {
            users: window.auth.users || {},
            messages: messages,
            lastUpdated: new Date().toISOString()
        };
        
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(dataToSave, null, 2))));
        
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Atualização do sistema GlobalFocus - ${new Date().toLocaleString('pt-BR')}`,
                content: content,
                sha: sha || undefined
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao salvar dados');
        }
        
        showAlert('Dados salvos com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showAlert(`Erro ao salvar dados: ${error.message}`, 'error');
        return false;
    } finally {
        isLoading = false;
        toggleLoading(false);
    }
}

// Exporta funções para uso global
window.github = {
    loadData: loadDataFromGitHub,
    saveData: saveDataToGitHub,
    getMessages: () => messages,
    setMessages: (newMessages) => { messages = newMessages; }
};
