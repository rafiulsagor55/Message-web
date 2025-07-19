let stompClient = null;
const email = localStorage.getItem('email');
function connect() {
	const socket = new SockJS('/ws');
	stompClient = Stomp.over(socket);

	stompClient.connect({}, function () {
		console.log('Connected as: ' + email);

		stompClient.subscribe('/user/' + email + '/receivedFile', function (message) {
			showFile(JSON.parse(message.body));
		});

		stompClient.subscribe('/user/' + email + '/addFriend', function (response) {
			showUser(JSON.parse(response.body));
		});
		stompClient.subscribe('/user/' + email + '/receivedMessage', function (response) {
			showMessage(JSON.parse(response.body));
		});
		stompClient.subscribe('/user/' + email + '/deletedMessage', function (response) {
			deleteFileById(JSON.parse(response.body));
		});
		stompClient.subscribe('/user/' + email + '/editedMessage', function (response) {
			editMessageById(JSON.parse(response.body));
		});
	});
}
let chatBody = document.getElementById('chatBody');


async function showUser(userDetails) {
	console.log("showUser");
	const friendName = userDetails.userName;
	const friendId = userDetails.id;
	const friendEmail = userDetails.email;
	const imageData = userDetails.imageData;
	const contentType = userDetails.contentType;

	let imageUrl = null;
	if (contentType !== null || contentType !== 'null') {
		const byteCharacters = atob(imageData);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const blob = new Blob([byteArray], { type: contentType });
		imageUrl = URL.createObjectURL(blob);
	}

	// Create a new chat item
	const chatList = document.querySelector('.chat-list');
	const chatItem = document.createElement('li');
	chatItem.classList.add('chat-item');

	chatItem.dataset.friendId = friendId;
	chatItem.dataset.friendName = friendName;
	chatItem.dataset.friendEmail = friendEmail;
	chatItem.dataset.imageUrl = imageUrl;


	// Add user image
	if(imageUrl!==null){
		const img = document.createElement('img');
		img.src = imageUrl;
		img.alt = friendName;
		chatItem.appendChild(img);
	}
	else{
		const img = document.createElement('img');
			img.src = './circle-user-regular.svg';
			img.alt = friendName;
			chatItem.appendChild(img);
	}
	

	// Add user name
	const nameSpan = document.createElement('span');
	nameSpan.classList.add('name');
	nameSpan.textContent = friendName;
	chatItem.appendChild(nameSpan);

	// Insert the new user at the beginning of the chat list
	chatList.insertBefore(chatItem, chatList.firstChild);

	if (email !== friendEmail) {
		const notification = `You are connected with ${friendName}! Now you can chat with each other.`;
		showNotification(notification);
	}
}



const settingsMenu = document.querySelector('.setting-icon');
settingsMenu.addEventListener('click', () => {
	const menu = document.querySelector('.settings-menu .menu');

	menu.style.display = 'block';

	const handleOutsideClick = (e) => {
		if (e.target !== settingsMenu) {
			menu.style.display = 'none';
			document.removeEventListener('click', handleOutsideClick);
		}
	};
	document.addEventListener('click', handleOutsideClick);
});

const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('messageInput');


messageInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		sendButton.click();
	}
});



sendButton.addEventListener('click', () => {
	const friendEmail = sessionStorage.getItem('friendEmail');
	const messageText = messageInput.value.trim();
	if (messageText && email && friendEmail && stompClient) {

		const message = {
			senderEmail: email,
			receiverEmail: friendEmail,
			message: messageText

		};
		stompClient.send('/app/sendMessage', {}, JSON.stringify(message));
		messageInput.value = '';
	}
	else {
		showNotification("Message not sent! Something is wrong!", 'error');
	}
});




//logout
const logout = document.getElementById('logout');
logout.addEventListener('click', logoutFunc);
function logoutFunc(event) {
	event.preventDefault();
	localStorage.removeItem('email');
	window.location.href = 'index.html';
}


// load home
window.addEventListener("load", loadAndDisplayUsers);
async function loadAndDisplayUsers() {
	const email = localStorage.getItem('email');
	if (!email) {
		window.location.href = 'index.html';
	}
	else {
		connect();

		console.log("friendEmail: " + sessionStorage.getItem('friendEmail'));
		const response = await fetch(`/viewConnectedUser?userEmail=${email}`);
		let userList;
		if(response.ok){
			userList = await response.json();
			for (const user of userList) {
						let response1;
						if (email !== user.friendEmail) {
							response1 = await fetch(`/friendsInfo?email=${user.friendEmail}`);
						}
						else if (email === user.friendEmail) {
							response1 = await fetch(`/friendsInfo?email=${user.userEmail}`);
						}
						const userDetails = await response1.json();
						showchatList(userDetails);
					}
		}
		
		const response1 = await fetch(`/viewProfilePicture?email=${email}`);
		let imageUrl = null;
		if (response1.ok) {
			const blob = await response1.blob();
			imageUrl = URL.createObjectURL(blob);
		}
		sessionStorage.setItem('imageUrl', imageUrl);
	}
}

const profile = document.getElementById('profile');
profile.addEventListener('click', showProfile);

function showProfile(event) {
	event.preventDefault();
	window.location.href = 'profile.html';
}

const goAddUserPage = document.getElementById('icon');
goAddUserPage.addEventListener('click', addUserPage);
function addUserPage() {
	window.location.href = 'addUser.html';
}


function showNotification(message, type = 'success') {
	const container = document.getElementById('notification-container');
	const notification = document.createElement('div');
	notification.className = `notification ${type}`;
	notification.innerText = message;
	container.appendChild(notification);
	setTimeout(() => {
		notification.classList.add('show');
	}, 10);
	setTimeout(() => {
		notification.classList.remove('show');
		setTimeout(() => {
			notification.remove();
		}, 300);
	}, 4000);
}


async function showchatList(userDetails) {
	const friendName = userDetails.userName;
	const friendId = userDetails.id;
	const friendEmail = userDetails.email;
	const imageData = userDetails.imageData;
	const contentType = userDetails.contentType;
	let imageUrl = null;
	console.log(contentType);
	if (contentType !== null) {
		const byteCharacters = atob(imageData);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const blob = new Blob([byteArray], { type: contentType });
		imageUrl = URL.createObjectURL(blob);
	}

	const chatList = document.querySelector('.chat-list');
	const chatItem = document.createElement('li');
	chatItem.classList.add('chat-item');
	chatItem.dataset.friendId = friendId;
	chatItem.dataset.friendName = friendName;
	chatItem.dataset.friendEmail = friendEmail;
	chatItem.dataset.imageUrl = imageUrl;

	// Add user image
	if (imageUrl === null) {
		const img = document.createElement('img');
		img.src = './circle-user-regular.svg';
		img.alt = friendName;
		chatItem.appendChild(img);
	}
	else {
		const img = document.createElement('img');
		img.src = imageUrl;
		img.alt = friendName;
		chatItem.appendChild(img);
	}


	// Add user name
	const nameSpan = document.createElement('span');
	nameSpan.classList.add('name');
	//nameSpan.textContent = friendName;
	nameSpan.textContent = friendName;
	chatItem.appendChild(nameSpan);

	// Append the chat item to the chat list
	chatList.appendChild(chatItem);
}



const clipBoard = document.getElementById('clipBoard');
clipBoard.addEventListener('click', goClipboard);

function goClipboard(event) {
	event.preventDefault();
	window.location.href = 'online-clipboard.html';
}



async function viewMessage(friendId, friendName, friendEmail, imageUrl) {
	const hideText = document.getElementById('Empty');
	hideText.style.display = 'none';
	const chat = document.getElementById('chat-window');
	chat.style.display = 'flex';
	const chatHeader = document.getElementById('chat-header');
	chatHeader.innerHTML = '';
	chatHeader.style.display = 'flex';
	chatHeader.style.alignItems = 'center';
	chatHeader.style.gap = '10px';

	if (imageUrl === 'null') {
		const img = document.createElement('img');
		img.src = './circle-user-regular.svg';
		img.alt = friendName;
		img.style.width = '50px';
		img.style.height = '50px';
		img.style.borderRadius = '50%';
		img.style.marginRight = '15px';
		img.style.marginLeft = '15px';
		chatHeader.appendChild(img);
	}
	else {
		const img = document.createElement('img');
		img.src = imageUrl;
		img.alt = friendName;
		img.style.width = '50px';
		img.style.height = '50px';
		img.style.borderRadius = '50%';
		img.style.marginRight = '15px';
		img.style.marginLeft = '15px';
		chatHeader.appendChild(img);
	}

	const nameSpan = document.createElement('span');
	nameSpan.innerHTML = `<snap onclick="showFriendDetails('${friendName}','${friendEmail}','${imageUrl}')">
		${friendName}
		</snap>`;
	nameSpan.style.cursor = 'pointer';
	nameSpan.style.marginRight = '2px';
	chatHeader.appendChild(nameSpan);
	loadMessage();

}

const chatList = document.querySelector('.chat-list');

chatList.addEventListener('click', (event) => {
	const chatItem = event.target.closest('.chat-item');
	if (chatItem) {
		// Remove 'active' class from all chat items
		document.querySelectorAll('.chat-item.active').forEach((item) => {
			item.classList.remove('active');
		});

		// Add 'active' class to the clicked chat item
		chatItem.classList.add('active');

		// Get data attributes
		const friendId = chatItem.dataset.friendId;
		const friendName = chatItem.dataset.friendName;
		const friendEmail = chatItem.dataset.friendEmail;
		const imageUrl = chatItem.dataset.imageUrl;
		sessionStorage.setItem('friendEmail', friendEmail);
		sessionStorage.setItem('friendImageUrl', imageUrl);
		// Call viewMessage with the details
		viewMessage(friendId, friendName, friendEmail, imageUrl);
		console.log("friendEmail: " + sessionStorage.getItem('friendEmail'));
	}
});



const sendFile = document.getElementById('fileInput');
sendFile.addEventListener('input', sendFileFunction);

async function sendFileFunction(event) {
	const alertBox = document.getElementById("customAlert");
	alertBox.style.display = "flex";
	const file = event.target.files[0];
	document.getElementById('alertMessage').innerHTML = `${file.name}`;
	alertBox.file = file;
	sendFile.value = null;
}

const backButtonForFileSend = document.getElementById('back-icon1');
backButtonForFileSend.addEventListener('click', DoesNotSendFile);
function DoesNotSendFile() {
	const alertBox = document.getElementById("customAlert");
	alertBox.style.display = "none";
}


async function sendFile1() {
	const alertBox = document.getElementById("customAlert");
	const file = alertBox.file;
	//showNotification(file.name);
	alertBox.style.display = "none";
	const friendEmail = sessionStorage.getItem('friendEmail');
	const formData = new FormData();
	formData.append('file', file);
	formData.append('senderEmail', email);
	formData.append('receiverEmail', friendEmail);
	const response = await fetch('/sendFileDataToController', { method: 'POST', body: formData });
	//const id=await response.text();


}

function showFriendDetails(friendName, friendEmail, imageUrl) {
	console.log(friendName);
	console.log(friendEmail);
	console.log(imageUrl);

	const profile = document.getElementById('profile-container');
	profile.style.display = 'flex';
	document.getElementById('messenger-container').style.display = 'none';

	// Display profile picture if imageUrl is valid
	const profilePic = document.getElementById('profile-pic');
	const profileIcon = document.getElementById('profile-icon');

	if (imageUrl && imageUrl !== 'null') {
		profilePic.src = imageUrl;
		profilePic.style.display = 'block'; // Ensure the image is visible
		profileIcon.style.display = 'none'; // Hide icon when image is present
	} else {
		profilePic.style.display = 'none'; // Hide image if no URL is available
		profileIcon.style.display = 'block'; // Show fallback icon
	}

	// Update profile details
	document.getElementById('name').value = friendName || 'N/A';
	document.getElementById('email').value = friendEmail || 'N/A';
}

const backButton = document.querySelector('.back-icon');
backButton.addEventListener('click', BACK);
function BACK() {
	document.getElementById('profile-container').style.display = 'none';
	document.getElementById('messenger-container').style.display = 'flex';
}

function showMessage(message) {
	const femail = sessionStorage.getItem('friendEmail');
	if((email===message.senderEmail && femail===message.receiverEmail) || (femail===message.senderEmail && email===message.receiverEmail))
		{
			if (message.message !== null || message.message !== 'null') {
					if (email === message.senderEmail) {
						const messageContainer = document.createElement('div');
						messageContainer.id = `main-${message.id}`;
						messageContainer.classList.add('message-container', 'sent');

						// Sender's avatar
						const url = sessionStorage.getItem('imageUrl');
						if (url === null || url === 'null') {
							const messageImage = document.createElement('img');
							messageImage.src = `./circle-user-regular.svg`; // Replace with sender's image
							messageContainer.appendChild(messageImage);
						}
						else {
							const messageImage = document.createElement('img');
							messageImage.src = url; // Replace with sender's image
							messageContainer.appendChild(messageImage);
						}

						// Message text
						const messageElement = document.createElement('div');
						messageElement.classList.add('message');
						messageElement.innerHTML = message.message;
						messageElement.id=message.id;
						messageElement.addEventListener('contextmenu', (event) => {
						        event.preventDefault();
						        const MSG = `Message Deleted By ${email}`;
						        addMoreOptionsForText(event, message.id, message.message, message.date, message.senderEmail, message.receiverEmail, MSG,message.edited);
						    });
						messageContainer.appendChild(messageElement);

						// Add timestamp
						const timestamp1 = document.createElement('span');
						timestamp1.style.position = "absolute";
						timestamp1.style.bottom = "2px";
						timestamp1.style.right = "2px";
						timestamp1.style.color = "rgba(225, 225, 225, 1)";
						timestamp1.style.fontSize = "10px";
						timestamp1.style.padding = "5px 6px";
						timestamp1.style.borderRadius = "12px";
						timestamp1.style.fontWeight = "500";
						timestamp1.textContent = `${message.date}`;
						messageElement.style.position = "relative";
						messageElement.appendChild(timestamp1);
						messageContainer.appendChild(messageElement);
						chatBody.appendChild(messageContainer);
						chatBody.scrollTop = chatBody.scrollHeight;
					}

					else if (email !== message.senderEmail) {
						const messageContainer = document.createElement('div');
						messageContainer.id = `main-${message.id}`;
						messageContainer.classList.add('message-container', 'received');

						// Receiver's avatar
						const url = sessionStorage.getItem('friendImageUrl');
						if (url === null || url === 'null') {
							const messageImage = document.createElement('img');
							messageImage.src = `./circle-user-regular.svg`; // Replace with sender's image
							messageContainer.appendChild(messageImage);
						}
						else {
							const messageImage = document.createElement('img');
							messageImage.src = url; // Replace with sender's image
							messageContainer.appendChild(messageImage);
						}

						// Message text
						const messageElement = document.createElement('div');
						messageElement.classList.add('message');
						messageElement.innerHTML = message.message;
						messageElement.id=message.id;
						messageElement.addEventListener('contextmenu', (event) => {
						        event.preventDefault();
						        const MSG = `Message Deleted By ${email}`;
						        addMoreOptionsForText(event, message.id, message.message, message.date, message.senderEmail, message.receiverEmail, MSG,message.edited);
						    });
						messageContainer.appendChild(messageElement);

						// Add timestamp
						const timestamp1 = document.createElement('span');
						timestamp1.style.position = "absolute";
						timestamp1.style.bottom = "2px";
						timestamp1.style.right = "2px";
						timestamp1.style.color = "rgba(0, 0, 0, 1)";
						timestamp1.style.fontSize = "10px";
						timestamp1.style.padding = "5px 6px";
						timestamp1.style.borderRadius = "12px";
						timestamp1.style.fontWeight = "500";
						timestamp1.textContent = `${message.date}`;
						messageElement.style.position = "relative";
						messageElement.appendChild(timestamp1);
						messageContainer.appendChild(messageElement);
						chatBody.appendChild(messageContainer);
						chatBody.scrollTop = chatBody.scrollHeight;
					}

				}
		}
	
}


async function loadMessage() {
    chatBody.innerHTML = '';
    const femail = sessionStorage.getItem('friendEmail');
    const response = await fetch(`/loadMessage?senderEmail=${email}&receiverEmail=${femail}`);
    const messages = await response.json();

    for (const message of messages) {
        if (message.message !== null) {
            renderTextMessage(message);
        } else if (message.contentType !== null) {
            if (message.contentType.startsWith('image')) {
                renderImageMessage(message);
            } else {
                renderFileMessage(message);
            }
        }
    }
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to render text messages
function renderTextMessage(message) {
    const messageContainer = document.createElement('div');
	messageContainer.id = `main-${message.id}`;
    messageContainer.classList.add('message-container', email === message.senderEmail ? 'sent' : 'received');

    // Sender or Receiver avatar
    const avatarUrl = email === message.senderEmail
        ? sessionStorage.getItem('imageUrl')
        : sessionStorage.getItem('friendImageUrl');
    const messageImage = document.createElement('img');
    messageImage.src = avatarUrl && avatarUrl !== 'null' ? avatarUrl : `./circle-user-regular.svg`;
    messageContainer.appendChild(messageImage);

    // Message text
	if(message.deleted===0){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `${message.message}`;
	messageElement.id = message.id;
	messageElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const MSG = `Message Deleted By ${email}`;
        addMoreOptionsForText(event, message.id, message.message, message.date, message.senderEmail, message.receiverEmail, MSG,message.edited);
    });
    messageContainer.appendChild(messageElement);
    const timestamp = createTimestamp(message.date, email === message.senderEmail ? 'white' : 'black');
    messageElement.style.position = "relative";
    messageElement.appendChild(timestamp);
	if(message.edited===1){
		const edit=createEdit('Edited', email === message.senderEmail ? 'white' : 'black');
		messageElement.appendChild(edit);
	}
    }
	else if(message.deleted===1){
		
		const messageElement = document.createElement('div');
        messageElement.classList.add('message');
		messageElement.style.color='#97878c';
        messageElement.innerHTML = message.message;
        messageContainer.appendChild(messageElement);
		const timestamp = createTimestamp(message.date,'#97878c');
		messageElement.style.position = "relative";
		messageElement.appendChild(timestamp);
	}
    chatBody.appendChild(messageContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to render image messages
function renderImageMessage(message) {
    const messageContainer = document.createElement('div');
	messageContainer.id=`main-${message.id}`;
    messageContainer.classList.add('message-container', email === message.senderEmail ? 'sent' : 'received');

    // Avatar
    const avatarUrl = email === message.senderEmail
        ? sessionStorage.getItem('imageUrl')
        : sessionStorage.getItem('friendImageUrl');
    const messageImage = document.createElement('img');
    messageImage.src = avatarUrl && avatarUrl !== 'null' ? avatarUrl : `./circle-user-regular.svg`;
    messageContainer.appendChild(messageImage);

    const containerId = `${message.id}`;
    const messageImageWrapper = document.createElement('div');
    messageImageWrapper.style.position = "relative";
    messageImageWrapper.style.display = "inline-block";
    messageImageWrapper.id = containerId;

    const image = document.createElement('img');
    image.src = `/showImageWhereMessageLoad/${message.id}`;
    image.style.width = '35vw';
    image.style.height = 'auto';
    image.style.borderRadius = '3px';
    image.style.border = '2px solid #586c90';
    image.style.display = "block";
    image.addEventListener('contextmenu', (event) => {
        event.preventDefault();
		const MSG=`Image Deleted By ${email}`;
        addMoreOptions(event, message.id, message.fileName,message.date,message.senderEmail,message.receiverEmail,MSG);
    });
    messageImageWrapper.appendChild(image);

    // Timestamp
    const timestamp = createTimestampImage(message.date, 'white');
    messageImageWrapper.appendChild(timestamp);

    messageContainer.appendChild(messageImageWrapper);
    chatBody.appendChild(messageContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function renderFileMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.id = `main-${message.id}`;
    messageContainer.classList.add('message-container', email === message.senderEmail ? 'sent' : 'received');

    // Avatar
    const avatarUrl = email === message.senderEmail
        ? sessionStorage.getItem('imageUrl')
        : sessionStorage.getItem('friendImageUrl');
    const messageImage = document.createElement('img');
    messageImage.src = avatarUrl && avatarUrl !== 'null' ? avatarUrl : `./circle-user-regular.svg`;
    messageContainer.appendChild(messageImage);

    // File link
    const messageElement = document.createElement('a');
    messageElement.classList.add('message-a');
    messageElement.textContent = message.fileName;
    messageElement.href = `/viewMessageFile/${message.id}`;
    messageElement.target = '_blank';
    messageElement.id = message.id;

    // Prevent default behavior on right-click
    messageElement.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Stop the default right-click behavior
        const MSG = `File Deleted By ${email}`;
        addMoreOptions(event, message.id, message.fileName, message.date, message.senderEmail, message.receiverEmail, MSG);
    });

    messageContainer.appendChild(messageElement);

    // Timestamp
    const timestamp = createTimestamp(message.date, email === message.senderEmail ? 'white' : 'black');
    messageElement.style.position = "relative";
    messageElement.appendChild(timestamp);

    chatBody.appendChild(messageContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
}


// Function to create a timestamp element
function createTimestamp(date, color) {
    const timestamp = document.createElement('span');
    timestamp.style.position = "absolute";
    timestamp.style.bottom = "2px";
    timestamp.style.right = "2px";
    timestamp.style.color = color;
    timestamp.style.fontSize = "10px";
    timestamp.style.padding = "5px 6px";
    timestamp.style.borderRadius = "12px";
    timestamp.style.fontWeight = "500";
    timestamp.textContent = date;
    return timestamp;
}

function createTimestampImage(date, color) {
    const timestamp = document.createElement('span');
    timestamp.style.position = "absolute";
	timestamp.style.background='black'
    timestamp.style.bottom = "2px";
    timestamp.style.right = "10px";
    timestamp.style.color = color;
    timestamp.style.fontSize = "10px";
    timestamp.style.padding = "5px 6px";
    timestamp.style.borderRadius = "12px";
    timestamp.style.fontWeight = "500";
    timestamp.textContent = date;
    return timestamp;
}

// Function to add Download and Delete buttons dynamically on right-click
function addMoreOptions(event, fileId, fileName, date, senderEmail, receiverEmail, MSG) {
    const container = document.getElementById(fileId);
    if (!container) return;

    const existingButtons = document.querySelector('.button-container');
    if (existingButtons) existingButtons.remove();

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttonContainer.style.position = "absolute";
    buttonContainer.style.top = `${event.offsetY}px`;
    buttonContainer.style.left = `${event.offsetX}px`;
    buttonContainer.style.backgroundColor = '#f1f1f1';
    buttonContainer.style.border = '1px solid #ccc';
    buttonContainer.style.borderRadius = '5px';
    buttonContainer.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
    buttonContainer.style.zIndex = '1000';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.display = 'block';
    deleteButton.style.backgroundColor = '#e74c3c';
    deleteButton.style.color = '#fff';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.margin = '5px';
    deleteButton.style.borderRadius = '3px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
		const fEmail=sessionStorage.getItem('friendEmail');
		const message = {
			        id:fileId,
					senderEmail: email,
					receiverEmail: fEmail,
					message: MSG,
					date:date

				};
				stompClient.send('/app/sendMessageForDelete', {}, JSON.stringify(message));
        buttonContainer.remove();
    });

    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.style.display = 'block';
    downloadButton.style.backgroundColor = '#3498db';
    downloadButton.style.color = '#fff';
    downloadButton.style.border = 'none';
    downloadButton.style.padding = '5px 10px';
    downloadButton.style.margin = '5px';
    downloadButton.style.borderRadius = '3px';
    downloadButton.style.cursor = 'pointer';
    downloadButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        downloadFileById(fileId, fileName);
        buttonContainer.remove();
    });

    
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(downloadButton);

    container.appendChild(buttonContainer);

    document.addEventListener(
        'click',
        (e) => {
            if (!container.contains(e.target)) {
                buttonContainer.remove();
            }
        },
        { once: true }
    );
}

async function deleteFileById(deleteInfo) {
    const messageContainer = document.getElementById(`main-${deleteInfo.id}`);
    const imageContainer = document.getElementById(`${deleteInfo.id}`);
    if (imageContainer) {
        imageContainer.remove();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
		messageElement.style.color='#97878c';
        messageElement.innerHTML = deleteInfo.message;
        messageContainer.appendChild(messageElement);
		const timestamp = createTimestamp(deleteInfo.date,'#97878c');
		messageElement.style.position = "relative";
		messageElement.appendChild(timestamp);
    }
}

function downloadFileById(imageId, fileName) {
    const link = document.createElement('a');
    link.href = `/downloadMessageFile/${imageId}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to add Delete and Edit options for text messages dynamically on right-click
function addMoreOptionsForText(event, messageId, messageContent, date, senderEmail, receiverEmail, MSG,edited) {
    const container = document.getElementById(messageId);
    if (!container) return;

    const existingButtons = document.querySelector('.button-container');
    if (existingButtons) existingButtons.remove();

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttonContainer.style.position = "absolute";
    buttonContainer.style.top = `${event.offsetY}px`;
    buttonContainer.style.left = `${event.offsetX}px`;
    buttonContainer.style.backgroundColor = '#f1f1f1';
    buttonContainer.style.border = '1px solid #ccc';
    buttonContainer.style.borderRadius = '5px';
    buttonContainer.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
    buttonContainer.style.zIndex = '1000';
	
	const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.style.display = 'block';
    editButton.style.backgroundColor = '#3498db';
    editButton.style.color = '#fff';
    editButton.style.border = 'none';
    editButton.style.padding = '5px 10px';
    editButton.style.margin = '5px';
    editButton.style.borderRadius = '3px';
    editButton.style.cursor = 'pointer';
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        editMessage(event, messageId, messageContent, date, senderEmail, receiverEmail, MSG,edited);
        buttonContainer.remove();
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.display = 'block';
    deleteButton.style.backgroundColor = '#e74c3c';
    deleteButton.style.color = '#fff';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.margin = '5px';
    deleteButton.style.borderRadius = '3px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const fEmail = sessionStorage.getItem('friendEmail');
        const message = {
            id: messageId,
            senderEmail: email,
            receiverEmail: fEmail,
            message: MSG,
            date: date
        };
        stompClient.send('/app/sendMessageForDelete', {}, JSON.stringify(message));
        buttonContainer.remove();
    });

    if(email===senderEmail){
		buttonContainer.appendChild(editButton);
	}
    buttonContainer.appendChild(deleteButton);
    container.appendChild(buttonContainer);

    document.addEventListener(
        'click',
        (e) => {
            if (!container.contains(e.target)) {
                buttonContainer.remove();
            }
        },
        { once: true }
    );
}

// Function to handle message editing
//event, messageId, messageContent, date, senderEmail, receiverEmail, MSG,edited
function editMessage(event,messageId, oldContent,date,senderEmail,receiverEmail,MSG,edited) {
    const messageElement = document.getElementById(messageId);
    if (!messageElement) return;

    // Create an input field for editing
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = oldContent;
    inputField.classList.add('edit-input');
    inputField.style.width = 'calc(100%)';
    inputField.style.marginRight = '10px';

    // Create a save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button');
    saveButton.style.backgroundColor = '#3498db';
    saveButton.style.color = '#fff';
    saveButton.style.border = 'none';
    saveButton.style.padding = '5px 10px';
    saveButton.style.borderRadius = '3px';
    saveButton.style.cursor = 'pointer';

    // Create a back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.classList.add('back-button');
    backButton.style.backgroundColor = '#95a5a6';
    backButton.style.color = '#fff';
    backButton.style.border = 'none';
    backButton.style.padding = '5px 10px';
    backButton.style.borderRadius = '3px';
    backButton.style.cursor = 'pointer';
    backButton.style.marginLeft = '5px';

    messageElement.innerHTML = '';
    messageElement.appendChild(inputField);
    messageElement.appendChild(saveButton);
    messageElement.appendChild(backButton);

    // Focus on the input field
    inputField.focus();

    // Handle saving the edited message
    saveButton.addEventListener('click', () => {
        const newContent = inputField.value.trim();
        if (newContent === '') return;
		if(oldContent===newContent)return;

        const fEmail = sessionStorage.getItem('friendEmail');
        const updatedMessage = {
            id: messageId,
            senderEmail: email,
            receiverEmail: fEmail,
            message: newContent,
            date: date
        };

        stompClient.send('/app/sendMessageForEdit', {}, JSON.stringify(updatedMessage));
    });

    // Handle reverting to old content when back button is clicked
	const messageContainer = document.getElementById(`main-${messageId}`);
    backButton.addEventListener('click', () => {
        messageElement.innerHTML = oldContent;
		messageElement.remove();
        const messageElement1 = document.createElement('div');
        messageElement1.classList.add('message');
        messageElement1.innerHTML = oldContent;
		messageElement1.id=messageId;
		messageElement1.addEventListener('contextmenu', (event) => {
		        event.preventDefault();
		        const MSG = `Message Deleted By ${email}`;
		        addMoreOptionsForText(event,messageId, oldContent,date,senderEmail,receiverEmail,MSG,edited);
		    });
        messageContainer.appendChild(messageElement1);
		const timestamp = createTimestamp(date, email === senderEmail ? 'white' : 'black');
		messageElement1.style.position = "relative";
		messageElement1.appendChild(timestamp);
		if(edited===1){
			const edit=createEdit('Edited', email === senderEmail ? 'white' : 'black');
			messageElement1.appendChild(edit);
		}
    });

}

function editMessageById(message){
	const messageContainer = document.getElementById(`main-${message.id}`);
	const messageElement = document.getElementById(message.id);
	messageElement.remove();
	const messageElement1 = document.createElement('div');
    messageElement1.classList.add('message');
    messageElement1.innerHTML = message.message;
	messageElement1.id=message.id;
	messageElement1.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const MSG = `Message Deleted By ${email}`;
        addMoreOptionsForText(event,message.id, message.message,message.date,message.senderEmail,message.receiverEmail,MSG,1);
    });
    messageContainer.appendChild(messageElement1);
	const timestamp = createTimestamp(message.date, email === message.senderEmail ? 'white' : 'black');
	messageElement1.style.position = "relative";
	messageElement1.appendChild(timestamp);
	
	const edit=createEdit('Edited', email === message.senderEmail ? 'white' : 'black');
	messageElement1.appendChild(edit);
}

function createEdit(msg, color) {
    const edit = document.createElement('span');
    edit.style.position = "absolute";
    edit.style.top = "2px";
    edit.style.right = "10px";
    edit.style.color = color;
    edit.style.fontSize = "13px";
    edit.style.padding = "5px 6px";
    edit.style.borderRadius = "12px";
    edit.style.fontWeight = "500";
    edit.textContent = msg;
    return edit;
}


async function showFile(file) {
	
	const femail = sessionStorage.getItem('friendEmail');
	if((email===file.senderEmail && femail===file.receiverEmail) || (femail===file.senderEmail && email===file.receiverEmail))
	{
	    const senderEmail = file.senderEmail;
		const receiverEmail = file.receiverEmail;
		const fileName = file.fileName;
		const contentType = file.contentType;
		const fileData = file.fileData;
		console.log(senderEmail);
		console.log(contentType);
		if (contentType.startsWith('image')) {
			const byteCharacters = atob(fileData);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: contentType });
			SendingImageUrl = URL.createObjectURL(blob);
			if (email === senderEmail) {
				const url = sessionStorage.getItem('imageUrl');
				const messageContainer = document.createElement('div');
				messageContainer.id = `main-${file.id}`;
				messageContainer.classList.add('message-container', 'sent');

				// Sender's avatar
				if (url === null || url === 'null') {
					const messageImage = document.createElement('img');
					messageImage.src = `./circle-user-regular.svg`;
					messageContainer.appendChild(messageImage);
				}
				else {
					const messageImage = document.createElement('img');
					messageImage.src = url;
					messageContainer.appendChild(messageImage);
				}


				const messageImage1 = document.createElement('div');
				messageImage1.id=file.id;
				messageImage1.style.position = "relative";
				messageImage1.style.display = "inline-block";

				const image = document.createElement('img');
				image.src = SendingImageUrl;
				image.style.width = '35vw';
				image.style.height = 'auto';
				image.style.borderRadius = '3px';
				image.style.padding = "0";
				image.style.border = '2px solid #586c90';
				image.style.display = "block";
				image.addEventListener('contextmenu', (event) => {
						        event.preventDefault(); 
						        const MSG = `Image Deleted By ${email}`;
						        addMoreOptions(event, file.id, file.fileName, file.date, file.senderEmail, file.receiverEmail, MSG);
						    });
				messageImage1.appendChild(image);

				// Add timestamp
				const timestamp = document.createElement('div');		
				timestamp.innerHTML = `${file.date}`;
				timestamp.style.position = "absolute";
				timestamp.style.bottom = "5px"; 
				timestamp.style.right = "10px";
				timestamp.style.color = "rgba(255, 255, 255, 0.9)";
				timestamp.style.fontSize = "12px";
				timestamp.style.padding = "2px 6px";
				timestamp.style.borderRadius = "8px";
				timestamp.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
				timestamp.style.boxShadow = "0px 1px 3px rgba(0, 0, 0, 0.3)";
				timestamp.style.zIndex = "10"; 
				messageImage1.appendChild(timestamp);
				messageContainer.appendChild(messageImage1);
				chatBody.appendChild(messageContainer);
				chatBody.scrollTop = chatBody.scrollHeight;
			}
			else {
				const url = sessionStorage.getItem('friendImageUrl');
				const messageContainer = document.createElement('div');
				messageContainer.id = `main-${file.id}`;
				messageContainer.classList.add('message-container', 'received');

				// Sender's avatar
				if (url === null || url === 'null') {
					const messageImage = document.createElement('img');
					messageImage.src = `./circle-user-regular.svg`; 
					messageContainer.appendChild(messageImage);
				}
				else {
					const messageImage = document.createElement('img');
					messageImage.src = url;
					messageContainer.appendChild(messageImage);
				}


				const messageImage1 = document.createElement('div');
				messageImage1.id=file.id;
				messageImage1.style.position = "relative"; 
				messageImage1.style.display = "inline-block";

				const image = document.createElement('img');
				image.src = SendingImageUrl;
				image.style.width = '35vw';
				image.style.height = 'auto';
				image.style.borderRadius = '3px';
				image.style.padding = "0";
				image.style.border = '2px solid #586c90';
				image.style.display = "block"; 
				image.addEventListener('contextmenu', (event) => {
			        event.preventDefault(); 
			        const MSG = `Image Deleted By ${email}`;
			        addMoreOptions(event, file.id, file.fileName, file.date, file.senderEmail, file.receiverEmail, MSG);
			    });
				messageImage1.appendChild(image);

				// Add timestamp
				const timestamp = document.createElement('div'); 
				timestamp.innerHTML = `${file.date}`;
				// Advanced styling for time
				timestamp.style.position = "absolute";
				timestamp.style.bottom = "5px";
				timestamp.style.right = "10px";
				timestamp.style.color = "rgba(255, 255, 255, 0.9)";
				timestamp.style.fontSize = "12px";
				timestamp.style.padding = "2px 6px";
				timestamp.style.borderRadius = "8px";
				timestamp.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
				timestamp.style.boxShadow = "0px 1px 3px rgba(0, 0, 0, 0.3)";
				timestamp.style.zIndex = "10";

				
				messageImage1.appendChild(timestamp);
				messageContainer.appendChild(messageImage1);
				chatBody.appendChild(messageContainer);
				chatBody.scrollTop = chatBody.scrollHeight;
			}
		}
		else {
			if (email === senderEmail) {
				const messageContainer = document.createElement('div');
				messageContainer.id = `main-${file.id}`;
				messageContainer.classList.add('message-container', 'sent');

				// Sender's avatar
				const url = sessionStorage.getItem('imageUrl');
				if (url === null || url === 'null') {
					const messageImage = document.createElement('img');
					messageImage.src = `./circle-user-regular.svg`;
					messageContainer.appendChild(messageImage);
				}
				else {
					const messageImage = document.createElement('img');
					messageImage.src = url; 
					messageContainer.appendChild(messageImage);
				}

				// Message text
				const messageElement = document.createElement('a');
				messageElement.classList.add('message-a');
				messageElement.id=file.id;
				messageElement.innerHTML = fileName;
				messageElement.href = `/viewMessageFile/${file.id}`;
				messageElement.target='_blank';
				messageElement.addEventListener('contextmenu', (event) => {
				        event.preventDefault(); 
				        const MSG = `File Deleted By ${email}`;
				        addMoreOptions(event, file.id, file.fileName, file.date, file.senderEmail, file.receiverEmail, MSG);
				    });

				messageContainer.appendChild(messageElement);

				// Add timestamp
				const timestamp1 = document.createElement('span');
				timestamp1.style.position = "absolute";
				timestamp1.style.bottom = "2px";
				timestamp1.style.right = "2px";
				timestamp1.style.color = "rgba(225, 225, 225, 1)";
				timestamp1.style.fontSize = "10px";
				timestamp1.style.padding = "5px 6px";
				timestamp1.style.borderRadius = "12px";
				timestamp1.style.fontWeight = "500";
				timestamp1.textContent = `${file.date}`;
				messageElement.style.position = "relative";
				messageElement.appendChild(timestamp1);
				messageContainer.appendChild(messageElement);
				chatBody.appendChild(messageContainer);
				chatBody.scrollTop = chatBody.scrollHeight;
			}

			else if (email !== senderEmail) {
				const messageContainer = document.createElement('div');
				messageContainer.id = `main-${file.id}`;
				messageContainer.classList.add('message-container', 'received');

				// Receiver's avatar
				const url = sessionStorage.getItem('friendImageUrl');
				if (url === null || url === 'null') {
					const messageImage = document.createElement('img');
					messageImage.src = `./circle-user-regular.svg`; // Replace with sender's image
					messageContainer.appendChild(messageImage);
				}
				else {
					const messageImage = document.createElement('img');
					messageImage.src = url; // Replace with sender's image
					messageContainer.appendChild(messageImage);
				}

				// Message text
				const messageElement = document.createElement('a');
				messageElement.classList.add('message-a');
				messageElement.id=file.id;
				messageElement.innerHTML = fileName;
				messageElement.href = `/viewMessageFile/${file.id}`;
				messageElement.target='_blank';
				messageElement.addEventListener('contextmenu', (event) => {
				        event.preventDefault(); 
				        const MSG = `File Deleted By ${email}`;
				        addMoreOptions(event, file.id, file.fileName, file.date, file.senderEmail, file.receiverEmail, MSG);
				    });
				messageContainer.appendChild(messageElement);

				// Add timestamp
				const timestamp1 = document.createElement('span');
				timestamp1.style.position = "absolute";
				timestamp1.style.bottom = "2px";
				timestamp1.style.right = "2px";
				timestamp1.style.color = "rgba(0, 0, 0, 1)";
				timestamp1.style.fontSize = "10px";
				timestamp1.style.padding = "5px 6px";
				timestamp1.style.borderRadius = "12px";
				timestamp1.style.fontWeight = "500";
				timestamp1.textContent = `${file.date}`;
				messageElement.style.position = "relative";
				messageElement.appendChild(timestamp1);
				messageContainer.appendChild(messageElement);
				chatBody.appendChild(messageContainer);
				chatBody.scrollTop = chatBody.scrollHeight;
			}
		}

	}
		
}
