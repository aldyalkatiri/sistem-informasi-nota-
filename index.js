/**
 * index.js - FINAL FULL VERSION (2026)
 * Sistem Informasi Nota Ali Akatiri
 * Fitur: Daily Auto-Reset, Penjumlahan Qty Akurat, Export Excel Rapi
 */

// --- 1. KEAMANAN & CEK SESI ---
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}
const userRole = sessionStorage.getItem('role');

// --- 2. INITIAL LOADING (SAAT HALAMAN DIBUKA) ---
document.addEventListener('DOMContentLoaded', () => {
    // Sembunyikan Panel Input jika user adalah 'user'
    const adminPanel = document.getElementById('adminPanel');
    if (userRole === 'user' && adminPanel) {
        adminPanel.style.display = 'none';
    }

    // Set Tanggal Otomatis ke Hari Ini (Zona Waktu Lokal)
    const tglInput = document.getElementById('tanggalNota');
    if (tglInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        tglInput.value = `${year}-${month}-${day}`;
    }

    // Muat Data
    loadData();

    // Fitur Pencarian Real-time
    const searchInput = document.getElementById('cariData');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            loadData(e.target.value.toLowerCase());
        });
    }
});

// --- 3. FUNGSI LOGOUT ---
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// --- 4. LOGIKA SIMPAN DATA ---
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const select = document.getElementById('kodeJenis');
        const qtyInput = document.getElementById('jumlah');
        const shiftInput = document.getElementById('shift');
        const tglInput = document.getElementById('tanggalNota');

        // Validasi Dasar
        if (!select.value || !qtyInput.value || qtyInput.value <= 0) {
            Swal.fire('Input Salah', 'Pilih jenis perbaikan dan isi jumlah unit dengan benar!', 'error');
            return;
        }

        const dataBaru = {
            id: Date.now(), // ID Unik untuk keperluan hapus
            tglNota: tglInput.value,
            kode: select.value,
            deskripsi: select.options[select.selectedIndex].text,
            shift: shiftInput.value,
            jumlah: parseInt(qtyInput.value) || 0
        };

        // Ambil DB lama, tambahkan data baru, simpan kembali
        let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
        db.push(dataBaru);
        localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

        // Notifikasi Berhasil
        Swal.fire({
            icon: 'success',
            title: 'Data Berhasil Disimpan',
            showConfirmButton: false,
            timer: 800
        });

        // Reset Form & Refresh Tampilan
        this.reset();
        tglInput.value = new Date().toISOString().split('T')[0];
        loadData();
    });
}

// --- 5. FUNGSI LOAD DATA (LOGIKA AUTO-RESET PER HARI) ---
function loadData(keyword = "") {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    // Penentuan Tanggal Hari Ini (Format YYYY-MM-DD)
    const now = new Date();
    const hariIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // FILTER: Hanya tampilkan data yang tanggalnya = hari ini
    let dataHariIni = list.filter(item => item.tglNota === hariIni);

    // HITUNG STATISTIK (Berdasarkan Data Hari Ini)
    const totalNota = dataHariIni.length;
    const totalPagi = dataHariIni.filter(i => i.shift === 'PAGI').length;
    const totalMalam = dataHariIni.filter(i => i.shift === 'MALAM').length;
    const totalQty = dataHariIni.reduce((acc, curr) => acc + (curr.jumlah || 0), 0);

    // Update Elemen Statistik ke Dashboard
    if(document.getElementById('statTotal')) document.getElementById('statTotal').innerText = totalNota;
    if(document.getElementById('statPagi')) document.getElementById('statPagi').innerText = totalPagi;
    if(document.getElementById('statMalam')) document.getElementById('statMalam').innerText = totalMalam;
    if(document.getElementById('statTotalQty')) document.getElementById('statTotalQty').innerText = totalQty;

    // Bersihkan Tabel Sebelum Render
    tabel.innerHTML = '';

    // Filter Pencarian jika ada keyword
    let filtered = dataHariIni.filter(item => 
        item.kode.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword)
    );

    // Render Data ke Baris Tabel (Data terbaru di atas)
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
            <td class="fw-bold text-dark">${item.jumlah}</td>
            <td class="action-col">
                ${userRole === 'admin' ? 
                `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0 border-0 shadow-none">
                    <i class="fas fa-trash-alt"></i>
                </button>` : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

// --- 6. FUNGSI HAPUS DATA ---
function deleteData(id) {
    Swal.fire({
        title: 'Hapus data ini?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            db = db.filter(item => item.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(db));
            loadData();
            Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        }
    });
}

// --- 7. EXPORT KE EXCEL (RAPID & BERSIH) ---
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    if (list.length === 0) {
        Swal.fire('Data Kosong', 'Tidak ada data untuk di-export.', 'info');
        return;
    }

    // Mapping Data agar rapi di Excel (Ganti ID dengan Nomor Urut)
    const dataExcel = list.map((item, index) => ({
        "No": index + 1,
        "Tanggal": item.tglNota,
        "Kode": item.kode,
        "Deskripsi": item.deskripsi,
        "Shift": item.shift,
        "Qty (Unit)": item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekapan_Nota");
    
    // Nama file dinamis
    const fileName = `Laporan_Nota_Ali_Akatiri_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
