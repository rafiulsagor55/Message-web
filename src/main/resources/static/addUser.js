let stompClient = null;
const email = localStorage.getItem('email');
function connect() {
	const socket = new SockJS('/ws');
	stompClient = Stomp.over(socket);

	stompClient.connect({}, function () {
		console.log('Connected as: ' + email);

		stompClient.subscribe('/user/' + email + '/private', function (message) {
			showMessage(JSON.parse(message.body));
		});

		stompClient.subscribe('/user/' + email + '/addFriendPage', function (response) {
			showResponse(response.body);
		});
		stompClient.subscribe('/user/' + email + '/addFriendPage1', function (response) {
			showResponse1(response.body);
		});


	});
}

function showResponse(message) {
	showAlert(message);
	console.log(message);
	console.log("showResponse");
}
function showResponse1(message) {
	console.log(message);
	const notification = `You are connected with ${message}! Now you can chat with each other.`;
	//window.location.href='home.html';
	showNotification(notification);
}

const addFriends = document.getElementById('container');
addFriends.addEventListener('submit', addUsers);

function addUsers(event) {
	event.preventDefault();
	const friendEmail = document.getElementById('friendEmail').value.trim();
	const email = localStorage.getItem('email');

	if (email && friendEmail && stompClient) {
		const userlist = {
			friendEmail: friendEmail,
			userEmail: email,

		};

		if (friendEmail === email) {
			showAlert(`${friendEmail} is your Email!`);
		}

		else if (email && friendEmail) {
			stompClient.send('/app/addFriend', {}, JSON.stringify(userlist));
		}
		else {
			alert("somthing is wrong");
		}

		document.getElementById('friendEmail').value = '';
	}

}

window.addEventListener("load", loadAndDisplayUsers);

function loadAndDisplayUsers() {
	const email = localStorage.getItem('email');
	if (!email) {
		window.location.href = 'index.html';
	}
	else {
		connect();
	}
}

function showAlert(message) {
	const alertBox = document.getElementById("customAlert");
	document.getElementById('alertMessage').innerHTML = message;
	alertBox.style.display = "flex";
}

function closeAlert() {
	const alertBox = document.getElementById("customAlert");
	alertBox.style.display = "none";
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

const back=document.getElementById('back-icon1');
back.addEventListener('click',Back);
function Back(){
	window.location.href='home.html';
}

