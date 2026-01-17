/**
 * index.js - VERSI MUTAKHIR 2026
 * Sistem Informasi Nota Ali Akatiri
 * Fitur: Lampiran Foto, Filter Riwayat, & Export Excel Cerdas
 */

// --- 1. KEAMANAN SESI ---
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}
const userRole = sessionStorage.getItem('role');

// --- 2. INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // Sembunyikan panel input jika bukan admin
    if (userRole === 'user') {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'none';
    }

    // Set tanggal default form ke hari ini
    const tglInput = document.getElementById('tanggalNota');
    if (tglInput) {
        tglInput.value = new Date().toISOString().split('T')[0];
    }

    loadData();
});

// --- 3. FUNGSI LOGOUT & RESET ---
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function resetFilter() {
    document.getElementById('filterTglMulai').value = '';
    document.getElementById('filterTglSelesai').value = '';
    document.getElementById('cariData').value = '';
    loadData(); // Otomatis kembali ke data hari ini
}

// --- 4. PROSES UNGGAH GAMBAR (CONVERT TO BASE64) ---
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// --- 5. SIMPAN DATA BARU ---
document.getElementById('notaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    // Ambil data foto jika ada
    let fotoBase64 = "";
    const fileInput = document.getElementById('fotoNota');
    if (fileInput && fileInput.files.length > 0) {
        // Validasi ukuran file (max 2MB)
        if (fileInput.files[0].size > 2 * 1024 * 1024) {
            Swal.fire('File Terlalu Besar', 'Maksimal ukuran foto adalah 2MB', 'error');
            btn.disabled = false;
            btn.innerText = 'SIMPAN DATA KE SISTEM';
            return;
        }
        fotoBase64 = await getBase64(fileInput.files[0]);
    }

    const dataBaru = {
        id: Date.now(),
        tglNota: document.getElementById('tanggalNota').value,
        kode: document.getElementById('kodeJenis').value,
        deskripsi: document.getElementById('kodeJenis').options[document.getElementById('kodeJenis').selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: parseInt(document.getElementById('jumlah').value) || 0,
        foto: fotoBase64
    };

    let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    db.push(dataBaru);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data Nota telah disimpan', timer: 1000, showConfirmButton: false });
    
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    btn.disabled = false;
    btn.innerText = 'SIMPAN DATA KE SISTEM';
    loadData();
});

// --- 6. MUAT & FILTER DATA ---
function loadData() {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    const tglMulai = document.getElementById('filterTglMulai').value;
    const tglSelesai = document.getElementById('filterTglSelesai').value;
    const kataKunci = document.getElementById('cariData').value.toLowerCase();
    const hariIni = new Date().toISOString().split('T')[0];

    // Logika Filter Pintar
    let filtered = list.filter(item => {
        // Filter Tanggal: Jika input kosong, tampilkan hari ini saja
        let matchesDate = (tglMulai && tglSelesai) 
            ? (item.tglNota >= tglMulai && item.tglNota <= tglSelesai) 
            : (item.tglNota === hariIni);
            
        // Filter Kata Kunci (Kode atau Deskripsi)
        let matchesKey = item.kode.toLowerCase().includes(kataKunci) || 
                         item.deskripsi.toLowerCase().includes(kataKunci);
        
        return matchesDate && matchesKey;
    });

    // Update Statistik Berdasarkan Data yang Tampil
    document.getElementById('statTotal').innerText = filtered.length;
    document.getElementById('statPagi').innerText = filtered.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = filtered.filter(i => i.shift === 'MALAM').length;
    document.getElementById('statTotalQty').innerText = filtered.reduce((a, b) => a + (b.jumlah || 0), 0);

    // Render ke Tabel
    tabel.innerHTML = '';
    filtered.sort((a, b) => b.id - a.id).forEach((item, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td class="fw-bold">${item.tglNota}</td>
                <td><span class="badge bg-primary px-3">${item.kode}</span></td>
                <td class="text-start small">${item.deskripsi}</td>
                <td><span class="badge ${item.shift === 'PAGI' ? 'bg-warning text-dark' : 'bg-dark text-white'}">${item.shift}</span></td>
                <td class="fw-bold">${item.jumlah}</td>
                <td>
                    ${item.foto ? `<button onclick="viewFoto('${item.foto}')" class="btn btn-sm btn-info text-white"><i class="fas fa-image"></i></button>` : '-'}
                </td>
                <td class="action-col">
                    ${userRole === 'admin' ? `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0"><i class="fas fa-trash-alt"></i></button>` : '-'}
                </td>
            </tr>
        `;
        tabel.insertAdjacentHTML('beforeend', row);
    });

    if (filtered.length === 0) {
        tabel.innerHTML = `<tr><td colspan="8" class="py-4 text-muted small">Tidak ada data untuk periode ini.</td></tr>`;
    }
}

// --- 7. LIHAT FOTO ---
function viewFoto(imgData) {
    Swal.fire({
        imageUrl: imgData,
        imageAlt: 'Bukti Foto Nota',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#1e3a8a'
    });
}

// --- 8. HAPUS DATA ---
function deleteData(id) {
    Swal.fire({
        title: 'Hapus data ini?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            db = db.filter(i => i.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(db));
            loadData();
            Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        }
    });
}

// --- 9. EXPORT EXCEL CERDAS (HANYA DATA YANG TAMPIL) ---
function exportToExcel() {
    // Jalankan filter ulang secara internal agar data excel sama persis dengan tabel
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const tglMulai = document.getElementById('filterTglMulai').value;
    const tglSelesai = document.getElementById('filterTglSelesai').value;
    const hariIni = new Date().toISOString().split('T')[0];

    let dataExport = list.filter(item => {
        return (tglMulai && tglSelesai) 
            ? (item.tglNota >= tglMulai && item.tglNota <= tglSelesai) 
            : (item.tglNota === hariIni);
    });

    if (dataExport.length === 0) {
        return Swal.fire('Gagal Export', 'Tidak ada data pada periode ini untuk diunduh.', 'warning');
    }

    const cleanData = dataExport.map((item, i) => ({
        "No": i + 1,
        "Tanggal": item.tglNota,
        "Kode": item.kode,
        "Jenis Perbaikan": item.deskripsi,
        "Shift": item.shift,
        "Jumlah (Unit)": item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekapan Nota");
    
    const fileName = `Laporan_Nota_Ali_Akatiri_${tglMulai || hariIni}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
