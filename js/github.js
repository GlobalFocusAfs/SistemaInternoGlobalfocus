// Configuração para integração com GitHub
const GITHUB_REPO = 'GlobalFocusAfs/globalfocus-data';
const GITHUB_FILE_PATH = 'data/database.json';
const GITHUB_TOKEN = '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';

// Variável para controle de carregamento
let isLoading = false;

// Função para carregar dados do GitHub
async function loadDataFromGitHub() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        console.log('Carregando dados do GitHub...');
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados do GitHub: ${response.status}`);
        }
        
        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        
        // Atualiza os dados locais
        if (content.messages) {
            messages = content.messages;
            console.log('Mensagens carregadas:', messages.length);
        }
        
        console.log('Dados carregados do GitHub com sucesso!');
        return content;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlert('Erro ao carregar dados. Usando dados locais.', 'error');
        return null;
    } finally {
        isLoading = false;
    }
}

// Função para salvar dados no GitHub
async function saveDataToGitHub() {
    if (isLoading) return false;
    isLoading = true;
    
    try {
        console.log('Salvando dados no GitHub...');
        
        // Primeiro, obtemos o SHA do arquivo atual para atualizá-lo
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
            users: users,
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
                message: `Atualização do sistema GlobalFocus - ${new Date().toLocaleString()}`,
                content: content,
                sha: sha || undefined
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao salvar dados no GitHub');
        }
        
        console.log('Dados salvos no GitHub com sucesso!');
        showAlert('Dados salvos com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showAlert(`Erro ao salvar dados: ${error.message}`, 'error');
        return false;
    } finally {
        isLoading = false;
    }
}

// Mostrar alerta na UI
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `github-alert github-alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Carrega os dados do GitHub quando a página é carregada
document.addEventListener('DOMContentLoaded', async function() {
    if (window.location.pathname.includes('dashboard.html')) {
        await loadDataFromGitHub();
        
        // Atualiza a interface com os dados carregados
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            loadMessages(currentUser);
        }
    }
});

// Exportar funções para uso em outros arquivos
window.github = {
    loadData: loadDataFromGitHub,
    saveData: saveDataToGitHub
};
