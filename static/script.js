document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');
    const sendButton = document.getElementById('send-button');

    // This array will store the entire conversation history
    let conversationHistory = [];

    // Function to add a message to the chat window UI
    const addMessageToUI = (sender, message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerText = message;
        chatWindow.appendChild(messageElement);
        // Scroll to the bottom
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    // Function to handle sending a message
    const sendMessage = async (message) => {
        if (!message.trim()) return;

        // Display user message in UI
        addMessageToUI('user', message);
        
        // Add user message to history
        conversationHistory.push({ role: 'user', content: message });
        
        // Clear input and disable form while waiting for response
        messageInput.value = '';
        messageInput.disabled = true;
        sendButton.disabled = true;

        try {
            // Send the entire history to the backend
            const response = await fetch('http://127.0.0.1:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ history: conversationHistory }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'The server returned an error.');
            }

            const data = await response.json();
            const botMessage = data.response;

            // Display bot message in UI
            addMessageToUI('bot', botMessage);

            // Add bot message to history
            conversationHistory.push({ role: 'assistant', content: botMessage });

        } catch (error) {
            console.error('Error:', error);
            addMessageToUI('bot', `Sorry, something went wrong. ${error.message}`);
        } finally {
            // Re-enable form
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    };
    
    // Initial message from the bot
    const startConversation = async () => {
        // We send an empty history to get the initial greeting
        await sendMessage(""); 
        // We remove the empty user message that was added
        conversationHistory.shift(); 
        chatWindow.querySelector('.user-message').remove();
    };

    // Handle form submission
    chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        sendMessage(messageInput.value);
    });
    
    // Start the conversation when the page loads
    startConversation();
});