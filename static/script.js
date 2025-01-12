let chatHistories = [];
let currentChatIndex = -1;

function loadChatHistories() {
  const storedHistories = localStorage.getItem("chatHistories");
  if (storedHistories) {
    chatHistories = JSON.parse(storedHistories);
    updateHistorySidebar();
  }
}

function saveChatHistories() {
  localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
  updateHistorySidebar();
}

function updateHistorySidebar() {
  const historyItems = document.getElementById("historyItems");
  historyItems.innerHTML = "";
  chatHistories.forEach((chat, index) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.innerHTML = `
            <div class="item-content">
                <h4>${chat.title}</h4>
            </div>
            <div class="item-actions">
                <button class="action-btn rename-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line"><path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg>
                </button>
                <button class="action-btn delete-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
            </div>
        `;
    historyItem.querySelector(".item-content").addEventListener("click", () => {
      displayChat(index);
    });
    historyItem.querySelector(".rename-btn").addEventListener("click", () => {
      renameChat(index);
    });
    historyItem.querySelector(".delete-btn").addEventListener("click", () => {
      deleteChat(index);
    });
    historyItems.appendChild(historyItem);
  });
}

function createNewChat() {
  currentChatIndex = chatHistories.length;
  chatHistories.push({
    title: `New Chat ${currentChatIndex + 1}`,
    messages: [],
  });
  saveChatHistories();
  displayChat(currentChatIndex);
}

function displayChat(index) {
  currentChatIndex = index;
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = "";
  document.getElementById("currentChatTitle").textContent =
    chatHistories[index].title;
  chatHistories[index].messages.forEach((message) => {
    appendMessage(message.content, message.sender);
  });
}

function renameChat(index) {
  const newTitle = prompt("Enter new chat title:", chatHistories[index].title);
  if (newTitle && newTitle.trim() !== "") {
    chatHistories[index].title = newTitle.trim();
    saveChatHistories();
    if (index === currentChatIndex) {
      document.getElementById("currentChatTitle").textContent = newTitle.trim();
    }
  }
}

function deleteChat(index) {
  if (confirm("Are you sure you want to delete this chat?")) {
    chatHistories.splice(index, 1);
    saveChatHistories();
    if (chatHistories.length === 0) {
      createNewChat();
    } else if (index === currentChatIndex) {
      displayChat(0);
    } else if (index < currentChatIndex) {
      currentChatIndex--;
    }
  }
}

async function sendMessage() {
  const userInput = document.getElementById("userInput").value;
  if (!userInput.trim()) return;

  appendMessage(userInput, "user");
  document.getElementById("userInput").value = "";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: userInput }),
    });
    const data = await response.json();
    appendMessage(data.response, "bot");

    // Update current chat history
    chatHistories[currentChatIndex].messages.push(
      { content: userInput, sender: "user" },
      { content: data.response, sender: "bot" }
    );
    saveChatHistories();
  } catch (error) {
    console.error("Error:", error);
    appendMessage("An error occurred. Please try again.", "bot");
  }
}

function appendMessage(message, sender) {
  const chatMessages = document.getElementById("chatMessages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", sender);
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById("newChatBtn").addEventListener("click", createNewChat);
document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Load chat histories when the page loads
loadChatHistories();
if (chatHistories.length === 0) {
  createNewChat();
} else {
  displayChat(0);
}
