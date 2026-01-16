// 1. KEAMANAN SESSION
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}
const userRole = sessionStorage.getItem('role');

// 2. INITIAL LOADING
document.addEventListener('DOMContentLoaded', () => {
    // Memastikan elemen ada sebelum diakses untuk mencegah error console
    const adminPanel = document.getElementById('adminPanel');
    if (userRole === 'user' && adminPanel) {
        adminPanel.style.display = 'none';
    }

    const inputTgl = document.getElementById('tanggalNota');
    if (inputTgl) {
        inputTgl.value = new Date().toISOString().split('T')[0];
    }

    loadData();

    const searchInput = document.getElementById('cariData');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => loadData(e.target.value.toLowerCase()));
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
        const jumlahInput = document.getElementById('jumlah');
        
        // Validasi agar tidak ada data kosong terinput
        if (!select.value || !jumlahInput.value || jumlahInput.value <= 0) {
            Swal.fire('Error', 'Harap isi jenis perbaikan dan jumlah qty dengan benar!', 'error');
            return;
        }

        const dataBaru = {
            id: Date.now(),
            tglNota: document.getElementById('tanggalNota').value,
            kode: select.value,
            deskripsi: select.options[select.selectedIndex].text,
            shift: document.getElementById('shift').value,
            jumlah: parseInt(jumlahInput.value) || 0
        };

        let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
        db.push(dataBaru);
        localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

        Swal.fire({ icon: 'success', title: 'Data Disimpan', showConfirmButton: false, timer: 1000 });
        this.reset();
        document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
        loadData();
    });
}

// 5. FUNGSI LOAD DATA & HITUNG TOTAL (DIPERBAIKI)
function loadData(keyword = "") {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return; // Mencegah error jika tabel tidak ditemukan

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    tabel.innerHTML = '';

    // Hitung Statistik Utama
    const totalNota = list.length;
    const totalPagi = list.filter(i => i.shift === 'PAGI').length;
    const totalMalam = list.filter(i => i.shift === 'MALAM').length;
    
    // Perbaikan Logika: Penjumlahan seluruh Qty
    const totalSeluruhQty = list.reduce((acc, curr) => acc + (parseInt(curr.jumlah) || 0), 0);

    // Update Dashboard (Gunakan conditional check untuk mencegah error null)
    if(document.getElementById('statTotal')) document.getElementById('statTotal').innerText = totalNota;
    if(document.getElementById('statPagi')) document.getElementById('statPagi').innerText = totalPagi;
    if(document.getElementById('statMalam')) document.getElementById('statMalam').innerText = totalMalam;
    if(document.getElementById('statTotalQty')) document.getElementById('statTotalQty').innerText = totalSeluruhQty;

    // Filter & Render Tabel
    let filtered = list.filter(item => 
        item.kode.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword)
    );

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
            <td class="action-col text-center">
                ${userRole === 'admin' ? 
                `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0 border-0">
                    <i class="fas fa-trash-alt"></i>
                </button>` : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

// 6. FUNGSI HAPUS DATA
function deleteData(id) {
    Swal.fire({
        title: 'Hapus data nota?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            list = list.filter(item => item.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(list));
            loadData();
            Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        }
    });
}

// 7. EXCEL EXPORT
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    if (list.length === 0) return Swal.fire('Data Kosong', '', 'info');
    const ws = XLSX.utils.json_to_sheet(list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "Laporan_Ali_Akatiri.xlsx");
}
