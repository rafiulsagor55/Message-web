function loadAndDisplayUsers() {

    // check if the user is connected
    const email = localStorage.getItem('email');
    if (!email) {
        window.location.href = 'login.html';
        return;
    }
	else{
		window.location.href = 'home.html';
	}
}

