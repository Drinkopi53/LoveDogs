document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const USERS_STORAGE_KEY = 'galacticPaws.users';

    // Function to get users from localStorage
    const getUsers = () => {
        const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
        return usersJSON ? JSON.parse(usersJSON) : [];
    };

    // Function to save users to localStorage
    const saveUsers = (users) => {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    };

    // --- REGISTRATION LOGIC ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = registerForm.elements.username.value.trim();
            const email = registerForm.elements.email.value.trim();
            const password = registerForm.elements.password.value;

            if (!username || !email || !password) {
                alert('Harap isi semua field.');
                return;
            }

            const users = getUsers();

            // Check for existing user
            if (users.some(user => user.username === username)) {
                alert('Username sudah digunakan. Silakan pilih yang lain.');
                return;
            }
            if (users.some(user => user.email === email)) {
                alert('Email sudah terdaftar. Silakan gunakan email lain.');
                return;
            }

            // Simple "hashing" for demonstration. NOT SECURE.
            const hashedPassword = btoa(password);

            const newUser = {
                username,
                email,
                password: hashedPassword
            };

            users.push(newUser);
            saveUsers(users);

            alert('Registrasi berhasil! Anda akan dialihkan...');
            // Set session and redirect
            sessionStorage.setItem('galacticPaws.currentUser', JSON.stringify({ username }));
            window.location.href = 'loading.html';
        });
    }

    // --- LOGIN LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.elements.username.value.trim();
            const password = loginForm.elements.password.value;

            if (!username || !password) {
                alert('Harap isi username dan password.');
                return;
            }

            const users = getUsers();
            const user = users.find(u => u.username === username);

            // Simple "hashing" check. NOT SECURE.
            if (user && btoa(password) === user.password) {
                alert('Login berhasil! Anda akan dialihkan...');
                // Set session and redirect
                sessionStorage.setItem('galacticPaws.currentUser', JSON.stringify({ username }));
                window.location.href = 'loading.html';
            } else {
                alert('Username atau password salah.');
            }
        });
    }
});
