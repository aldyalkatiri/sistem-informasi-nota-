/**
 * index.js - ULTIMATE FINAL VERSION 2026
 * Sistem Informasi Nota Ali Akatiri
 * Fitur: Auto-Chart, Image Upload, Smart Filter, & Role Security
 */

// --- 1. KEAMANAN & KONFIGURASI ---
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const userRole = sessionStorage.getItem('role');
let myChart = null; // Menyimpan instance grafik

// --- 2. INITIAL LOADING ---
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan Nama User di Navbar
    const displayUser = document.getElementById('displayUser');
    if (displayUser) displayUser.innerText = `Login sebagai: ${userRole.toUpperCase()}`;

    // Sembunyikan Panel Input jika bukan admin
    if (userRole === 'user') {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'none';
    }

    // Set tanggal default ke hari ini (WIB/Local)
    const tglInput = document.getElementById('tanggalNota');
    if (tglInput) {
        tglInput.value = new Date().toISOString().split('T')[0];
    }

    loadData();
});

// --- 3. FUNGSI LOGOUT ---
function logout() {
    Swal.fire({
        title: 'Logout?',
        text: "Sesi Anda akan diakhiri.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1e3a8a',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

// --- 4. LOGIKA GRAFIK (CHART.JS) ---
function renderChart(filteredData) {
    const ctx = document.getElementById('chartPerbaikan');
    if (!ctx) return;

    // Kategori Kode
    const labels = ['SL', 'SD', 'SI', 'SX', 'SY', 'SG', 'ST'];
    
    // Hitung Qty per Kode dari data yang sedang difilter
    const dataValues = labels.map(label => {
        return filteredData
            .filter(item => item.kode === label)
            .reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0);
    });

    if (myChart) {
        myChart.destroy(); // Hapus grafik lama sebelum update
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unit Perbaikan',
                data: dataValues,
                backgroundColor: 'rgba(13, 202, 240, 0.5)',
                borderColor: '#0dcaf0',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#888' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#888' }
                }
            }
        }
    });
}

// --- 5. FUNGSI GAMBAR (BASE64) ---
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// --- 6. SIMPAN DATA ---
document.getElementById('notaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;

    // Ambil file foto
    let fotoBase64 = "";
    const fileInput = document.getElementById('fotoNota');
    if (fileInput.files.length > 0) {
        if (fileInput.files[0].size > 2 * 1024 * 1024) {
            Swal.fire('Error', 'Ukuran foto maksimal 2MB', 'error');
            btn.disabled = false;
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
        jumlah: parseInt(document.getElementById('jumlah').value) || 1,
        foto: fotoBase64
    };

    let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    db.push(dataBaru);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

    Swal.fire({ icon: 'success', title: 'Data Tersimpan!', showConfirmButton: false, timer: 1000 });
    
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    btn.disabled = false;
    loadData();
});

// --- 7. LOAD & FILTER DATA (UTAMA) ---
function loadData() {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    const tglMulai = document.getElementById('filterTglMulai').value;
    const tglSelesai = document.getElementById('filterTglSelesai').value;
    const kataKunci = document.getElementById('cariData').value.toLowerCase();
    const hariIni = new Date().toISOString().split('T')[0];

    // Logika Filter
    let filtered = list.filter(item => {
        let matchesDate = (tglMulai && tglSelesai) 
            ? (item.tglNota >= tglMulai && item.tglNota <= tglSelesai) 
            : (item.tglNota === hariIni);
            
        let matchesKey = item.kode.toLowerCase().includes(kataKunci) || 
                         item.deskripsi.toLowerCase().includes(kataKunci);
        
        return matchesDate && matchesKey;
    });

    // Update Statistik
    document.getElementById('statTotal').innerText = filtered.length;
    document.getElementById('statPagi').innerText = filtered.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = filtered.filter(i => i.shift === 'MALAM').length;
    document.getElementById('statTotalQty').innerText = filtered.reduce((a, b) => a + b.jumlah, 0);

    // Update Grafik
    renderChart(filtered);

    // Render Tabel
    tabel.innerHTML = '';
    filtered.sort((a, b) => b.id - a.id).forEach((item, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td class="small">${item.tglNota}</td>
                <td><span class="badge bg-primary px-3">${item.kode}</span></td>
                <td class="text-start small">${item.deskripsi}</td>
                <td>
                    <span class="badge ${item.shift === 'PAGI' ? 'bg-warning text-dark' : 'bg-dark text-white'} px-3">
                        ${item.shift}
                    </span>
                </td>
                <td class="fw-bold text-info">${item.jumlah}</td>
                <td>
                    ${item.foto ? `<button onclick="viewFoto('${item.foto}')" class="btn btn-sm btn-info text-dark p-1 px-2"><i class="fas fa-image"></i></button>` : '<span class="text-muted">-</span>'}
                </td>
                <td>
                    ${userRole === 'admin' ? `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0 border-0"><i class="fas fa-trash-alt"></i></button>` : '-'}
                </td>
            </tr>
        `;
        tabel.insertAdjacentHTML('beforeend', row);
    });

    if (filtered.length === 0) {
        tabel.innerHTML = `<tr><td colspan="8" class="py-5 text-white-50 small">Tidak ada data untuk periode ini.</td></tr>`;
    }
}

// --- 8. FUNGSI PENDUKUNG ---
function resetFilter() {
    document.getElementById('filterTglMulai').value = '';
    document.getElementById('filterTglSelesai').value = '';
    document.getElementById('cariData').value = '';
    loadData();
}

function viewFoto(base64) {
    Swal.fire({
        imageUrl: base64,
        imageAlt: 'Bukti Foto',
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: 'Tutup'
    });
}

function deleteData(id) {
    Swal.fire({
        title: 'Hapus data?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus'
    }).then((result) => {
        if (result.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            db = db.filter(i => i.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(db));
            loadData();
        }
    });
}

function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const tglMulai = document.getElementById('filterTglMulai').value;
    const tglSelesai = document.getElementById('filterTglSelesai').value;
    const hariIni = new Date().toISOString().split('T')[0];

    // Filter data sesuai apa yang tampil di layar
    let dataExport = list.filter(item => {
        return (tglMulai && tglSelesai) 
            ? (item.tglNota >= tglMulai && item.tglNota <= tglSelesai) 
            : (item.tglNota === hariIni);
    });

    if (dataExport.length === 0) {
        Swal.fire('Data Kosong', 'Tidak ada data untuk diexport pada periode ini.', 'info');
        return;
    }

    const dataExcel = dataExport.map((item, i) => ({
        "No": i + 1,
        "Tanggal": item.tglNota,
        "Kode": item.kode,
        "Keterangan": item.deskripsi,
        "Shift": item.shift,
        "Jumlah Unit": item.jumlah
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan_Nota");
    
    const fileName = `Laporan_Nota_${tglMulai || hariIni}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
