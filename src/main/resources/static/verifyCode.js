
// Start container
const container=document.getElementById("container");
container.addEventListener("submit",verifyCode);

async function verifyCode(event){
	event.preventDefault();
	const email=localStorage.getItem('email');
	console.log(localStorage.getItem('email'));
	const code=document.getElementById("code").value;
	const formData = new FormData();	
	formData.append("email",email);
	formData.append("code",code);
	const response = await fetch('/verifyCode', { method: 'POST', body: formData });
	const text=await response.text();
	if(!response.ok){
		console.log("error");
	}
	if(text === "Invalid Code!"){
		document.getElementById("code").value='';
		const codeInput = document.getElementById("code");
		codeInput.placeholder = "Invalid Code!";
		const style = document.createElement("style");
		style.innerHTML = `
		  #code::placeholder {
		    color: red; 
		  }
		`;
		document.head.appendChild(style);			
	}
	else{
		document.getElementById("code").value='';
		document.getElementById("container").style.display='none';
		document.getElementById("container1").style.display='flex';
	}	
}

// Start container1
const container1=document.getElementById("container1");
container1.addEventListener("submit",saveInfo);

async function saveInfo(event){
	event.preventDefault();
	const userName=document.getElementById('userName').value.trim();
	const password=document.getElementById('password').value.trim();
	const email=localStorage.getItem('email');
	localStorage.setItem("userName",userName);
	const userInfo={
			email:email,
			userName:userName,
			password:password
		}
		
	try{
	const response = await fetch('/saveUserInfo', { method: 'POST',
		headers: {
		       "Content-Type": "application/json"
		        },
		body: JSON.stringify(userInfo)
	 
	 });
	 if(!response.ok){
		const error=await response.json();
		if(error.userName){
			document.getElementById("userName").value='';
					const codeInput = document.getElementById("userName");
					codeInput.placeholder = `${error.userName}`;
					const style = document.createElement("style");
					style.innerHTML = `
					  #userName::placeholder {
					    color: red; 
					  }
					`;
					document.head.appendChild(style);
			
		}
		
		if(error.password){
			document.getElementById("password").value='';
					const codeInput = document.getElementById("password");
					codeInput.placeholder = `${error.password}`;
					const style = document.createElement("style");
					style.innerHTML = `
					  #password::placeholder {
					    color: red; 
					  }
					`;
					document.head.appendChild(style);
			
		}		
	 }
	else{
		const text = await response.text(); // Store the response text in a variable
		if (text === '1') {
		    console.log("UserInfo saved Successfully.");
		    window.location.href = 'home.html';
		} else if (text === '2') {
			showAlert();
		    console.log("User already Exists!");
		    
		}
	}
  }
  catch(error){
	console.log("erreo" +error);
  }
		
}

   function showAlert() {
        const alertBox = document.getElementById("customAlert");
        alertBox.style.display = "flex";
    }
	
	function closeAlert() {
        const alertBox = document.getElementById("customAlert");
        alertBox.style.display = "none";
		window.location.href = 'login.html';
    }




