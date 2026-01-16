// 1. KEAMANAN & SESSION
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}
const userRole = sessionStorage.getItem('role');
if (userRole === 'user') {
    document.getElementById('adminPanel').style.display = 'none';
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// 2. AWAL LOADING
document.addEventListener('DOMContentLoaded', () => {
    // Set tanggal hari ini secara default
    const inputTgl = document.getElementById('tanggalNota');
    if(inputTgl) inputTgl.value = new Date().toISOString().split('T')[0];
    
    loadData();

    // Event Pencarian Real-time
    document.getElementById('cariData')?.addEventListener('input', (e) => {
        loadData(e.target.value.toLowerCase());
    });
});

// 3. LOGIKA SIMPAN DATA
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const select = document.getElementById('kodeJenis');
    
    const dataBaru = {
        id: Date.now(),
        tglNota: document.getElementById('tanggalNota').value,
        kode: select.value,
        deskripsi: select.options[select.selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: parseInt(document.getElementById('jumlah').value)
    };

    let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    db.push(dataBaru);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

    Swal.fire({
        icon: 'success',
        title: 'Tersimpan!',
        text: 'Data nota berhasil ditambahkan ke sistem.',
        timer: 1000,
        showConfirmButton: false
    });

    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    loadData();
});

// 4. LOGIKA LOAD DATA & AKUMULASI KODE
function loadData(keyword = "") {
    const tabel = document.getElementById('tabelNota');
    const ringkasanDiv = document.getElementById('ringkasanKategori');
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    tabel.innerHTML = '';

    // A. HITUNG STATISTIK UTAMA
    document.getElementById('statTotal').innerText = list.length;
    document.getElementById('statPagi').innerText = list.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = list.filter(i => i.shift === 'MALAM').length;

    // B. HITUNG AKUMULASI QTY PER KODE
    const akumulasi = {};
    list.forEach(item => {
        akumulasi[item.kode] = (akumulasi[item.kode] || 0) + item.jumlah;
    });

    ringkasanDiv.innerHTML = Object.keys(akumulasi).map(k => `
        <div class="category-badge">
            <span class="text-muted small">${k}:</span> 
            <span class="text-primary fw-bold">${akumulasi[k]} Unit</span>
        </div>
    `).join('');

    // C. FILTER PENCARIAN
    let filtered = list.filter(item => 
        item.kode.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword) ||
        item.tglNota.includes(keyword)
    );

    // D. RENDER TABEL
    filtered.reverse().forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted small">${index + 1}</td>
            <td class="fw-bold">${item.tglNota}</td>
            <td><span class="badge bg-primary px-3">${item.kode}</span></td>
            <td class="text-start">${item.deskripsi}</td>
            <td>
                <span class="badge ${item.shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">
                    ${item.shift}
                </span>
            </td>
            <td class="fw-bold text-dark">${item.jumlah}</td>
            <td class="action-col">
                ${userRole === 'admin' ? 
                `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0"><i class="fas fa-trash-alt"></i></button>` 
                : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

// 5. LOGIKA HAPUS
function deleteData(id) {
    Swal.fire({
        title: 'Hapus data ini?',
        text: "Data yang dihapus tidak dapat dipulihkan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            list = list.filter(i => i.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(list));
            loadData();
            Swal.fire('Terhapus!', 'Nota telah dihapus.', 'success');
        }
    });
}

// 6. EXPORT EXCEL
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    if (list.length === 0) return Swal.fire('Data Kosong', 'Tidak ada data untuk diexport', 'info');

    const ws = XLSX.utils.json_to_sheet(list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan_Nota");
    XLSX.writeFile(wb, `Laporan_Nota_Ali_Akatiri_${Date.now()}.xlsx`);
}
