let messages = [];

async function sendMessage() {
  const inputField = document.getElementById("chat-input");
  const chatDisplay = document.getElementById("chat-display");
  const userMessage = inputField.value.trim();

  if (userMessage) {
    const userChat = document.createElement("div");
    userChat.className = "user-message";
    userChat.textContent = userMessage;
    chatDisplay.appendChild(userChat);
    inputField.value = "";

    // Add user message to messages array
    messages.push({ role: "user", content: userMessage });

    // Prepare payload for Ollama /api/chat endpoint
    const data = {
      model: "steamdj/llama3.1-cpu-only",
      messages: messages,
      stream: false
    };

    try {
      let response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      response = await response.json();
      console.log(response);

      // Ollama /api/chat returns the assistant message in response.message.content
      const botMessage = response.message?.content || response.error || "No response from model.";
      const botChat = document.createElement("div");
      botChat.className = "bot-message";
      botChat.textContent = botMessage;
      chatDisplay.appendChild(botChat);

      // Add bot message to messages array for context
      if (response.message) {
        messages.push(response.message);
      }

      // Scroll to bottom
      chatDisplay.scrollTop = chatDisplay.scrollHeight;
    } catch (err) {
      const botChat = document.createElement("div");
      botChat.className = "bot-message";
      botChat.textContent = "Error: " + err;
      chatDisplay.appendChild(botChat);
    }
  }
}
