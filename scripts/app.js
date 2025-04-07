// Configurações do Sistema
const CONFIG = {
    repoOwner: "GlobalFocusAfs",
    repoName: "GlobalFocus",
    dbPath: "data/database.json"
};

// Estado da Aplicação
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
});

// Controle de Login
function initLoginForm() {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const db = await GitHubService.loadDatabase();
            
            if (db.users[username] && db.users[username].password === password) {
                currentUser = db.users[username];
                currentUser.username = username;
                showUserDashboard();
            } else {
                showMessage('login-message', 'Credenciais inválidas!', 'error');
            }
        } catch (error) {
            showMessage('login-message', `Erro: ${error.message}`, 'error');
        }
    });
}

// Navegação
function showUserDashboard() {
    hideAllPanels();
    
    if (currentUser.role === 'consultor') {
        document.getElementById('consultor-name').textContent = currentUser.name;
        document.getElementById('consultor-title').textContent = `Área do Consultor - ${currentUser.area}`;
        document.getElementById('consultor-dashboard').classList.remove('hidden');
        loadConsultorMessages();
    } else if (currentUser.role === 'diretor') {
        document.getElementById('diretor-name').textContent = currentUser.name;
        document.getElementById('diretor-title').textContent = `Área do Diretor - ${currentUser.area}`;
        document.getElementById('diretor-dashboard').classList.remove('hidden');
        loadDiretorMessages();
    }
}

// Funções de Mensagens
async function sendMessage() {
    const messageText = document.getElementById('consultor-message').value.trim();
    if (!messageText) {
        showMessage('message-status', 'Digite uma mensagem válida!', 'error');
        return;
    }

    try {
        const message = {
            from: currentUser.username,
            text: messageText,
            date: new Date().toISOString(),
            area: currentUser.area
        };

        await GitHubService.saveMessage(message);
        document.getElementById('consultor-message').value = '';
        showMessage('message-status', 'Mensagem enviada com sucesso!', 'success');
        loadConsultorMessages();
    } catch (error) {
        showMessage('message-status', `Erro: ${error.message}`, 'error');
    }
}

async function loadConsultorMessages() {
    try {
        const messages = await GitHubService.getMessagesByArea(currentUser.area);
        displayMessages('consultor-messages', messages);
    } catch (error) {
        showMessage('consultor-messages', `Erro ao carregar mensagens: ${error.message}`, 'error');
    }
}

async function loadDiretorMessages() {
    try {
        const messages = await GitHubService.getMessagesByArea(currentUser.area);
        displayMessages('diretor-messages', messages);
    } catch (error) {
        showMessage('diretor-messages', `Erro ao carregar mensagens: ${error.message}`, 'error');
    }
}

// Utilitários
function displayMessages(containerId, messages) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = '<p class="no-messages">Nenhuma mensagem encontrada.</p>';
        return;
    }

    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        messageElement.innerHTML = `
            <div class="message-header">
                <strong>${msg.from}</strong>
                <span class="message-date">${new Date(msg.date).toLocaleString()}</span>
            </div>
            <div class="message-content">${msg.text}</div>
        `;
        container.appendChild(messageElement);
    });
}

function hideAllPanels() {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.add('hidden');
    });
}

function showMessage(elementId, text, type) {
    const element = document.getElementById(elementId);
    element.textContent = text;
    element.className = `message ${type}`;
    setTimeout(() => element.textContent = '', 5000);
}

function logout() {
    currentUser = null;
    hideAllPanels();
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('login-form').reset();
}
