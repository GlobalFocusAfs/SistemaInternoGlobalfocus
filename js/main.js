// Dados de usuários
const users = {
    "consultores": [
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
    "diretores": [
        { id: 101, nome: "Diretor GP", email: "diretor.gp@globalfocus.com", senha: "senha123", area: "gestao-pessoas" },
        { id: 102, nome: "Diretor MK", email: "diretor.mk@globalfocus.com", senha: "senha123", area: "marketing" },
        { id: 103, nome: "Diretor FN", email: "diretor.fn@globalfocus.com", senha: "senha123", area: "financas" },
        { id: 104, nome: "Diretor LG", email: "diretor.lg@globalfocus.com", senha: "senha123", area: "logistica" },
        { id: 105, nome: "Diretor NN", email: "diretor.nn@globalfocus.com", senha: "senha123", area: "novos-negocios" },
        { id: 106, nome: "Diretor AD", email: "diretor.ad@globalfocus.com", senha: "senha123", area: "administrativa" }
    ]
};

// Mapeamento de áreas
const areas = {
    "gestao-pessoas": "Gestão de Pessoas",
    "marketing": "Marketing",
    "financas": "Finanças",
    "logistica": "Logística",
    "novos-negocios": "Novos Negócios",
    "administrativa": "Administrativa"
};

// Verifica se o usuário está logado
document.addEventListener('DOMContentLoaded', async function() {
    // Tornar users global para acesso pelo github.js
    window.users = users;
    
    if (window.location.pathname.includes('dashboard.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // Configura o dashboard
        setupDashboard(currentUser);
        
        // Carrega as mensagens do GitHub
        await loadMessages(currentUser);
        
        // Configura os eventos
        setupEventListeners(currentUser);
    } else if (window.location.pathname.includes('index.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.location.href = 'dashboard.html';
        }
        
        // Configura o evento de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                // Verifica se é um consultor
                let user = users.consultores.find(u => u.email === email && u.senha === password);
                
                // Se não for consultor, verifica se é diretor
                if (!user) {
                    user = users.diretores.find(u => u.email === email && u.senha === password);
                }
                
                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    window.location.href = 'dashboard.html';
                } else {
                    alert('E-mail ou senha incorretos!');
                }
            });
        }
    }
});

// Configura o dashboard
function setupDashboard(user) {
    document.getElementById('userName').textContent = user.nome;
    document.getElementById('userNameSm').textContent = user.nome.split(' ')[0];
    
    const isDirector = users.diretores.some(d => d.id === user.id);
    const role = isDirector ? 'Diretor' : 'Consultor';
    
    document.getElementById('userRole').textContent = `${role} - ${areas[user.area]}`;
    document.getElementById('areaTitle').textContent = areas[user.area];
    
    // Destaca a área do usuário
    const departmentCards = document.querySelectorAll('.department-card');
    departmentCards.forEach(card => {
        if (card.dataset.area === user.area) {
            card.style.border = `2px solid var(--primary-color)`;
            card.style.transform = 'scale(1.02)';
        }
    });
}

// Carrega as mensagens
async function loadMessages(user) {
    const isDirector = users.diretores.some(d => d.id === user.id);
    const messageThreads = document.getElementById('messageThreads');
    
    // Mostra estado de carregamento
    messageThreads.innerHTML = '<div class="no-messages">Carregando mensagens...</div>';
    
    // Carrega dados do GitHub
    await github.loadData();
    const messages = github.getMessages();
    
    // Filtra as mensagens relevantes
    let userMessages = isDirector ? 
        messages.filter(m => m.recipientId === user.id) : 
        messages.filter(m => m.senderId === user.id);
    
    // Ordena por data (mais recente primeiro)
    userMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Atualiza a UI
    messageThreads.innerHTML = '';
    
    if (userMessages.length === 0) {
        messageThreads.innerHTML = '<div class="no-messages">Nenhuma mensagem encontrada</div>';
        return;
    }
    
    userMessages.forEach(msg => {
        const recipient = isDirector ? 
            users.consultores.find(c => c.id === msg.senderId) : 
            users.diretores.find(d => d.id === msg.recipientId);
        
        const thread = document.createElement('div');
        thread.className = 'message-thread';
        thread.dataset.messageId = msg.id;
        
        thread.innerHTML = `
            <div class="thread-sender">${isDirector ? recipient.nome : `Para: ${recipient.nome}`}</div>
            <div class="thread-subject">${msg.subject}</div>
            <div class="thread-preview">${msg.body.substring(0, 50)}...</div>
            <div class="thread-date">${formatDate(msg.date)}</div>
        `;
        
        messageThreads.appendChild(thread);
        
        // Evento de clique para exibir a mensagem
        thread.addEventListener('click', async function() {
            await showMessageDetail(msg, user);
            
            // Remove a classe active de todas as threads
            document.querySelectorAll('.message-thread').forEach(t => {
                t.classList.remove('active');
            });
            
            // Adiciona a classe active à thread clicada
            this.classList.add('active');
        });
    });
    
    // Atualiza contador de notificações (para diretores)
    if (isDirector) {
        const unreadCount = messages.filter(m => m.recipientId === user.id && !m.read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
    }
}

// Exibe o detalhe da mensagem
async function showMessageDetail(msg, user) {
    const isDirector = users.diretores.some(d => d.id === user.id);
    const messageContent = document.getElementById('messageContent');
    
    const sender = isDirector ? 
        users.consultores.find(c => c.id === msg.senderId) : 
        users.diretores.find(d => d.id === msg.recipientId);
    
    messageContent.innerHTML = `
        <div class="message-detail">
            <div class="message-detail-header">
                <h3 class="message-subject">${msg.subject}</h3>
                <div class="message-meta">
                    <span>De: ${isDirector ? sender.nome : 'Você'}</span>
                    <span>Para: ${isDirector ? 'Você' : sender.nome}</span>
                    <span>${formatDate(msg.date)}</span>
                </div>
            </div>
            <div class="message-body">
                ${msg.body.replace(/\n/g, '<br>')}
            </div>
            ${isDirector ? `
            <div class="message-reply">
                <textarea class="reply-textarea" placeholder="Digite sua resposta..."></textarea>
                <button class="btn-reply">Responder</button>
            </div>
            ` : ''}
        </div>
    `;
    
    // Configura o botão de resposta (se for diretor)
    if (isDirector) {
        const replyBtn = document.querySelector('.btn-reply');
        replyBtn.addEventListener('click', async function() {
            const replyText = document.querySelector('.reply-textarea').value;
            if (replyText.trim()) {
                // Cria uma nova mensagem (resposta)
                const newMsg = {
                    id: Date.now(),
                    senderId: user.id,
                    recipientId: msg.senderId,
                    subject: `Re: ${msg.subject}`,
                    body: replyText,
                    date: new Date().toISOString(),
                    read: false,
                    area: user.area
                };
                
                // Adiciona às mensagens locais
                const currentMessages = github.getMessages();
                currentMessages.push(newMsg);
                github.setMessages(currentMessages);
                
                // Salva no GitHub
                const success = await github.saveData();
                
                if (success) {
                    // Recarrega as mensagens
                    await loadMessages(user);
                    
                    // Mostra a mensagem enviada
                    await showMessageDetail(newMsg, user);
                }
            }
        });
    }
}

// Configura o modal de nova mensagem
function setupNewMessageModal(user) {
    const modal = document.getElementById('newMessageModal');
    const newMessageBtn = document.getElementById('newMessageBtn');
    const closeModal = document.querySelector('.close-modal');
    const messageRecipient = document.getElementById('messageRecipient');
    
    // Somente consultores podem enviar mensagens
    const isDirector = users.diretores.some(d => d.id === user.id);
    if (isDirector) {
        newMessageBtn.style.display = 'none';
        return;
    }
    
    // Preenche o select com o diretor da área do usuário
    const director = users.diretores.find(d => d.area === user.area);
    if (director) {
        messageRecipient.innerHTML = `
            <option value="${director.id}">${director.nome} (${areas[director.area]})</option>
        `;
    }
    
    // Abre o modal
    newMessageBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });
    
    // Fecha o modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fecha o modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Envia a nova mensagem
    const newMessageForm = document.getElementById('newMessageForm');
    newMessageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const subject = document.getElementById('messageSubject').value;
        const body = document.getElementById('messageBody').value;
        const recipientId = parseInt(document.getElementById('messageRecipient').value);
        
        // Cria a nova mensagem
        const newMsg = {
            id: Date.now(),
            senderId: user.id,
            recipientId: recipientId,
            subject: subject,
            body: body,
            date: new Date().toISOString(),
            read: false,
            area: user.area
        };
        
        // Adiciona às mensagens locais
        const currentMessages = github.getMessages();
        currentMessages.push(newMsg);
        github.setMessages(currentMessages);
        
        // Salva no GitHub
        const success = await github.saveData();
        
        if (success) {
            // Fecha o modal
            modal.style.display = 'none';
            
            // Recarrega as mensagens
            await loadMessages(user);
            
            // Mostra a mensagem enviada
            await showMessageDetail(newMsg, user);
            
            // Reseta o formulário
            newMessageForm.reset();
        }
    });
}

// Configura os eventos
function setupEventListeners(user) {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Configura o modal de nova mensagem
    setupNewMessageModal(user);
}

// Formata a data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
