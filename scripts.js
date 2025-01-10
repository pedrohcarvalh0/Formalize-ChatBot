// Mudar a API_URL para link da API final

const API_URL = 'http://localhost:8000/chatbot/v1/';

function toggleChat() {
    const chatContainer = document.getElementById('chat-container');
    const chatButton = document.querySelector('.chat-button');
    if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
        chatContainer.style.display = 'flex';
        chatButton.style.display = 'none';
        initializeChat();
    } else {
        chatContainer.style.display = 'none';
        chatButton.style.display = 'block';
    }
}

function initializeChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao conectar com o servidor.');
            }
            return response.json();
        })
        .then(data => {
            addMessage(data.answer, 'bot', data.questions);
        })
        .catch(error => {
            console.error('Erro ao iniciar o chat:', error);
            addMessage('Erro ao se comunicar com o servidor.', 'bot');
        });
}

function addMessage(content, sender, questions = []) {
    const chatBox = document.getElementById('chat-box');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);

    let formattedMessage = content.replace(/\n/g, '<br>');
    formattedMessage = formattedMessage.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    messageDiv.innerHTML = formattedMessage;

    messageContainer.appendChild(messageDiv);

    if (questions.length > 0) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');

        questions.forEach((question, index) => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = question.body;

            // Quando clicado, envia a opção numérica correspondente
            button.onclick = () => {
                const numericOption = (index + 1).toString(); // Opção numérica (1, 2, 3, ...)
                sendMessage(numericOption); // Envia a opção numérica como mensagem
            };

            optionsContainer.appendChild(button);
        });

        messageContainer.appendChild(optionsContainer);
    }
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage(userInput) {
    if (!userInput.trim()) return;

    addMessage(userInput, 'user');

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensagem: userInput }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao processar a resposta.');
            }
            return response.json();
        })
        .then(data => {
            addMessage(data.answer, 'bot', data.questions);
        })
        .catch(error => {
            console.error('Erro ao enviar mensagem:', error);
            addMessage('Erro ao se comunicar com o servidor.', 'bot');
        });
}

document.getElementById('user-message').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const userInput = document.getElementById('user-message').value;
        sendMessage(userInput);
        document.getElementById('user-message').value = '';
    }
});