class GitHubService {
    static async loadDatabase() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/GlobalFocusAfs/GlobalFocus/main/data/database.json`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }
            
            const data = await response.json();
            return this.initializeDatabase(data);
        } catch (error) {
            console.error("Erro ao carregar database:", error);
            return this.initializeDatabase({});
        }
    }

    static initializeDatabase(existingData) {
        // Cria estrutura inicial se não existir
        if (!existingData.users) {
            existingData.users = this.createDefaultUsers();
        }
        if (!existingData.messages) {
            existingData.messages = {};
            ['Financeiro', 'Marketing', 'Recursos Humanos', 'Novos Negócios', 'Administrativo', 'Logística'].forEach(area => {
                existingData.messages[area] = [];
            });
        }
        return existingData;
    }

    static async saveMessage(message) {
        // Em um sistema real, isso seria uma chamada para um backend seguro
        // Aqui estamos simulando com localStorage para demonstração
        const db = await this.loadDatabase();
        db.messages[message.area].push(message);
        localStorage.setItem('globalfocus_db', JSON.stringify(db));
        return true;
    }

    static async getMessagesByArea(area) {
        const db = await this.loadDatabase();
        return db.messages[area] || [];
    }

    static createDefaultUsers() {
        return {
            // Financeiro
            'financeiro_diretor': { password: 'fin123', name: 'Diretor Financeiro', role: 'diretor', area: 'Financeiro' },
            'financeiro_consultor1': { password: 'fin1', name: 'Consultor 1 Financeiro', role: 'consultor', area: 'Financeiro' },
            // ... (todos os outros usuários)
        };
    }
}
