document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const authMsg = document.getElementById('auth-msg');

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                authMsg.textContent = "Invalid email or password!";
                authMsg.style.color = 'red';
            } else {
                authMsg.textContent = "Login successful";
                authMsg.style.color = 'green';
                
                // Store login status and user data in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to the desired page after a short delay
                alert('Login success, Redirecting Shortly')
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (err) {
            authMsg.textContent = 'An error occurred';
            authMsg.style.color = 'red';
        }
    });

    function checkLoginStatus() {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            document.getElementById('login-link').style.display = 'none';
        }
    }

    // Check login status on page load
    checkLoginStatus();
});
