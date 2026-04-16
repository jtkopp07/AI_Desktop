const messageInput = document.getElementById("messageInput");
const modelSelect = document.getElementById("modelSelect");
const messagesContainer = document.getElementById("messages");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearButton");
const statusText = document.getElementById("statusText");
const modeInfo = document.getElementById("modeInfo");
const tabGeneral = document.getElementById("tabGeneral");
const tabBranch = document.getElementById("tabBranch");
const tabITSupport = document.getElementById("tabITSupport");
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const clearUploadButton = document.getElementById("clearUploadButton");
const uploadedFilesContainer = document.getElementById("uploadedFiles");

let selectedMode = "general";

function updateMode(mode) {
    selectedMode = mode;

    if (mode === "branch") {
        tabBranch.classList.add("active");
        tabBranch.setAttribute("aria-selected", "true");
        tabGeneral.classList.remove("active");
        tabGeneral.setAttribute("aria-selected", "false");
        tabITSupport.classList.remove("active");
        tabITSupport.setAttribute("aria-selected", "false");
        modeInfo.textContent = "Branch Data mode: the AI will leverage branch database context when answering.";
    } else if (mode === "itsupport") {
        tabITSupport.classList.add("active");
        tabITSupport.setAttribute("aria-selected", "true");
        tabGeneral.classList.remove("active");
        tabGeneral.setAttribute("aria-selected", "false");
        tabBranch.setAttribute("aria-selected", "false");
        modeInfo.textContent = "IT Support mode: the AI will search the IT help desk database for relevant solutions.";
    } else {
        tabGeneral.classList.add("active");
        tabGeneral.setAttribute("aria-selected", "true");
        tabBranch.classList.remove("active");
        tabBranch.setAttribute("aria-selected", "false");
        tabITSupport.classList.remove("active");
        tabITSupport.setAttribute("aria-selected", "false");
        modeInfo.textContent = "General AI mode: the AI answers from a broad knowledge base without company-specific context.";
    }
}

function appendMessage(role, text) {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${role}`;

    const label = document.createElement("strong");
    label.textContent = role === "user" ? "You" : "AI";

    const content = document.createElement("p");
    content.textContent = text;

    messageEl.append(label, content);
    messagesContainer.append(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setLoading(isLoading) {
    sendButton.disabled = isLoading;
    messageInput.disabled = isLoading;
    if (modelSelect) modelSelect.disabled = isLoading;
    if (tabGeneral) tabGeneral.disabled = isLoading;
    if (tabBranch) tabBranch.disabled = isLoading;
    if (tabITSupport) tabITSupport.disabled = isLoading;
    if (fileInput) fileInput.disabled = isLoading;
    if (uploadButton) uploadButton.disabled = isLoading;
    if (clearUploadButton) clearUploadButton.disabled = isLoading;
    statusText.textContent = isLoading ? "Thinking..." : "Ready to chat.";
}

function displayUploadedFiles(fileNames) {
    if (!uploadedFilesContainer) {
        return;
    }

    if (!fileNames || fileNames.length === 0) {
        uploadedFilesContainer.innerHTML = '<p>No uploaded files.</p>';
        return;
    }

    uploadedFilesContainer.innerHTML = `
        <p><strong>Uploaded files:</strong></p>
        <ul>${fileNames.map(name => `<li>${name}</li>`).join('')}</ul>
    `;
}

async function uploadFile() {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        statusText.textContent = "Select a zip file to upload.";
        return;
    }

    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith('.zip')) {
        statusText.textContent = "Please upload a .zip archive.";
        return;
    }

    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || 'Upload failed.');
        }

        displayUploadedFiles(data.files || []);
        statusText.textContent = data.files && data.files.length > 0
            ? `Loaded ${data.files.length} files from the archive.`
            : 'Upload completed, but no files were loaded.';
    } catch (error) {
        statusText.textContent = error.message || 'Unable to upload the file.';
        console.error(error);
    } finally {
        setLoading(false);
    }
}

async function clearUploadedFiles() {
    setLoading(true);

    try {
        const response = await fetch('/uploads/clear', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Unable to clear uploaded files.');
        }

        displayUploadedFiles([]);
        statusText.textContent = 'Uploaded files cleared.';
    } catch (error) {
        statusText.textContent = error.message || 'Unable to clear files.';
        console.error(error);
    } finally {
        setLoading(false);
    }
}

async function sendMessage() {
    const text = messageInput.value.trim();
    const model = modelSelect?.value || "gpt-3.5-turbo";

    if (!text) {
        statusText.textContent = "Enter a prompt before sending.";
        return;
    }

    appendMessage("user", text);
    messageInput.value = "";
    setLoading(true);

    try {
        const response = await fetch("/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: text, model, mode: selectedMode, includeUploadedFiles: true })
        });

        const data = await response.json();
        const reply = data?.response || "No response from the server.";
        appendMessage("ai", reply);
        statusText.textContent = response.ok ? "AI replied successfully." : "Server returned an error.";
    } catch (error) {
        appendMessage("ai", "There was a network error while contacting the AI service.");
        statusText.textContent = "Unable to reach the server.";
        console.error(error);
    } finally {
        setLoading(false);
    }
}

function clearChat() {
    messagesContainer.innerHTML = "";
    statusText.textContent = "Conversation cleared.";
}

tabGeneral.addEventListener("click", () => updateMode("general"));
tabBranch.addEventListener("click", () => updateMode("branch"));
tabITSupport.addEventListener("click", () => updateMode("itsupport"));
sendButton.addEventListener("click", sendMessage);
clearButton.addEventListener("click", clearChat);
if (uploadButton) uploadButton.addEventListener("click", uploadFile);
if (clearUploadButton) clearUploadButton.addEventListener("click", clearUploadedFiles);
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

updateMode("general");
displayUploadedFiles([]);
statusText.textContent = "Ready to chat.";
