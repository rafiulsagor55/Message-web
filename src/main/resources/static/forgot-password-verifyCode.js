
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
	const password=document.getElementById('password').value.trim();
	const email=localStorage.getItem('email');
	const userInfo={
			email:email,
			userName:"userName",
			password:password
		}
		
	try{
	const response = await fetch('/resetPassword', { method: 'POST',
		headers: {
		       "Content-Type": "application/json"
		        },
		body: JSON.stringify(userInfo)
	 
	 });
	 if(!response.ok){
		const error=await response.json();
		
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
		const text = await response.text(); 
		if (text === '1') {
		    console.log("Password reset Successfully.");
		    window.location.href = 'home.html';
		}
	}
  }
  catch(error){
	console.log("erreo" +error);
  }
		
}
