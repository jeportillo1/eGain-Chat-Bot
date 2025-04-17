// Select the key DOM elements
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('chat-send');

// Variables to track the chatbot state
let step = 0;
let userResponses = {};
let chatStarted = false;

// Validation functions
const allowedUseCases = ['school', 'gaming', 'work', 'editing'];
const isValidBudget = (value) => {
    return /^\d+$/.test(value.trim()) || /^\$\d+\s*–\s*\$\d+$/.test(value.trim());
};
  
// Step array for step management
const steps = [
    {
        type: 'options',
        key: 'os',
        message: "🖥️ First things first – do you prefer Windows, Apple (Mac), or either?",
        options: ['Windows 🪟', 'Apple (Mac) 🍎', 'No preference']
    },
    {
        type: 'input',
        key: 'useCase',
        message: "Awesome! Enter below what do you plan to use your laptop for? (Examples: school, gaming, work, editing)"
    },
    {
        type: 'input',
        key: 'budgetMax',
        message: "💰 Enter below what’s your max budget? (Type a number)"
    },
    {
        type: 'options',
        key: 'performance',
        message: "⚖️ What’s more important to you – portability or performance?",
        options: ['Portability 💼', 'Performance ⚡', 'Both are important']
    },
    {
        type: 'text',
        message: "🎉 Thanks! Based on your answers, I’ll suggest a few options shortly..."
    },
    {
        type: 'custom'
    }
];

// Laptop List
const laptopSuggestions = {
    windows: [
        { name: "Dell XPS 13", use: ["school", "work", "editing"] },
        { name: "ASUS ROG Strix", use: ["gaming"] },
        { name: "HP Spectre x360", use: ["school", "work"] }
    ],
    mac: [
        { name: "MacBook Air", use: ["school", "work"] },
        { name: "MacBook Pro", use: ["editing", "work","gaming"] }
    ]
};

// Adding message to chat
function appendMessage(content, sender = 'bot') {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerHTML = content;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Suggestion function for outputting the specific suggestion
function showSuggestions() {
    let os = userResponses.os?.toLowerCase() || '';
    if (os.includes("windows")) os = "windows";
    else if (os.includes("apple")) os = "mac";
    else os = "both";
  
    const use = userResponses.useCase?.toLowerCase() || '';
  
    let results = [];
    if (os === "both") {
        results = [...laptopSuggestions.windows, ...laptopSuggestions.mac];
    } else {
        results = [...(laptopSuggestions[os] || [])];
    }
  
    const filtered = results.filter(laptop =>
        laptop.use?.some(u => use.includes(u))
    );

    console.log(filtered);
  
    if (filtered.length > 0) {
        appendMessage("Here are some laptops you might like:");
        filtered.forEach(l => {
            if (l.name) {
                appendMessage(`💻 <strong>${l.name}</strong>`, 'bot');
            }
        });
    } else {
        appendMessage("Hmm, I couldn't find a perfect match, but feel free to browse our full selection!", 'bot');
    }
}  
  
// Display the current step and handle UI input
function showStep() {
    const current = steps[step];
    if (!current) return;
  
    // Only show message if it exists
    if (current.message) {
        appendMessage(current.message);
    }
  
    if (current.type === 'options') {
        current.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-button';
            btn.innerText = option;
            btn.onclick = () => {
                userResponses[current.key] = option;
                appendMessage(option, 'user');
                step++;
                clearInput();
                setTimeout(showStep, 500);
            };
            chatWindow.appendChild(btn);
        });
        sendButton.disabled = true;
    }
  
    if (current.type === 'input') {
        sendButton.disabled = false;
        chatInput.oninput = () => {
            sendButton.disabled = !chatInput.value.trim();
        };
    }
  
    if (current.type === 'text') {
        sendButton.disabled = true;
        step++;
        setTimeout(showStep, 1000);
    }
  
    if (current.type === 'custom') {
        sendButton.disabled = true;
        setTimeout(showSuggestions, 400);
    }
  }
  
// Function to clear input
function clearInput() {
    chatInput.value = '';
    chatInput.oninput = null;
    chatWindow.scrollTop = chatWindow.scrollHeight;
    sendButton.disabled = true;
}

// Show the initial prompt before the chat begins
function startPrompt() {
    appendMessage("Hi, I'm Nova 💻 from Portillo's Electronics! Ready to find the perfect laptop for you?", 'bot');

    const yesBtn = document.createElement('button');
    yesBtn.className = 'option-button';
    yesBtn.innerText = 'Yes, let’s go!';
    yesBtn.onclick = () => {
        chatStarted = true;
        appendMessage("Yes, let’s go!", 'user');
        setTimeout(showStep, 500);
        chatForm.style.display = 'flex';
        yesBtn.remove();
        noBtn.remove();
    };

    const noBtn = document.createElement('button');
    noBtn.className = 'option-button';
    noBtn.innerText = 'No thanks';
    noBtn.onclick = () => {
        appendMessage("No problem! Come back anytime when you're ready. 😊", 'bot');
        yesBtn.remove();
        noBtn.remove();
    };

    chatWindow.appendChild(yesBtn);
    chatWindow.appendChild(noBtn);
}

// Handle form submission when pressing enter or clicking send
chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = chatInput.value.trim();
    if (!input) return;
  
    const current = steps[step];
    if (current && current.type === 'input') {
        // Validate use case input
        if (current.key === 'useCase') {
            const isValidUse = allowedUseCases.some(use =>
                input.toLowerCase().includes(use)
            );
            if (!isValidUse) {
                appendMessage("⚠️ Please enter one of the following uses: school, gaming, work, or editing.");
                return;
            }
        }
        
        // Validate budget input
        if (current.key === 'budgetMax') {
            if (!isValidBudget(input)) {
            appendMessage("⚠️ Please enter a valid number (e.g., 800).");
            return;
            }
        }
  
        appendMessage(input, 'user');
        userResponses[current.key] = input;
        step++;
        clearInput();
        setTimeout(showStep, 500);
    }
});  

// Start chat when the page loads
window.onload = () => {
    chatForm.style.display = 'none';
    sendButton.disabled = true;
    startPrompt();
};