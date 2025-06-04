// Simulación de base de datos de usuarios
let users = JSON.parse(localStorage.getItem('users')) || [];

// Validación de email en tiempo real (formato: texto@texto.com)
document.getElementById('registerEmail')?.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(this.value) && this.value.endsWith('.com');
    this.classList.toggle('is-invalid', !isValid);
    
    // Mensaje específico
    if (this.value && !isValid) {
        this.nextElementSibling.textContent = 'El correo debe tener formato: usuario@dominio.com';
    }
});

// Validación de contraseña en tiempo real (8+ chars, mayúscula, número y símbolo)
document.getElementById('registerPassword')?.addEventListener('input', function() {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    const isValid = passwordRegex.test(this.value);
    this.classList.toggle('is-invalid', !isValid);
    
    // Mensaje detallado
    if (this.value && !isValid) {
        this.nextElementSibling.innerHTML = `
            La contraseña debe contener:<br>
            - 8+ caracteres<br>
            - 1 mayúscula<br>
            - 1 número<br>
            - 1 símbolo (!@#$%^&*_+)
        `;
    }
});

// Validar confirmación de contraseña
document.getElementById('confirmPassword')?.addEventListener('input', function() {
    const password = document.getElementById('registerPassword').value;
    this.classList.toggle('is-invalid', this.value !== password);
});

// Registrar nuevo usuario (con validación final)
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validación final
    if (!email.endsWith('.com')) {
        alert('❌ El correo debe terminar en .com');
        return;
    }

    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])/.test(password)) {
        alert('❌ La contraseña no cumple los requisitos de seguridad');
        return;
    }

    if (password !== confirmPassword) {
        alert('⚠️ Las contraseñas no coinciden');
        return;
    }

    // Resto del código de registro...
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('✅ Registro exitoso. Ahora inicia sesión.');
    this.reset();
    document.getElementById('login-tab').click();
});

// Registrar nuevo usuario
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('⚠️ Las contraseñas no coinciden');
        return;
    }

    if (users.some(user => user.email === email)) {
        alert('⚠️ Este correo ya está registrado');
        return;
    }

    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('✅ Registro exitoso. Ahora inicia sesión.');
    this.reset();
    document.getElementById('login-tab').click(); // Cambia a pestaña de login
});

// Iniciar sesión
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('❌ Credenciales incorrectas');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
});

// Mostrar/ocultar contraseña en login
document.getElementById('toggleLoginPassword')?.addEventListener('click', function() {
    const passwordInput = document.getElementById('loginPassword');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// "Olvidé mi contraseña" (simulado)
document.getElementById('forgotPassword')?.addEventListener('click', function(e) {
    e.preventDefault();
    alert('📧 Se ha enviado un enlace de recuperación a su correo (simulado).');
});

// Para guardar su usuario para el saludo
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('❌ Credenciales incorrectas');
        return;
    }

    // Guardar usuario y extraer nombre antes del @
    const username = email.split('@')[0];
    localStorage.setItem('currentUser', JSON.stringify({
        email,
        password,
        username // Añadimos el nombre de usuario
    }));
    
    window.location.href = 'dashboard.html';
});