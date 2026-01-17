/**
 * index.js - FINAL FULL VERSION (2026)
 * Sistem Informasi Nota Ali Akatiri
 * Fitur: Smart Filter Riwayat, Daily Auto-Reset, & Statistik Dinamis
 */

// --- 1. KEAMANAN & CEK SESI ---
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}
const userRole = sessionStorage.getItem('role');

// --- 2. INITIAL LOADING ---
document.addEventListener('DOMContentLoaded', () => {
    // Sembunyikan Panel Input jika user bukan admin
    const adminPanel = document.getElementById('adminPanel');
    if (userRole === 'user' && adminPanel) {
        adminPanel.style.display = 'none';
    }

    // Set Tanggal Otomatis ke Hari Ini pada Form Input
    const tglInput = document.getElementById('tanggalNota');
    if (tglInput) {
        const now = new Date();
        tglInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // Muat Data Default (Hari Ini)
    loadData();

    // Event Search Real-time (Opsional jika ingin auto-filter saat mengetik)
    document.getElementById('cariData')?.addEventListener('input', (e) => {
        // Jika ingin filter otomatis saat mengetik, aktifkan baris bawah:
        // loadData();
    });
});

// --- 3. FUNGSI LOGOUT ---
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// --- 4. FUNGSI RESET FILTER ---
function resetFilter() {
    document.getElementById('filterTglMulai').value = '';
    document.getElementById('filterTglSelesai').value = '';
    document.getElementById('cariData').value = '';
    loadData(); // Akan kembali menampilkan data hari ini
}

// --- 5. LOGIKA SIMPAN DATA ---
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const select = document.getElementById('kodeJenis');
    const qtyInput = document.getElementById('jumlah');
    const shiftInput = document.getElementById('shift');
    const tglInput = document.getElementById('tanggalNota');

    const dataBaru = {
        id: Date.now(),
        tglNota: tglInput.value,
        kode: select.value,
        deskripsi: select.options[select.selectedIndex].text,
        shift: shiftInput.value,
        jumlah: parseInt(qtyInput.value) || 0
    };

    let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    db.push(dataBaru);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

    Swal.fire({ icon: 'success', title: 'Data Tersimpan!', showConfirmButton: false, timer: 800 });
    
    this.reset();
    tglInput.value = new Date().toISOString().split('T')[0];
    loadData();
});

// --- 6. FUNGSI MUAT DATA (SMART FILTER) ---
function loadData() {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    // Ambil nilai dari filter
    const tglMulai = document.getElementById('filterTglMulai').value;
    const tglSelesai = document.getElementById('filterTglSelesai').value;
    const kataKunci = document.getElementById('cariData').value.toLowerCase();

    // Ambil tanggal hari ini untuk default
    const now = new Date();
    const hariIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // --- PROSES FILTERING ---
    let filteredList = list.filter(item => {
        const tglItem = item.tglNota;
        
        // Cek Filter Tanggal
        let matchesDate = false;
        if (tglMulai && tglSelesai) {
            // Jika filter diisi: tampilkan dalam rentang
            matchesDate = (tglItem >= tglMulai && tglItem <= tglSelesai);
        } else {
            // Jika filter kosong: tampilkan data HARI INI saja (Daily Auto-Reset)
            matchesDate = (tglItem === hariIni);
        }

        // Cek Filter Kata Kunci
        const matchesKeyword = item.kode.toLowerCase().includes(kataKunci) || 
                               item.deskripsi.toLowerCase().includes(kataKunci);

        return matchesDate && matchesKeyword;
    });

    // --- UPDATE STATISTIK DINAMIS ---
    const totalQty = filteredList.reduce((acc, curr) => acc + (parseInt(curr.jumlah) || 0), 0);
    
    document.getElementById('statTotal').innerText = filteredList.length;
    document.getElementById('statPagi').innerText = filteredList.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = filteredList.filter(i => i.shift === 'MALAM').length;
    document.getElementById('statTotalQty').innerText = totalQty;

    // --- RENDER TABEL ---
    tabel.innerHTML = '';
    
    // Sort terbaru di atas
    filteredList.sort((a, b) => b.id - a.id).forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
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
                `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0 border-0 shadow-none">
                    <i class="fas fa-trash-alt"></i>
                </button>` : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });

    if (filteredList.length === 0) {
        tabel.innerHTML = `<tr><td colspan="7" class="py-4 text-muted small">Tidak ada data untuk periode ini.</td></tr>`;
    }
}

// --- 7. HAPUS DATA ---
function deleteData(id) {
    Swal.fire({
        title: 'Hapus data?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            db = db.filter(item => item.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(db));
            loadData();
        }
    });
}

// --- 8. EXPORT EXCEL ---
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    if (list.length === 0) return Swal.fire('Data Kosong', '', 'info');

    const dataExcel = list.map((item, index) => ({
        "No": index + 1,
        "Tanggal": item.tglNota,
        "Kode": item.kode,
        "Deskripsi": item.deskripsi,
        "Shift": item.shift,
        "Qty": item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekapan_Nota");
    XLSX.writeFile(wb, `Laporan_Nota_Ali_Akatiri.xlsx`);
}
