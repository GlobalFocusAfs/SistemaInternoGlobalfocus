// Variável global para armazenar mensagens
let messages = [];

// Função para carregar e exibir mensagens
async function loadMessages() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Carrega mensagens do GitHub
    messages = await loadMessagesFromGitHub();
    
    // Filtra mensagens relevantes para o usuário atual
    let userMessages = [];
    
    if (currentUser.role === 'consultor') {
        // Consultor vê apenas mensagens que ele enviou ou recebeu do diretor de sua área
        userMessages = messages.filter(msg => 
            (msg.sender === currentUser.username && msg.senderArea === currentUser.area) ||
            (msg.recipient === currentUser.username && msg.recipientArea === currentUser.area)
        );
    } else if (currentUser.role === 'diretor') {
        // Diretor vê mensagens de todos os consultores de sua área
        userMessages = messages.filter(msg => 
            msg.recipientArea === currentUser.area || 
            (msg.senderArea === currentUser.area && msg.recipientArea === currentUser.area)
        );
    } else if (currentUser.role === 'admin') {
        // Admin vê todas as mensagens
        userMessages = messages;
    }
    
    // Ordena por data (mais recente primeiro)
    userMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Atualiza a contagem de mensagens não lidas
    const unreadCount = userMessages.filter(msg => !msg.read && msg.recipient === currentUser.username).length;
    document.getElementById('unreadMessages').textContent = unreadCount;
    
    // Renderiza a lista de mensagens
    renderMessagesList(userMessages);
    
    // Se houver mensagem selecionada na URL, exibe ela
    const urlParams = new URLSearchParams(window.location.search);
    const selectedMessageId = urlParams.get('message');
    
    if (selectedMessageId) {
        const selectedMessage = userMessages.find(msg => msg.id === selectedMessageId);
        if (selectedMessage) {
            renderMessageDetail(selectedMessage);
            
            // Marca como lida se for o destinatário
            if (selectedMessage.recipient === currentUser.username && !selectedMessage.read) {
                selectedMessage.read = true;
                await saveMessagesToGitHub(messages);
                loadMessages(); // Recarrega para atualizar a contagem
            }
        }
    }
}

// Função para renderizar a lista de mensagens
function renderMessagesList(messages) {
    const messagesList = document.getElementById('messagesList');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<li class="no-messages">Nenhuma mensagem encontrada</li>';
        return;
    }
    
    messages.forEach(message => {
        const isUnread = !message.read && message.recipient === currentUser.username;
        const isSelected = new URLSearchParams(window.location.search).get('message') === message.id;
        
        const messageItem = document.createElement('li');
        messageItem.className = `message-item ${isUnread ? 'unread' : ''} ${isSelected ? 'selected' : ''}`;
        messageItem.innerHTML = `
            <div class="message-sender">${getUserName(message.sender)}</div>
            <div class="message-subject">${message.subject}</div>
            <div class="message-preview">${message.content.substring(0, 50)}...</div>
            <div class="message-time">${formatDate(message.timestamp)}</div>
        `;
        
        messageItem.addEventListener('click', () => {
            window.history.pushState({}, '', `?message=${message.id}`);
            renderMessageDetail(message);
            
            // Marca como lida se for o destinatário
            if (message.recipient === currentUser.username && !message.read) {
                message.read = true;
                saveMessagesToGitHub(messages).then(() => loadMessages());
            }
            
            // Atualiza a classe selected
            document.querySelectorAll('.message-item').forEach(item => {
                item.classList.remove('selected');
            });
            messageItem.classList.add('selected');
        });
        
        messagesList.appendChild(messageItem);
    });
}

// Função para renderizar o detalhe de uma mensagem
function renderMessageDetail(message) {
    const messagesContent = document.getElementById('messagesContent');
    
    messagesContent.innerHTML = `
        <div class="message-detail">
            <div class="message-header">
                <h3>${message.subject}</h3>
                <div class="message-meta">
                    <span class="message-from">De: ${getUserName(message.sender)}</span>
                    <span class="message-to">Para: ${getUserName(message.recipient)}</span>
                </div>
                <div class="message-date">${formatDate(message.timestamp, true)}</div>
            </div>
            <div class="message-body">
                ${message.content.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
}

// Função para enviar uma nova mensagem
async function sendNewMessage(recipient, subject, content) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    
    // Verifica se o destinatário é válido
    const recipientParts = recipient.split('_');
    if (recipientParts.length !== 2) return false;
    
    const recipientArea = recipientParts[0];
    const recipientUsername = recipientParts[1];
    
    // Cria o objeto da mensagem
    const newMessage = {
        id: generateId(),
        sender: currentUser.username,
        senderArea: currentUser.area,
        recipient: recipientUsername,
        recipientArea: recipientArea,
        subject: subject,
        content: content,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Adiciona à lista de mensagens
    messages.push(newMessage);
    
    // Salva no GitHub
    const success = await saveMessagesToGitHub(messages);
    
    if (success) {
        // Recarrega as mensagens
        loadMessages();
        return true;
    }
    
    return false;
}

// Função para configurar o modal de nova mensagem
function setupNewMessageModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'consultor') return;
    
    const modal = document.getElementById('newMessageModal');
    const newMessageBtn = document.getElementById('newMessageBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const recipientSelect = document.getElementById('recipient');
    
    // Preenche o select de destinatários
    recipientSelect.innerHTML = '';
    
    // Consultores só podem enviar para o diretor de sua área
    if (currentUser.role === 'consultor') {
        const directorUsername = `${currentUser.area}_diretor`;
        const directorName = users[directorUsername]?.name || 'Diretor';
        
        const option = document.createElement('option');
        option.value = directorUsername;
        option.textContent = `${directorName} (Diretor ${areaNames[currentUser.area]})`;
        recipientSelect.appendChild(option);
    }
    
    // Admin pode enviar para qualquer um (exemplo simplificado)
    if (currentUser.role === 'admin') {
        Object.entries(users).forEach(([key, user]) => {
            if (user.role === 'diretor') {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${user.name} (Diretor ${areaNames[user.area]})`;
                recipientSelect.appendChild(option);
            }
        });
    }
    
    // Evento para abrir o modal
    newMessageBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    // Eventos para fechar o modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
    
    // Evento de envio do formulário
    document.getElementById('newMessageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipient = document.getElementById('recipient').value;
        const subject = document.getElementById('messageSubject').value;
        const content = document.getElementById('messageContent').value;
        
        const success = await sendNewMessage(recipient, subject, content);
        
        if (success) {
            alert('Mensagem enviada com sucesso!');
            modal.classList.remove('active');
            document.getElementById('newMessageForm').reset();
        } else {
            alert('Erro ao enviar mensagem. Por favor, tente novamente.');
        }
    });
}

// Funções auxiliares
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function getUserName(username) {
    const userKey = Object.keys(users).find(key => key.endsWith(username));
    return users[userKey]?.name || username;
}

function formatDate(dateString, full = false) {
    const date = new Date(dateString);
    
    if (full) {
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Ontem';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('messagesList')) {
        loadMessages();
        setupNewMessageModal();
    }
});
