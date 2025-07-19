const form = document.getElementById("registrationForm");
form.addEventListener("submit", sendCode);


async function sendCode(event){
	event.preventDefault();
	
	const email = document.getElementById("email").value.trim();
	localStorage.setItem('email',email);
	const formData = new FormData();
	formData.append("email",email)
	const response1 = await fetch('/verifyEmail', { method: 'POST', body: formData });
	const text1=await response1.text();
	if(text1==='0'){
		window.location.href = 'forgot-password-verifyCode.html';
		await fetch('/sendCodeForResetPassword', { method: 'POST', body: formData });
		
	}
	else{
		showNotification(`The email '${email}' is not registered! Please provide a valid email.`,'error');
	}	
}
	
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
    }, 5000);
}	
	
		
	