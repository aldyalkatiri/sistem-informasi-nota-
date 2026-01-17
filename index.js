// --- 1. KEAMANAN SESSION ---
if (sessionStorage.getItem('isLoggedIn') !== 'true') window.location.href = 'index.html';
const userRole = sessionStorage.getItem('role');
let myChart = null;

// --- 2. INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('displayUser').innerText = `USER: ${userRole.toUpperCase()}`;
    if (userRole === 'user') document.getElementById('adminPanel').style.display = 'none';
    
    // Set default tanggal hari ini
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    loadData();
});

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// --- 3. GRAFIK (CHART.JS) ---
function renderChart(data) {
    const ctx = document.getElementById('chartPerbaikan');
    if (!ctx) return;

    const labels = ['SL', 'SD', 'SI', 'SX', 'SY', 'SG', 'ST'];
    const values = labels.map(l => 
        data.filter(i => i.kode === l).reduce((a, b) => a + (parseInt(b.jumlah) || 0), 0)
    );

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Total Qty',
                data: values,
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
        }
    });
}

// --- 4. CRUD DATA ---
document.getElementById('notaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    let fotoBase64 = "";
    const fileInput = document.getElementById('fotoNota');
    if (fileInput.files[0]) {
        const reader = new FileReader();
        fotoBase64 = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    }

    const newData = {
        id: Date.now(),
        tglNota: document.getElementById('tanggalNota').value,
        kode: document.getElementById('kodeJenis').value,
        deskripsi: document.getElementById('kodeJenis').options[document.getElementById('kodeJenis').selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: parseInt(document.getElementById('jumlah').value) || 0,
        foto: fotoBase64
    };

    let db = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    db.push(newData);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(db));

    Swal.fire({ icon: 'success', title: 'Data Berhasil Disimpan', showConfirmButton: false, timer: 1000 });
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save me-2"></i> SIMPAN DATA NOTA';
    loadData();
});

function loadData() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const tglM = document.getElementById('filterTglMulai').value;
    const tglS = document.getElementById('filterTglSelesai').value;
    const search = document.getElementById('cariData').value.toLowerCase();
    const hariIni = new Date().toISOString().split('T')[0];

    // Filter Logic
    let filtered = list.filter(i => {
        const matchesDate = (tglM && tglS) ? (i.tglNota >= tglM && i.tglNota <= tglS) : (i.tglNota === hariIni);
        const matchesSearch = i.kode.toLowerCase().includes(search) || i.deskripsi.toLowerCase().includes(search);
        return matchesDate && matchesSearch;
    });

    // Update Stats
    document.getElementById('statTotal').innerText = filtered.length;
    document.getElementById('statPagi').innerText = filtered.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = filtered.filter(i => i.shift === 'MALAM').length;
    document.getElementById('statTotalQty').innerText = filtered.reduce((a, b) => a + b.jumlah, 0);

    renderChart(filtered);

    // Render Table
    const tbody = document.getElementById('tabelNota');
    tbody.innerHTML = filtered.sort((a,b) => b.id - a.id).map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td class="fw-bold text-dark">${item.tglNota}</td>
            <td><span class="badge bg-kode">${item.kode}</span></td>
            <td class="text-start small">${item.deskripsi}</td>
            <td><span class="badge ${item.shift === 'PAGI' ? 'bg-pagi' : 'bg-malam'}">${item.shift}</span></td>
            <td class="fw-bold">${item.jumlah}</td>
            <td>
                ${item.foto ? `<button onclick="showImg('${item.foto}')" class="btn btn-sm btn-outline-primary"><i class="fas fa-image"></i></button>` : '-'}
            </td>
            <td>
                ${userRole === 'admin' ? `<button onclick="delData(${item.id})" class="btn btn-sm text-danger"><i class="fas fa-trash-alt"></i></button>` : '-'}
            </td>
        </tr>
    `).join('');
}

function showImg(src) { Swal.fire({ imageUrl: src, imageAlt: 'Bukti Foto', confirmButtonColor: '#2563eb' }); }

function delData(id) {
    Swal.fire({ title: 'Hapus data?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus' }).then(r => {
        if (r.isConfirmed) {
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

    let exportList = list.filter(i => (tglM && tglS) ? (i.tglNota >= tglM && i.tglNota <= tglS) : (i.tglNota === hariIni));

    if (exportList.length === 0) return Swal.fire('Data Kosong', 'Tidak ada data untuk periode ini.', 'info');

    const cleanData = exportList.map(i => ({ Tanggal: i.tglNota, Kode: i.kode, Perbaikan: i.deskripsi, Shift: i.shift, Qty: i.jumlah }));
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Nota_AliAkatiri_${tglM || hariIni}.xlsx`);
}
