// Mapeamento de áreas
const areas = {
    "gestao-pessoas": "Gestão de Pessoas",
    "marketing": "Marketing",
    "financas": "Finanças",
    "logistica": "Logística",
    "novos-negocios": "Novos Negócios",
    "administrativa": "Administrativa"
};

// Configura o dashboard quando a página carrega
document.addEventListener('DOMContentLoaded', async function() {
    auth.checkLogin();
    
    if (window.location.pathname.includes('dashboard.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        setupDashboard(currentUser);
        await loadMessages(currentUser);
        setupEventListeners(currentUser);
    }
});

// Configura o dashboard
function setupDashboard(user) {
    document.getElementById('userName').textContent = user.nome;
    document.getElementById('userNameSm').textContent = user.nome.split(' ')[0];
    
    const isDirector = auth.users.diretores.some(d => d.id === user.id);
    const role = isDirector ? 'Diretor' : 'Consultor';
    
    document.getElementById('userRole').textContent = `${role} - ${areas[user.area]}`;
    document.getElementById('areaTitle').textContent = areas[user.area];
    
    // Destaca a área do usuário
    const departmentCards = document.querySelectorAll('.department-card');
    departmentCards.forEach(card => {
        if (card.dataset.area === user.area) {
            card.style.border = `2px solid var(--primary-color)`;
        }
    });
}

// Carrega as mensagens
async function loadMessages(user) {
    const isDirector = auth.users.diretores.some(d => d.id === user.id);
    const messageThreads = document.getElementById('messageThreads');
    
    messageThreads.innerHTML = '<div class="no-messages">Carregando mensagens...</div>';
    
    await github.loadData();
    const messages = github.getMessages();
    
    let userMessages = isDirector ? 
        messages.filter(m => m.recipientId === user.id) : 
        messages.filter(m => m.senderId === user.id);
    
    userMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    messageThreads.innerHTML = '';
    
    if (userMessages.length === 0) {
        messageThreads.innerHTML = '<div class="no-messages">Nenhuma mensagem encontrada</div>';
        return;
    }
    
    userMessages.forEach(msg => {
        const recipient = isDirector ? 
            auth.users.consultores.find(c => c.id === msg.senderId) : 
            auth.users.diretores.find(d => d.id === msg.recipientId);
        
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
        
        thread.addEventListener('click', async function() {
            await showMessageDetail(msg, user);
            
            document.querySelectorAll('.message-thread').forEach(t => {
                t.classList.remove('active');
            });
            
            this.classList.add('active');
        });
    });
    
    // Atualiza notificações
    if (isDirector) {
        const unreadCount = messages.filter(m => m.recipientId === user.id && !m.read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
    }
}

// Exibe detalhes da mensagem
async function showMessageDetail(msg, user) {
    const isDirector = auth.users.diretores.some(d => d.id === user.id);
    const messageContent = document.getElementById('messageContent');
    
    const sender = isDirector ? 
        auth.users.consultores.find(c => c.id === msg.senderId) : 
        auth.users.diretores.find(d => d.id === msg.recipientId);
    
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
    
    if (isDirector) {
        const replyBtn = document.querySelector('.btn-reply');
        replyBtn.addEventListener('click', async function() {
            const replyText = document.querySelector('.reply-textarea').value;
            if (replyText.trim()) {
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
                
                const currentMessages = github.getMessages();
                currentMessages.push(newMsg);
                github.setMessages(currentMessages);
                
                const success = await github.saveData();
                
                if (success) {
                    await loadMessages(user);
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
    
    const isDirector = auth.users.diretores.some(d => d.id === user.id);
    if (isDirector) {
        newMessageBtn.style.display = 'none';
        return;
    }
    
    const director = auth.users.diretores.find(d => d.area === user.area);
    if (director) {
        messageRecipient.innerHTML = `
            <option value="${director.id}">${director.nome} (${areas[director.area]})</option>
        `;
    }
    
    newMessageBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    const newMessageForm = document.getElementById('newMessageForm');
    newMessageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const subject = document.getElementById('messageSubject').value;
        const body = document.getElementById('messageBody').value;
        const recipientId = parseInt(document.getElementById('messageRecipient').value);
        
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
        
        const currentMessages = github.getMessages();
        currentMessages.push(newMsg);
        github.setMessages(currentMessages);
        
        const success = await github.saveData();
        
        if (success) {
            modal.style.display = 'none';
            await loadMessages(user);
            await showMessageDetail(newMsg, user);
            newMessageForm.reset();
        }
    });
}

// Configura os eventos
function setupEventListeners(user) {
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
