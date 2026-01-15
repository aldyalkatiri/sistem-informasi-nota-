// index.js
document.getElementById('notaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Ambil Data dari Form
    const selectJenis = document.getElementById('kodeJenis');
    const shift = document.getElementById('shift').value;
    const jumlah = document.getElementById('jumlah').value;
    
    const kode = selectJenis.value;
    const deskripsi = selectJenis.options[selectJenis.selectedIndex].text;
    const waktu = new Date().toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
// PROTEKSI HALAMAN: Cek jika belum login
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Fitur Logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Logic Tabel Nota
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const selectJenis = document.getElementById('kodeJenis');
    const shift = document.getElementById('shift').value;
    const jumlah = document.getElementById('jumlah').value;
    const kode = selectJenis.value;
    const deskripsi = selectJenis.options[selectJenis.selectedIndex].text;
    const waktu = new Date().toLocaleString('id-ID', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' });

    const tabel = document.getElementById('tabelNota');
    const row = document.createElement('tr');
    row.className = 'new-row';
    
    row.innerHTML = `
        <td class="fw-bold row-num"></td>
        <td><span class="badge bg-primary">${kode}-${shift}</span></td>
        <td>${deskripsi}</td>
        <td><span class="badge ${shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">${shift}</span></td>
        <td class="fw-bold text-center">${jumlah}</td>
        <td><small>${waktu}</small></td>
        <td class="text-center action-col">
            <button class="btn btn-danger btn-sm py-0 px-2 btn-hapus" style="font-size:11px">Hapus</button>
        </td>
    `;

    row.querySelector('.btn-hapus').addEventListener('click', function() {
        if(confirm('Hapus data ini?')) { row.remove(); updateNomor(); }
    });

    tabel.prepend(row);
    updateNomor();
    this.reset();
});

function updateNomor() {
    document.querySelectorAll('.row-num').forEach((cell, i) => cell.innerText = i + 1);
}
    // Buat Kode Unik (Contoh: SL-PAGI)
    const kodeFull = `${kode}-${shift}`;
    
    const tabel = document.getElementById('tabelNota');

    // Buat Element Baris (tr)
    const row = document.createElement('tr');
    row.className = 'new-row';
    
    row.innerHTML = `
        <td class="fw-bold row-number"></td>
        <td><span class="badge rounded-pill bg-primary">${kodeFull}</span></td>
        <td>${deskripsi}</td>
        <td><span class="badge ${shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">${shift}</span></td>
        <td class="fw-bold">${jumlah}</td>
        <td><small class="text-muted">${waktu}</small></td>
        <td class="text-center action-col">
            <button class="btn btn-sm btn-hapus fw-bold">Hapus</button>
        </td>
    `;

    // Event Hapus
    row.querySelector('.btn-hapus').addEventListener('click', function() {
        if (confirm('Hapus baris nota ini?')) {
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateNomor();
            }, 300);
        }
    });

    // Tambah ke tabel (di urutan paling atas)
    tabel.prepend(row);
    updateNomor();

    // Reset Form
    this.reset();
});

// Fungsi untuk menjaga nomor urut tetap rapi
function updateNomor() {
    const rows = document.querySelectorAll('#tabelNota tr');
    rows.forEach((row, index) => {
        row.querySelector('.row-number').innerText = index + 1;
    });
    
}

