window.addEventListener("load", loadAndDisplayUsers);

async function loadAndDisplayUsers() {
	const email = localStorage.getItem('email');
	if (!email) {
		window.location.href = 'index.html';
	}
	else {
		document.getElementById('prepass').value = '';
		//document.getElementById('profile-pic').src =`/viewProfilePicture?email=${email}`;
		const response = await fetch(`/viewProfilePicture?email=${email}`);
		if (response.status === 404) {
			console.log("Image does not exist.");
			document.getElementById("profile-pic").style.display = "none";
		}
		else if (response.ok) {
			const blob = await response.blob();
			const imageUrl = URL.createObjectURL(blob);
			document.getElementById("profile-pic").src = imageUrl;
			document.getElementById("profile-pic").style.display = "block";
			document.getElementById("profile-icon").style.display = "none";

		}
		const response2 = await fetch(`/viewUserInfo?email=${email}`);
		const details = await response2.json();
		console.log();
		document.getElementById('email').value = details.email;
		document.getElementById('name').value = `${details.userName}`;

	}

}


document.getElementById('profile-picture-input').addEventListener('click', function () {
	document.getElementById('upload-pic').click();
});

let file;
document.getElementById('upload-pic').addEventListener('change', function (event) {
	file = event.target.files[0];
	if (file && file.type.startsWith('image/')) {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function (e) {
			const profileIcon = document.getElementById('profile-icon');
			const profilePic = document.getElementById('profile-pic');
			profileIcon.style.display = 'none';
			profilePic.style.display = 'flex';
			document.getElementById('profile-pic').src = e.target.result;
		};
	}
	else {
		showAlert();
	}
});

function showAlert() {
	const alertBox = document.getElementById("customAlert");
	alertBox.style.display = "flex";
}

function closeAlert() {
	const alertBox = document.getElementById("customAlert");
	alertBox.style.display = "none";
}

const updateProfilePic = document.getElementById('update-profile-pic');
updateProfilePic.addEventListener('click', updatePicture);

async function updatePicture(event) {
	event.preventDefault();
	const email = localStorage.getItem('email');
	const formData = new FormData();
	formData.append('file', file);
	formData.append('email', email);
	const response = await fetch('/updatePicture', { method: 'POST', body: formData });
	const text = await response.text();
	if (response.ok) {
		showNotification("Profile picture Updated successfully.");
	}
	console.log(text);
}

function showNotification(message, type = 'success') {
	const container = document.getElementById('notification-container');

	// Create notification element
	const notification = document.createElement('div');
	notification.className = `notification ${type}`;
	notification.innerText = message;

	// Append to the container
	container.appendChild(notification);

	// Show the notification
	setTimeout(() => {
		notification.classList.add('show');
	}, 10);

	// Remove the notification after 7 seconds
	setTimeout(() => {
		notification.classList.remove('show');
		setTimeout(() => {
			notification.remove();
		}, 300);
	}, 7000);
}

const UpdateName = document.getElementById('nameButton');
UpdateName.addEventListener('click', nameUpdateFunction);

async function nameUpdateFunction(event) {
	event.preventDefault();
	const email = localStorage.getItem('email');
	const name = document.getElementById('name').value.trim();
	const formData = new FormData();
	formData.append('email', email);
	formData.append('userName', name);
	const response = await fetch('/updateUserName', { method: 'POST', body: formData });
	if (response.status === 400) {
		showNotification("Name must be between 2 and 30 characters!", 'error');
	}
	else {
		showNotification("Name Updated Successfully.");
	}
	result = await response.text();
	console.log(result);

}

const UpdatePassword = document.getElementById('passwordButton');
UpdatePassword.addEventListener('click', UpdatePasswordFunction);

async function UpdatePasswordFunction(event) {
	event.preventDefault();
	const email = localStorage.getItem('email');
	const prePass = document.getElementById('prepass').value;
	const postPass = document.getElementById('postpass').value;
	const formData = new FormData();
	formData.append('email', email);
	formData.append('prePass', prePass);
	formData.append('postPass', postPass);
	const response = await fetch('/updatePassword', { method: 'POST', body: formData });
	if (response.status === 400) {
		showNotification("Password must be at least 4 characters!", 'error');
	}
	else {
		result = await response.text();
		if (result === "Invalid previous Password!") {
			showNotification(result, 'error');
		}
		else {
			showNotification(result);
		}

	}

}

const back=document.getElementById('back-icon1');
back.addEventListener('click',Back);
function Back(){
	window.location.href='home.html';
}









