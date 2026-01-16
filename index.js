// 1. PROTEKSI LOGIN
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

// 2. INISIALISASI
document.addEventListener('DOMContentLoaded', () => {
    const tglInput = document.getElementById('tanggalNota');
    if(tglInput) tglInput.value = new Date().toISOString().split('T')[0];
    loadData();

    // Event Listener untuk Pencarian
    document.getElementById('cariData')?.addEventListener('input', function(e) {
        loadData(e.target.value.toLowerCase());
    });
});

// 3. SIMPAN DATA (SWEETALERT2)
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const select = document.getElementById('kodeJenis');
    const data = {
        id: Date.now(),
        tglNota: document.getElementById('tanggalNota').value,
        kode: select.value,
        deskripsi: select.options[select.selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: document.getElementById('jumlah').value
    };

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    list.push(data);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(list));
    
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data nota telah disimpan.',
        timer: 1500,
        showConfirmButton: false
    });

    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    loadData();
});

// 4. LOAD & RENDER DATA + STATISTIK
function loadData(keyword = "") {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;
    tabel.innerHTML = '';
    
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    // Update Statistik
    document.getElementById('statTotal').innerText = list.length;
    document.getElementById('statPagi').innerText = list.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = list.filter(i => i.shift === 'MALAM').length;

    // Filter jika ada pencarian
    let filtered = list.filter(item => 
        item.kode.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword) ||
        item.tglNota.includes(keyword)
    );

    filtered.reverse().forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td class="fw-bold">${item.tglNota}</td>
            <td><span class="badge bg-primary">${item.kode}-${item.shift}</span></td>
            <td>${item.deskripsi}</td>
            <td><span class="badge ${item.shift === 'PAGI' ? 'badge-warning text-dark' : 'badge-dark'}">${item.shift}</span></td>
            <td class="text-center fw-bold">${item.jumlah}</td>
            <td class="text-center action-col">
                ${userRole === 'admin' ? `<button onclick="deleteData(${item.id})" class="btn btn-outline-danger btn-sm border-0"><i class="fas fa-trash"></i></button>` : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

// 5. HAPUS DATA (SWEETALERT2)
function deleteData(id) {
    Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
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
            Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        }
    });
}

// 6. EXPORT EXCEL
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    if (list.length === 0) return Swal.fire('Opps!', 'Tidak ada data untuk di-export.', 'info');

    const dataExcel = list.map((item, i) => ({
        "No": i + 1,
        "Tanggal Nota": item.tglNota,
        "Kode Nota": `${item.kode}-${item.shift}`,
        "Deskripsi": item.deskripsi,
        "Shift": item.shift,
        "Jumlah": item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Ali Akatiri");
    XLSX.writeFile(wb, `Laporan_Sistem_Nota_${Date.now()}.xlsx`);
}
