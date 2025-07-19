// Display notifications
function showNotification(message, type = "info") {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);
    setTimeout(() => {
        notification.classList.add("show");
    }, 100);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => container.removeChild(notification), 300);
    }, 3000);
}

// Send Text
async function sendText() {
    const text = document.getElementById("textInput").value.trim();
    if (!text) {
        showNotification("Text cannot be empty.", "error");
        return;
    }

    try {
        const response = await fetch("/api/clipboard/send-text", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: text,
        });
        document.getElementById("textInput").value = "";

        if (!response.ok) throw new Error("Failed to send text.");

        const code = await response.text(); // Ensure raw text is used
        document.getElementById("textCode").textContent = `Retrieve code: ${code}`;
        showNotification("Text sent successfully.", "success");

    } catch (error) {
        showNotification(error.message, "error");
    }
}

// Retrieve Text
async function retrieveText() {
    const code = document.getElementById("retrieveTextCode").value.trim();
    if (!code) {
        showNotification("Code cannot be empty.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/clipboard/retrieve-text/${code}`);

        if (!response.ok) throw new Error("Text not found.");

        const text = await response.text(); // Ensure raw text is used
        document.getElementById("retrievedText").textContent = text;
        showNotification("Text retrieved successfully.", "success");
    } catch (error) {
        showNotification(error.message, "error");
    }
}

// Copy Text to Clipboard
/*function copyText() {
    const text = document.getElementById("retrievedText").textContent.trim();
    if (!text) {
        showNotification("No text to copy.", "error");
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showNotification("Text copied to clipboard.", "success");
    }).catch(() => {
        showNotification("Failed to copy text.", "error");
    });
}*/


function copyText() {
    const textElement = document.getElementById("retrievedText");
    const text = textElement.textContent.trim(); // Get the text content and trim extra spaces

    if (!text) {
        showNotification("No text to copy.", "error");
        return;
    }

    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showNotification("Text copied to clipboard.", "success");
            })
            .catch((err) => {
                console.error("Clipboard error:", err);
                showNotification("Failed to copy text.", "error");
            });
    } else {
        // Fallback for older browsers
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = text;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        try {
            document.execCommand("copy");
            showNotification("Text copied to clipboard.", "success");
        } catch (err) {
            console.error("ExecCommand error:", err);
            showNotification("Failed to copy text.", "error");
        } finally {
            document.body.removeChild(tempTextarea);
        }
    }
}

async function sendFile() {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        showNotification("Please select a file.", "error");
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput);

    try {
        const response = await fetch(`/sendFileClipBoard`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to send file!");

        const code = await response.text();
        document.getElementById("fileCode").textContent = `Retrieve code: ${code}`;
        showNotification("File sent successfully.", "success");
    } catch (error) {
        showNotification(error.message, "error");
    }
}


async function retrieveFile() {
    const code = document.getElementById("retrieveFileCode").value.trim();
    if (!code) {
        showNotification("Code cannot be empty.", "error");
        return;
    }

    try {
        const response = await fetch(`/retrieveFileName/${code}`);
        if (!response.ok) throw new Error("File not found!");
        const text = await response.text(); // Ensure raw text is used
        const downloadLink = document.createElement('a');
        downloadLink.href = `/downloadClipBoardFile/${code}`;
        downloadLink.textContent = ` Download (${text})`;
        document.getElementById("retrievedFile").appendChild(downloadLink);
        showNotification("File retrieved successfully.", "success");
    } catch (error) {
        showNotification(error.message, "error");
    }


}

