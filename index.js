// PROTEKSI LOGIN
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

// SETUP TANGGAL OTOMATIS SAAT BUKA HALAMAN
document.addEventListener('DOMContentLoaded', () => {
    const tglInput = document.getElementById('tanggalNota');
    if(tglInput) tglInput.value = new Date().toISOString().split('T')[0];
    loadData();
});

// SIMPAN DATA
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const select = document.getElementById('kodeJenis');
    const data = {
        id: Date.now(),
        tglNota: document.getElementById('tanggalNota').value,
        kode: select.value,
        deskripsi: select.options[select.selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: document.getElementById('jumlah').value,
        waktuSystem: new Date().toLocaleString('id-ID', {hour:'2-digit', minute:'2-digit'})
    };

    let list = JSON.parse(localStorage.getItem('db_nota_ali')) || [];
    list.push(data);
    localStorage.setItem('db_nota_ali', JSON.stringify(list));
    
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    loadData();
});

// TAMPILKAN DATA
function loadData() {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;
    tabel.innerHTML = '';
    let list = JSON.parse(localStorage.getItem('db_nota_ali')) || [];
    
    list.reverse().forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td class="fw-bold text-primary">${item.tglNota}</td>
            <td><span class="badge bg-primary">${item.kode}-${item.shift}</span></td>
            <td>${item.deskripsi}</td>
            <td><span class="badge ${item.shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">${item.shift}</span></td>
            <td class="text-center fw-bold">${item.jumlah}</td>
            <td><small>${item.waktuSystem}</small></td>
            <td class="text-center action-col">
                ${userRole === 'admin' ? `<button onclick="deleteData(${item.id})" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>` : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

function deleteData(id) {
    if (confirm("Hapus data nota ini?")) {
        let list = JSON.parse(localStorage.getItem('db_nota_ali')) || [];
        list = list.filter(i => i.id !== id);
        localStorage.setItem('db_nota_ali', JSON.stringify(list));
        loadData();
    }
}

// EXPORT EXCEL
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_nota_ali')) || [];
    const dataExcel = list.map((item, i) => ({
        "No": i + 1,
        "Tanggal Nota": item.tglNota,
        "Kode Nota": `${item.kode}-${item.shift}`,
        "Deskripsi": item.deskripsi,
        "Shift": item.shift,
        "Jumlah": item.jumlah,
        "Waktu Input System": item.waktuSystem
    }));
    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_Nota_Ali_Akatiri.xlsx`);
}
