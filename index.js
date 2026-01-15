// 1. CEK LOGIN & ROLE
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const userRole = sessionStorage.getItem('role');
if (userRole === 'user') {
    document.getElementById('adminPanel').style.display = 'none';
}

// 2. FUNGSI LOGOUT
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// 3. LOAD DATA DARI LOCAL STORAGE
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// 4. INPUT DATA
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const select = document.getElementById('kodeJenis');
    const data = {
        id: Date.now(),
        kode: select.value,
        deskripsi: select.options[select.selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: document.getElementById('jumlah').value,
        waktu: new Date().toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})
    };

    saveData(data);
    this.reset();
});

// 5. FUNGSI SIMPAN & HAPUS LOCAL STORAGE
function saveData(data) {
    let list = JSON.parse(localStorage.getItem('db_nota')) || [];
    list.push(data);
    localStorage.setItem('db_nota', JSON.stringify(list));
    loadData();
}

function deleteData(id) {
    if (confirm("Hapus data ini secara permanen?")) {
        let list = JSON.parse(localStorage.getItem('db_nota')) || [];
        list = list.filter(item => item.id !== id);
        localStorage.setItem('db_nota', JSON.stringify(list));
        loadData();
    }
}

// 6. TAMPILKAN DATA KE TABEL
function loadData() {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;
    tabel.innerHTML = '';
    
    let list = JSON.parse(localStorage.getItem('db_nota')) || [];
    
    // Sortir data terbaru di atas
    list.reverse().forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'new-row';
        row.innerHTML = `
            <td class="text-center fw-bold">${index + 1}</td>
            <td><span class="badge bg-primary px-3">${item.kode}-${item.shift}</span></td>
            <td>${item.deskripsi}</td>
            <td><span class="badge ${item.shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">${item.shift}</span></td>
            <td class="text-center fw-bold">${item.jumlah}</td>
            <td><small class="text-muted">${item.waktu}</small></td>
            <td class="text-center action-col">
                ${userRole === 'admin' ? `<button onclick="deleteData(${item.id})" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>` : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

// 7. EXPORT EXCEL
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_nota')) || [];
    if (list.length === 0) return alert("Data kosong!");

    const excelData = list.map((item, i) => ({
        "No": i + 1,
        "Kode Nota": `${item.kode}-${item.shift}`,
        "Deskripsi": item.deskripsi,
        "Shift": item.shift,
        "Jumlah": item.jumlah,
        "Waktu Input": item.waktu
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Nota");
    XLSX.writeFile(wb, `Laporan_Nota_AliAkatiri.xlsx`);
}
