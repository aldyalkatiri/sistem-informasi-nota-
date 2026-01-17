/**
 * index.js - VERSI SINKRON GAMBAR & EXCEL FILTER
 */

if (sessionStorage.getItem('isLoggedIn') !== 'true') window.location.href = 'index.html';
const userRole = sessionStorage.getItem('role');

document.addEventListener('DOMContentLoaded', () => {
    if (userRole === 'user') document.getElementById('adminPanel').style.display = 'none';
    const now = new Date();
    document.getElementById('tanggalNota').value = now.toISOString().split('T')[0];
    loadData();
});

function logout() { sessionStorage.clear(); window.location.href = 'index.html'; }

function resetFilter() {
    document.getElementById('filterTglMulai').value = '';
    document.getElementById('filterTglSelesai').value = '';
    document.getElementById('cariData').value = '';
    loadData();
}

// Konversi Gambar ke Base64 agar bisa disimpan
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.getElementById('notaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;

    let fotoBase64 = "";
    const fileInput = document.getElementById('fotoNota');
    if (fileInput.files.length > 0) {
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

    Swal.fire({ icon: 'success', title: 'Data Berhasil Disimpan', showConfirmButton: false, timer: 1000 });
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    btn.disabled = false;
    loadData();
});

function loadData() {
    const tabel = document.getElementById('tabelNota');
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    const tglMulai = document.getElementById('filterTglMulai').value;
    const tglSelesai = document.getElementById('filterTglSelesai').value;
    const kataKunci = document.getElementById('cariData').value.toLowerCase();
    const hariIni = new Date().toISOString().split('T')[0];

    // LOGIKA FILTER
    let filtered = list.filter(item => {
        let matchesDate = (tglMulai && tglSelesai) ? (item.tglNota >= tglMulai && item.tglNota <= tglSelesai) : (item.tglNota === hariIni);
        let matchesKey = item.kode.toLowerCase().includes(kataKunci) || item.deskripsi.toLowerCase().includes(kataKunci);
        return matchesDate && matchesKey;
    });

    // Update Statistik
    document.getElementById('statTotal').innerText = filtered.length;
    document.getElementById('statPagi').innerText = filtered.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = filtered.filter(i => i.shift === 'MALAM').length;
    document.getElementById('statTotalQty').innerText = filtered.reduce((a, b) => a + b.jumlah, 0);

    tabel.innerHTML = '';
    filtered.sort((a,b) => b.id - a.id).forEach((item, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${item.tglNota}</td>
            <td><span class="badge bg-primary">${item.kode}</span></td>
            <td class="text-start">${item.deskripsi}</td>
            <td><span class="badge ${item.shift==='PAGI'?'bg-warning text-dark':'bg-dark'}">${item.shift}</span></td>
            <td class="fw-bold">${item.jumlah}</td>
            <td>${item.foto ? `<button onclick="viewFoto('${item.foto}')" class="btn btn-sm btn-info text-white"><i class="fas fa-image"></i></button>` : '-'}</td>
            <td>${userRole==='admin'?`<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0"><i class="fas fa-trash-alt"></i></button>`:'-'}</td>
        </tr>`;
        tabel.innerHTML += row;
    });
}

function viewFoto(img) {
    Swal.fire({ imageUrl: img, imageAlt: 'Bukti Foto', confirmButtonText: 'Tutup' });
}

function deleteData(id) {
    Swal.fire({ title: 'Hapus data?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' }).then((res) => {
        if (res.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            db = db.filter(i => i.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(db));
            loadData();
        }
    });
}

// --- PERBAIKAN FITUR EXCEL (HANYA YANG DI-FILTER) ---
function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const tglMulai = document.getElementById('filterTglMulai').value;
    const tglSelesai = document.getElementById('filterTglSelesai').value;
    const hariIni = new Date().toISOString().split('T')[0];

    // Ambil data sesuai filter yang sedang aktif di layar
    let dataExport = list.filter(item => {
        return (tglMulai && tglSelesai) ? (item.tglNota >= tglMulai && item.tglNota <= tglSelesai) : (item.tglNota === hariIni);
    });

    if (dataExport.length === 0) return Swal.fire('Data Kosong', 'Tidak ada data pada filter ini', 'info');

    const cleanData = dataExport.map((item, i) => ({
        "No": i + 1, "Tanggal": item.tglNota, "Kode": item.kode, "Deskripsi": item.deskripsi, "Shift": item.shift, "Qty": item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_Nota_${tglMulai || hariIni}.xlsx`);
}
