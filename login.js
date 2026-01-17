// Konfigurasi Akun
const VALID_USERS = {
    "admin": "admin",
    "user": "user"
};

let attempts = 0;
const MAX_ATTEMPTS = 5;

// 1. Fitur Toggle Password (Lihat Mata)
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

// 2. Fitur Remember Me (Muat data saat startup)
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('remember_ali');
    if (savedUser) {
        document.getElementById('username').value = savedUser;
        document.getElementById('rememberMe').checked = true;
    }
});

// 3. Logika Login & Anti-Brute Force
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const isRemember = document.getElementById('rememberMe').checked;
    const btn = document.getElementById('btnLogin');
    const btnText = document.getElementById('btnText');
    const msg = document.getElementById('loginMessage');

    // Cek Blokir
    if (attempts >= MAX_ATTEMPTS) {
        Swal.fire('Akses Dikunci', 'Terlalu banyak percobaan. Muat ulang halaman.', 'error');
        return;
    }

    // Efek Loading
    btn.disabled = true;
    btnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengecek...';
    msg.style.display = 'none';

    setTimeout(() => {
        if (VALID_USERS[user] && VALID_USERS[user] === pass) {
            // BERHASIL LOGIN
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('role', user);

            if (isRemember) {
                localStorage.setItem('remember_ali', user);
            } else {
                localStorage.removeItem('remember_ali');
            }

            window.location.href = 'dashboard.html';
        } else {
            // GAGAL LOGIN
            attempts++;
            btn.disabled = false;
            btnText.innerText = 'MASUK';
            msg.style.display = 'block';
            msg.innerText = `Username atau Password salah! (Sisa: ${MAX_ATTEMPTS - attempts})`;

            if (attempts >= MAX_ATTEMPTS) {
                btn.style.background = "#ff4d4d";
                btnText.innerText = "DIKUNCI";
            }
        }
    }, 1200);
});
