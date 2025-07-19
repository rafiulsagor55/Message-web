const form = document.getElementById("registrationForm");
form.addEventListener("submit", sendCode);


async function sendCode(event){
	event.preventDefault();
	
	const email = document.getElementById("email").value.trim();
	// export const message = "sagor";
	localStorage.setItem('email',email);
	const formData = new FormData();
	formData.append("email",email)
	const response1 = await fetch('/verifyEmail', { method: 'POST', body: formData });
	const text1=await response1.text();
	if(text1==='1'){
		window.location.href = 'verifyCode.html'
	}	
	const response = await fetch('/sendCode', { method: 'POST', body: formData });
	const text=await response.text();
	if(!response.ok){
		console.log("error");
	}
	if(response.ok  && text==='1'){
			
		}
	else if(response.ok  && text==='0'){
		showAlert();
	}
	console.log(text);	
}

function showAlert() {
        const alertBox = document.getElementById("customAlert");
        alertBox.style.display = "flex";
    }
	
	function closeAlert() {
        const alertBox = document.getElementById("customAlert");
        alertBox.style.display = "none";
		window.location.href = 'login.html'
    }
	
	
	
	

	
	
	
	
