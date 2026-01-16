/* index.js - FINAL VERSION (Ali Akatiri) */

// 1. KEAMANAN & PROTEKSI HALAMAN
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const userRole = sessionStorage.getItem('role');

// Jika user biasa, sembunyikan form input
if (userRole === 'user') {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'none';
}

// 2. INITIAL LOADING
document.addEventListener('DOMContentLoaded', () => {
    // Set default tanggal hari ini pada form
    const inputTgl = document.getElementById('tanggalNota');
    if (inputTgl) inputTgl.value = new Date().toISOString().split('T')[0];

    loadData();

    // Event listener untuk pencarian real-time
    const searchInput = document.getElementById('cariData');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            loadData(e.target.value.toLowerCase());
        });
    }
});

// 3. FUNGSI LOGOUT
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// 4. LOGIKA SIMPAN DATA
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const select = document.getElementById('kodeJenis');
        const qtyValue = parseInt(document.getElementById('jumlah').value) || 0;

        const dataBaru = {
            id: Date.now(),
            tglNota: document.getElementById('tanggalNota').value,
            kode: select.value,
            deskripsi: select.options[select.selectedIndex].text,
            shift: document.getElementById('shift').value,
            jumlah: qtyValue
        };

        // Simpan ke LocalStorage
        let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
        db.push(dataBaru);
        localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

        // Notifikasi Sukses
        Swal.fire({
            icon: 'success',
            title: 'Data Berhasil Disimpan',
            showConfirmButton: false,
            timer: 1000
        });

        // Reset Form
        this.reset();
        document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
        
        loadData(); // Refresh tampilan
    });
}

// 5. FUNGSI RENDER DATA & HITUNG STATISTIK
function loadData(keyword = "") {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    tabel.innerHTML = '';

    // --- LOGIKA HITUNG STATISTIK ---
    const totalNota = list.length;
    const totalPagi = list.filter(i => i.shift === 'PAGI').length;
    const totalMalam = list.filter(i => i.shift === 'MALAM').length;
    
    // Hitung Total Seluruh Unit (Sum Qty)
    const totalSeluruhQty = list.reduce((acc, curr) => acc + (parseInt(curr.jumlah) || 0), 0);

    // Update Angka di Dashboard
    document.getElementById('statTotal').innerText = totalNota;
    document.getElementById('statPagi').innerText = totalPagi;
    document.getElementById('statMalam').innerText = totalMalam;
    document.getElementById('statTotalQty').innerText = totalSeluruhQty;

    // --- LOGIKA FILTER PENCARIAN ---
    let filtered = list.filter(item => 
        item.kode.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword) ||
        item.tglNota.includes(keyword)
    );

    // Tampilkan data (Urutan terbaru di atas)
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
                `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0 border-0 bg-transparent">
                    <i class="fas fa-trash-alt"></i>
                </button>` 
                : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

// 6. FUNGSI HAPUS DATA
function deleteData(id) {
    Swal.fire({
        title: 'Hapus data nota?',
        text: "Tindakan ini tidak dapat dibatalkan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            list = list.filter(item => item.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(list));
            
            loadData(); // Refresh tabel
            
            Swal.fire('Terhapus!', 'Data telah dihapus dari sistem.', 'success');
        }
    });
}

// 7. EXPORT KE EXCEL
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    if (list.length === 0) {
        Swal.fire('Data Kosong', 'Tidak ada data untuk di-export.', 'info');
        return;
    }

    // Format data untuk excel agar lebih rapi
    const dataExcel = list.map((item, index) => ({
        No: index + 1,
        Tanggal: item.tglNota,
        Kode: item.kode,
        Deskripsi: item.deskripsi,
        Shift: item.shift,
        Qty: item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan_Nota");
    XLSX.writeFile(wb, `Laporan_Nota_AliAkatiri_${new Date().toLocaleDateString()}.xlsx`);
}
