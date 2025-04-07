document.addEventListener('DOMContentLoaded', function() {
    // Verifica autenticação
    checkAuth();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Carrega mensagens
    loadAndDisplayMessages();
    
    // Configura filtros de mensagens
    setupMessageFilters();
    
    // Configura botão de nova mensagem
    if (document.getElementById('newMessageBtn')) {
        document.getElementById('newMessageBtn').addEventListener('click', function(e) {
            e.preventDefault();
            showNewMessageModal();
        });
    }
    
    // Configura fechamento do modal
    if (document.getElementById('closeModalBtn')) {
        document.getElementById('closeModalBtn').addEventListener('click', function(e) {
            e.preventDefault();
            hideNewMessageModal();
        });
    }
    
    if (document.getElementById('cancelMessageBtn')) {
        document.getElementById('cancelMessageBtn').addEventListener('click', function(e) {
            e.preventDefault();
            hideNewMessageModal();
        });
    }
    
    // Configura envio de mensagem
    if (document.getElementById('messageForm')) {
        document.getElementById('messageForm').addEventListener('submit', function(e) {
            e.preventDefault();
            sendNewMessage();
        });
    }
    
    // Configura navegação por áreas
    setupAreaNavigation();
});

// Carrega e exibe mensagens
async function loadAndDisplayMessages() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        const messagesData = await loadMessages();
        const messages = messagesData.messages || [];
        
        // Filtra mensagens relevantes para o usuário atual
        let filteredMessages = [];
        
        if (currentUser.role === 'consultor') {
            // Consultores veem apenas mensagens que enviaram ou receberam
            filteredMessages = messages.filter(msg => 
                msg.sender === currentUser.username || 
                (msg.recipient === currentUser.username && msg.area === currentUser.area)
            );
        } else if (currentUser.role === 'diretor') {
            // Diretores veem mensagens de sua área
            filteredMessages = messages.filter(msg => 
                msg.area === currentUser.area || 
                msg.sender === currentUser.username || 
                msg.recipient === currentUser.username
            );
        } else if (currentUser.role === 'admin') {
            // Admin vê todas as mensagens
            filteredMessages = messages;
        }
        
        // Exibe mensagens
        displayMessages(filteredMessages);
        
        // Atualiza contador de mensagens não lidas
        updateUnreadCount(filteredMessages);
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}

// Exibe mensagens na lista
function displayMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="no-messages">Nenhuma mensagem encontrada</div>';
        return;
    }
    
    // Ordena mensagens por data (mais recente primeiro)
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    messages.forEach((message, index) => {
        const messageItem = document.createElement('div');
        messageItem.className = `message-item ${!message.read ? 'unread' : ''}`;
        messageItem.dataset.index = index;
        
        const sender = message.senderName || message.sender;
        const subject = message.subject || '(Sem assunto)';
        const preview = message.body.length > 50 ? message.body.substring(0, 50) + '...' : message.body;
        const date = formatDate(message.timestamp);
        
        messageItem.innerHTML = `
            <div class="message-sender">
                <span>${sender}</span>
                <span class="message-date">${date}</span>
            </div>
            <div class="message-subject">${subject}</div>
            <div class="message-preview">${preview}</div>
        `;
        
        messageItem.addEventListener('click', function() {
            showMessageContent(message, index);
            markMessageAsRead(message, index);
        });
        
        messagesList.appendChild(messageItem);
    });
}

// Exibe o conteúdo de uma mensagem
function showMessageContent(message, index) {
    const messageContent = document.getElementById('messageContent');
    if (!messageContent) return;
    
    const date = formatDate(message.timestamp);
    const sender = message.senderName || message.sender;
    const recipient = message.recipientName || message.recipient;
    
    messageContent.innerHTML = `
        <div class="message-header">
            <h3 class="message-subject-large">${message.subject || '(Sem assunto)'}</h3>
            <div class="message-meta">
                <span><strong>De:</strong> ${sender}</span>
                <span><strong>Para:</strong> ${recipient}</span>
                <span><strong>Data:</strong> ${date}</span>
            </div>
        </div>
        <div class="message-body">
            ${message.body.replace(/\n/g, '<br>')}
        </div>
    `;
    
    // Marca a mensagem como selecionada na lista
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => item.classList.remove('selected'));
    if (index !== undefined) {
        messageItems[index]?.classList.add('selected');
    }
}

// Formata data para exibição
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Atualiza contador de mensagens não lidas
function updateUnreadCount(messages) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const unreadCount = messages.filter(msg => 
        !msg.read && msg.recipient === currentUser.username
    ).length;
    
    const messageCountBadge = document.getElementById('messageCount');
    const unreadMessagesBadge = document.getElementById('unreadMessages');
    
    if (messageCountBadge) {
        messageCountBadge.textContent = unreadCount;
        messageCountBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
    
    if (unreadMessagesBadge) {
        unreadMessagesBadge.textContent = `${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`;
    }
}

// Configura filtros de mensagens
function setupMessageFilters() {
    const filterButtons = document.querySelectorAll('.message-filters button');
    if (!filterButtons) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Ativa o botão clicado
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filtra mensagens
            const filter = this.dataset.filter;
            filterMessages(filter);
        });
    });
    
    // Configura clique no link de mensagens
    const messagesLink = document.querySelector('.messages-link');
    if (messagesLink) {
        messagesLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mostra a seção de mensagens
            document.querySelector('.messages-section').classList.remove('hidden');
            document.querySelector('.welcome-banner').classList.add('hidden');
            document.querySelector('.dashboard-cards').classList.add('hidden');
            
            // Atualiza o título da página
            document.getElementById('pageTitle').textContent = 'Mensagens';
            
            // Filtra para mostrar a caixa de entrada por padrão
            filterMessages('inbox');
        });
    }
}

// Filtra mensagens
async function filterMessages(filter) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        const messagesData = await loadMessages();
        const messages = messagesData.messages || [];
        
        let filteredMessages = [];
        
        if (filter === 'inbox') {
            // Caixa de entrada: mensagens onde o usuário atual é o destinatário
            filteredMessages = messages.filter(msg => 
                msg.recipient === currentUser.username
            );
        } else if (filter === 'sent') {
            // Enviadas: mensagens onde o usuário atual é o remetente
            filteredMessages = messages.filter(msg => 
                msg.sender === currentUser.username
            );
        }
        
        displayMessages(filteredMessages);
    } catch (error) {
        console.error('Erro ao filtrar mensagens:', error);
    }
}

// Mostra o modal de nova mensagem
function showNewMessageModal() {
    const modal = document.getElementById('newMessageModal');
    if (!modal) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Limpa o formulário
    document.getElementById('messageForm').reset();
    
    // Preenche a lista de destinatários
    const recipientSelect = document.getElementById('recipient');
    recipientSelect.innerHTML = '<option value="">Selecione o destinatário</option>';
    
    if (currentUser.role === 'consultor') {
        // Consultores só podem enviar para o diretor de sua área
        const directorUsername = `${currentUser.area.substring(0, 2)}_diretor`;
        const directorName = users[directorUsername]?.name || 'Diretor';
        
        const option = document.createElement('option');
        option.value = directorUsername;
        option.textContent = `${directorName} (Diretor)`;
        recipientSelect.appendChild(option);
    } else if (currentUser.role === 'diretor') {
        // Diretores podem enviar para consultores de sua área
        for (let i = 1; i <= 3; i++) {
            const consultantUsername = `${currentUser.area.substring(0, 2)}_consultor${i}`;
            const consultantName = users[consultantUsername]?.name || `Consultor ${i}`;
            
            const option = document.createElement('option');
            option.value = consultantUsername;
            option.textContent = `${consultantName} (Consultor)`;
            recipientSelect.appendChild(option);
        }
    } else if (currentUser.role === 'admin') {
        // Admin pode enviar para qualquer um
        Object.entries(users).forEach(([username, user]) => {
            if (username !== currentUser.username) {
                const roleName = user.role === 'consultor' ? 'Consultor' : 
                               user.role === 'diretor' ? 'Diretor' : 'Admin';
                
                const option = document.createElement('option');
                option.value = username;
                option.textContent = `${user.name} (${roleName} - ${areaNames[user.area]})`;
                recipientSelect.appendChild(option);
            }
        });
    }
    
    // Mostra o modal
    modal.classList.remove('hidden');
}

// Esconde o modal de nova mensagem
function hideNewMessageModal() {
    const modal = document.getElementById('newMessageModal');
    if (modal) modal.classList.add('hidden');
}

// Envia uma nova mensagem
async function sendNewMessage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const recipient = document.getElementById('recipient').value;
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('messageText').value;
    
    if (!recipient || !subject || !body) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const recipientUser = users[recipient];
    if (!recipientUser) {
        alert('Destinatário inválido!');
        return;
    }
    
    const newMessage = {
        sender: currentUser.username,
        senderName: currentUser.name,
        recipient: recipient,
        recipientName: recipientUser.name,
        area: currentUser.role === 'admin' ? recipientUser.area : currentUser.area,
        subject: subject,
        body: body,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    try {
        const success = await sendMessage(newMessage);
        
        if (success) {
            alert('Mensagem enviada com sucesso!');
            hideNewMessageModal();
            loadAndDisplayMessages(); // Atualiza a lista de mensagens
        } else {
            alert('Erro ao enviar mensagem. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        alert('Erro ao enviar mensagem. Tente novamente.');
    }
}

// Marca mensagem como lida
async function markMessageAsRead(message, index) {
    if (message.read) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || message.recipient !== currentUser.username) return;
    
    try {
        const messagesData = await loadMessages();
        const messages = messagesData.messages || [];
        
        // Encontra a mensagem no array (pode ter um índice diferente devido ao filtro)
        const messageToUpdate = messages.find(msg => 
            msg.sender === message.sender && 
            msg.recipient === message.recipient && 
            msg.timestamp === message.timestamp
        );
        
        if (messageToUpdate) {
            messageToUpdate.read = true;
            await saveMessages({ messages });
            
            // Atualiza a exibição
            const messageItems = document.querySelectorAll('.message-item');
            if (index !== undefined && messageItems[index]) {
                messageItems[index].classList.remove('unread');
            }
            
            // Atualiza contador
            updateUnreadCount(messages.filter(msg => 
                msg.recipient === currentUser.username
            ));
        }
    } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
    }
}

// Configura navegação por áreas
function setupAreaNavigation() {
    const areaLinks = document.querySelectorAll('[data-area]');
    if (!areaLinks) return;
    
    areaLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const area = this.dataset.area;
            showAreaDashboard(area);
        });
    });
}

// Mostra dashboard da área
function showAreaDashboard(area) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Verifica se o usuário tem acesso à área
    if (currentUser.role !== 'admin' && currentUser.area !== area && currentUser.area !== 'all') {
        alert('Você não tem acesso a esta área!');
        return;
    }
    
    // Atualiza o título da página
    document.getElementById('pageTitle').textContent = areaNames[area];
    
    // Mostra o dashboard principal
    document.querySelector('.messages-section').classList.add('hidden');
    document.querySelector('.welcome-banner').classList.remove('hidden');
    document.querySelector('.dashboard-cards').classList.remove('hidden');
    
    // Atualiza a mensagem de boas-vindas
    document.getElementById('welcomeArea').textContent = areaNames[area];
}
