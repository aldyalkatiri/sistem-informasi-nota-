/* index.js - FINAL SINKRONISASI 2026 */

// 1. KEAMANAN & CEK LOGIN
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}
const userRole = sessionStorage.getItem('role');

document.addEventListener('DOMContentLoaded', () => {
    // Sembunyikan form input jika bukan admin
    if (userRole === 'user' && document.getElementById('adminPanel')) {
        document.getElementById('adminPanel').style.display = 'none';
    }

    // Default Tanggal Hari Ini
    const tglInput = document.getElementById('tanggalNota');
    if (tglInput) tglInput.value = new Date().toISOString().split('T')[0];

    loadData();

    // Event Search
    document.getElementById('cariData')?.addEventListener('input', (e) => {
        loadData(e.target.value.toLowerCase());
    });
});

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// 2. SIMPAN DATA NOTA
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const select = document.getElementById('kodeJenis');
    const qtyInput = document.getElementById('jumlah');

    const dataBaru = {
        id: Date.now(),
        tglNota: document.getElementById('tanggalNota').value,
        kode: select.value,
        deskripsi: select.options[select.selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: parseInt(qtyInput.value) || 0
    };

    let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    db.push(dataBaru);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

    Swal.fire({ icon: 'success', title: 'Tersimpan!', showConfirmButton: false, timer: 800 });
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    loadData();
});

// 3. LOAD DATA (LOGIKA AUTO-RESET PER HARI)
function loadData(keyword = "") {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const hariIni = new Date().toISOString().split('T')[0];

    // FILTER HANYA DATA HARI INI UNTUK TAMPILAN DASHBOARD
    let dataHariIni = list.filter(item => item.tglNota === hariIni);

    // HITUNG STATISTIK (Hanya Berdasarkan Data Hari Ini)
    const totalNota = dataHariIni.length;
    const totalPagi = dataHariIni.filter(i => i.shift === 'PAGI').length;
    const totalMalam = dataHariIni.filter(i => i.shift === 'MALAM').length;
    const totalQty = dataHariIni.reduce((acc, item) => acc + item.jumlah, 0);

    // Tampilkan ke Dashboard
    document.getElementById('statTotal').innerText = totalNota;
    document.getElementById('statPagi').innerText = totalPagi;
    document.getElementById('statMalam').innerText = totalMalam;
    document.getElementById('statTotalQty').innerText = totalQty;

    tabel.innerHTML = '';

    // Filter Pencarian
    let filtered = dataHariIni.filter(item => 
        item.kode.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword)
    );

    // Render Baris Tabel
    filtered.reverse().forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted small">${filtered.length - index}</td>
            <td class="fw-bold">${item.tglNota}</td>
            <td><span class="badge bg-primary px-3">${item.kode}</span></td>
            <td class="text-start">${item.deskripsi}</td>
            <td>
                <span class="badge ${item.shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">
                    ${item.shift}
                </span>
            </td>
            <td class="fw-bold">${item.jumlah}</td>
            <td class="action-col">
                ${userRole === 'admin' ? 
                `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0"><i class="fas fa-trash-alt"></i></button>` 
                : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

// 4. HAPUS DATA
function deleteData(id) {
    Swal.fire({
        title: 'Hapus data?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus'
    }).then((result) => {
        if (result.isConfirmed) {
            let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            localStorage.setItem('db_ali_akatiri', JSON.stringify(list.filter(i => i.id !== id)));
            loadData();
        }
    });
}

// 5. EXPORT EXCEL (NOMOR URUT 1, 2, 3...)
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    if (list.length === 0) return Swal.fire('Data Kosong', '', 'info');

    // Mengubah ID panjang menjadi Nomor Urut untuk Excel
    const formatExcel = list.map((item, index) => ({
        "No": index + 1,
        "Tanggal": item.tglNota,
        "Kode Nota": item.kode,
        "Deskripsi": item.deskripsi,
        "Shift": item.shift,
        "Jumlah Qty": item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(formatExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekapan_Nota");
    XLSX.writeFile(wb, `Laporan_Nota_Ali_Akatiri_${new Date().toISOString().split('T')[0]}.xlsx`);
}
