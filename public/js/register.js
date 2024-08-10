document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const profilePicture = document.getElementById('profile-picture').files[0];
      const authMsg = document.getElementById('auth-msg');
  
      try {
        let profilePictureDataUrl = '';
        if (profilePicture) {
          const reader = new FileReader();
          reader.onloadend = function() {
            profilePictureDataUrl = reader.result;
            // Continue the registration process after the profile picture is read
            registerUser(email, username, password, profilePictureDataUrl);
          };
          reader.readAsDataURL(profilePicture);
        } else {
          // No profile picture provided, continue the registration process
          registerUser(email, username, password, profilePictureDataUrl);
        }
  
        async function registerUser(email, username, password, profilePicture) {
          const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password, profilePicture })
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            authMsg.textContent = "User already exists!";
          } else {
            authMsg.textContent = "User created successfully";
            localStorage.setItem('user', JSON.stringify({ email, username, profilePicture }));
            localStorage.setItem('isLoggedIn', true);
            setTimeout(() => {
              window.location.href = 'login.html';
          }, 1500)
          }
        }
      } catch (err) {
        authMsg.textContent = 'An error occurred';
      }
    });
  });
  