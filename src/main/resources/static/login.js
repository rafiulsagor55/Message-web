
const LoginForm = document.getElementById("container3");
LoginForm.addEventListener("submit", LoginUser);

async function LoginUser(event){
	event.preventDefault();
	//window.location.href='home.html';
	const email=document.getElementById('email').value.trim();
	const password=document.getElementById('password').value;
	const formData=new FormData();
	formData.append('email',email);
	formData.append('password',password);
	const response = await fetch('/verifyLogin', { method: 'POST', body: formData });
	const text=await response.text();
	if(response.ok){
		if(text==='1'){
			localStorage.setItem('email',email);
			window.location.href='home.html';
			document.getElementById('email').value='';
			document.getElementById('password').value='';
			
		}
		else if(text==='0'){
			document.querySelector('.error-message').innerHTML=`Email or Password is incorrect!`;
		}
	}
	
}