/**
 * index.js - FINAL CLEAN ENTERPRISE
 * Sistem Manajemen Nota Ali Akatiri
 */

// --- 1. KEAMANAN & ROLE CHECK ---
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const userRole = sessionStorage.getItem('role'); // admin, user, manager
const userName = sessionStorage.getItem('userName');
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan Info User di Navbar
    const displayUser = document.getElementById('displayUser');
    if (displayUser) displayUser.innerText = `${userName} (${userRole.toUpperCase()})`;

    // Logika Akses Navigasi & Panel
    const navMasalah = document.getElementById('navMasalah');
    const adminPanel = document.getElementById('adminPanel');

    // Pengaturan Tombol Nota Bermasalah (Hanya Admin & Manager Ali)
    if (userRole === 'admin' || userRole === 'manager') {
        if (navMasalah) navMasalah.classList.remove('d-none');
    }

    // Pengaturan Panel Input (Ali Alkatiri/Manager hanya memantau)
    if (userRole === 'manager') {
        if (adminPanel) adminPanel.style.display = 'none';
    } else {
        if (adminPanel) adminPanel.style.display = 'block';
    }

    // Default Tanggal Input ke Hari Ini
    const tglInput = document.getElementById('tanggalNota');
    if (tglInput) tglInput.value = new Date().toISOString().split('T')[0];

    loadData();
});

// --- 2. FUNGSI LOGOUT ---
function logout() {
    Swal.fire({
        title: 'Keluar dari Sistem?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Keluar'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

// --- 3. LOGIKA GRAFIK (CHART.JS) ---
function renderChart(filteredData) {
    const ctx = document.getElementById('chartPerbaikan');
    if (!ctx) return;

    const labels = ['SL', 'SD', 'SI', 'SX', 'SY', 'SG', 'ST'];
    const dataValues = labels.map(label => {
        return filteredData
            .filter(item => item.kode === label)
            .reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0);
    });

    if (myChart) { myChart.destroy(); }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Unit',
                data: dataValues,
                backgroundColor: '#2563eb',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// --- 4. SIMPAN DATA (LOCAL STORAGE) ---
document.getElementById('notaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;

    let fotoBase64 = "";
    const fileInput = document.getElementById('fotoNota');
    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        fotoBase64 = await new Promise(r => {
            reader.onload = () => r(reader.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    }

    const dataBaru = {
        id: Date.now(),
        penginput: userName,
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

    Swal.fire({ icon: 'success', title: 'Data Berhasil Disimpan', showConfirmButton: false, timer: 1000 });
    
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    btn.disabled = false;
    loadData();
});

// --- 5. LOAD & FILTER DATA ---
function loadData() {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const tglM = document.getElementById('filterTglMulai').value;
    const tglS = document.getElementById('filterTglSelesai').value;
    const search = document.getElementById('cariData').value.toLowerCase();
    const hariIni = new Date().toISOString().split('T')[0];

    let filtered = list.filter(i => {
        const matchesDate = (tglM && tglS) ? (i.tglNota >= tglM && i.tglNota <= tglS) : (i.tglNota === hariIni);
        const matchesSearch = i.kode.toLowerCase().includes(search) || i.deskripsi.toLowerCase().includes(search);
        return matchesDate && matchesSearch;
    });

    // Update Kartu Statistik
    document.getElementById('statTotal').innerText = filtered.length;
    document.getElementById('statPagi').innerText = filtered.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = filtered.filter(i => i.shift === 'MALAM').length;
    document.getElementById('statTotalQty').innerText = filtered.reduce((a, b) => a + b.jumlah, 0);

    renderChart(filtered);

    // Render Tabel
    tabel.innerHTML = '';
    filtered.sort((a,b) => b.id - a.id).forEach((item, idx) => {
        const row = `
            <tr>
                <td>${idx + 1}</td>
                <td class="fw-bold">${item.tglNota}</td>
                <td><span class="badge bg-kode">${item.kode}</span></td>
                <td class="text-start">${item.deskripsi} <br><small class="text-muted">Input: ${item.penginput}</small></td>
                <td><span class="badge ${item.shift === 'PAGI' ? 'bg-pagi' : 'bg-malam'}">${item.shift}</span></td>
                <td class="fw-bold">${item.jumlah}</td>
                <td>
                    ${item.foto ? `<button onclick="viewFoto('${item.foto}')" class="btn btn-sm btn-outline-primary"><i class="fas fa-image"></i></button>` : '-'}
                </td>
                <td>
                    ${userRole === 'admin' ? `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0"><i class="fas fa-trash-alt"></i></button>` : `<i class="fas fa-lock text-muted small"></i>`}
                </td>
            </tr>
        `;
        tabel.insertAdjacentHTML('beforeend', row);
    });
}

// --- 6. FUNGSI PENDUKUNG ---
function viewFoto(img) {
    Swal.fire({ imageUrl: img, imageAlt: 'Foto Nota', confirmButtonColor: '#2563eb' });
}

function deleteData(id) {
    Swal.fire({
        title: 'Hapus data ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus'
    }).then((res) => {
        if (res.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('db_ali_akatiri')).filter(i => i.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(db));
            loadData();
        }
    });
}

function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const tglM = document.getElementById('filterTglMulai').value;
    const tglS = document.getElementById('filterTglSelesai').value;
    const hariIni = new Date().toISOString().split('T')[0];

    let dataExport = list.filter(i => (tglM && tglS) ? (i.tglNota >= tglM && i.tglNota <= tglS) : (i.tglNota === hariIni));

    if (dataExport.length === 0) return Swal.fire('Data Kosong', 'Tidak ada data untuk periode ini.', 'info');

    const cleanData = dataExport.map(i => ({ Tanggal: i.tglNota, Kode: i.kode, Deskripsi: i.deskripsi, Shift: i.shift, Qty: i.jumlah, Penginput: i.penginput }));
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_AliAkatiri_${tglM || hariIni}.xlsx`);
}
