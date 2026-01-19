/**
 * ALI AKATIRI SYSTEM - ONLINE VERSION (FINAL FIX)
 * Fitur: Sinkronisasi Cloud, Statistik Real-time, & Export Excel Rapi
 */

// 1. KONFIGURASI API (URL yang Anda berikan)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbytwYwvh_8hVTeatMCEM0YC600LvzhW5kLh8IbMwM8x5zNVrxHnHrfieQJaMMkeqFtg/exec";

// 2. KEAMANAN & PENGGUNA
const currentUser = sessionStorage.getItem('userName') || "Administrator";
const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
    window.location.href = 'index.html';
}

let myChart = null;
let globalData = []; // Penyimpan data untuk fitur Cari dan Excel

document.addEventListener('DOMContentLoaded', () => {
    const displayUser = document.getElementById('displayUser');
    if (displayUser) displayUser.innerText = `Halo, ${currentUser}`;
    
    // Inisialisasi awal
    loadData();
});

// 3. FUNGSI AMBIL DATA DARI CLOUD (SINKRON)
function loadData() {
    const tableBody = document.getElementById('tabelNota');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Menghubungkan ke Cloud...</td></tr>';
    
    fetch(SCRIPT_URL)
        .then(res => {
            if (!res.ok) throw new Error('Network Error');
            return res.json();
        })
        .then(databaseNota => {
            globalData = databaseNota; // Simpan ke global agar bisa di-export ke Excel
            renderSemua(databaseNota);
        })
        .catch(err => {
            console.error('Error Load:', err);
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data dari Cloud. Pastikan internet aktif dan izin akses "Anyone" pada Apps Script sudah benar.</td></tr>';
        });
}

// 4. FUNGSI SIMPAN DATA KE GOOGLE SHEETS
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        Swal.fire({
            title: 'Menyimpan ke Cloud...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // Membuat ID berurutan (1, 2, 3...) agar rapi di Excel
        const idBaru = globalData.length + 1;

        const notaBaru = {
            id: idBaru,
            tglNota: document.getElementById('tanggalNota').value,
            tglInput: new Date().toISOString().split('T')[0],
            kode: document.getElementById('kodeJenis').value,
            keterangan: document.getElementById('kodeJenis').options[document.getElementById('kodeJenis').selectedIndex].text,
            shift: document.getElementById('shift').value,
            qty: parseInt(document.getElementById('jumlah').value),
            penginput: currentUser
        };

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting agar tidak kena blokir CORS
            cache: 'no-cache',
            body: JSON.stringify(notaBaru)
        })
        .then(() => {
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data tersimpan online', timer: 1500, showConfirmButton: false });
            this.reset();
            // Jeda 1 detik agar Google Sheets sempat memproses sebelum reload
            setTimeout(loadData, 1000);
        })
        .catch(err => {
            Swal.fire('Error!', 'Gagal terhubung ke Cloud', 'error');
            console.error(err);
        });
    });
}

// 5. RENDER TABEL & STATISTIK
function renderSemua(data) {
    const tableBody = document.getElementById('tabelNota');
    tableBody.innerHTML = '';
    
    let stats = { totalQty: 0, pagi: 0, malam: 0, bulanIni: 0, bulanLalu: 0 };
    let chartLabels = {};
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    // Urutkan data terbaru di atas untuk tabel
    const dataSorted = data.slice().reverse();

    dataSorted.forEach((nota) => {
        // Hitung Statistik Dasar
        stats.totalQty += parseInt(nota.qty);
        if(nota.shift === 'PAGI') stats.pagi++;
        if(nota.shift === 'MALAM') stats.malam++;
        
        // Statistik Performa Bulan Ini
        const dNota = new Date(nota.tglNota);
        if (dNota.getMonth() === currMonth && dNota.getFullYear() === currYear) {
            stats.bulanIni += parseInt(nota.qty);
        } else if (dNota.getMonth() === (currMonth === 0 ? 11 : currMonth - 1)) {
            stats.bulanLalu += parseInt(nota.qty);
        }

        // Data untuk Grafik
        chartLabels[nota.kode] = (chartLabels[nota.kode] || 0) + parseInt(nota.qty);

        // Render Baris ke HTML
        const row = `
            <tr>
                <td class="fw-bold">#${nota.id}</td>
                <td>
                    <div class="fw-bold">${formatIndo(nota.tglNota)}</div>
                    <div class="text-muted small" style="font-size: 10px;">Input: ${formatIndo(nota.tglInput)}</div>
                </td>
                <td><span class="badge bg-primary px-2">${nota.kode}</span></td>
                <td class="text-start">${nota.keterangan}</td>
                <td class="fw-bold">${nota.qty}</td>
                <td><small class="text-muted">${nota.penginput}</small></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // UPDATE UI DASHBOARD
    document.getElementById('statTotal').innerText = data.length;
    document.getElementById('statPagi').innerText = stats.pagi;
    document.getElementById('statMalam').innerText = stats.malam;
    document.getElementById('statTotalQty').innerText = stats.totalQty;
    document.getElementById('statBulanIni').innerText = `${stats.bulanIni} UNIT`;

    updateSummaryCard(stats.bulanIni, stats.bulanLalu);
    updateChart(chartLabels);
}

// 6. FUNGSI EXCEL (Mencegah ID Ilmiah)
function exportToExcel() {
    if (globalData.length === 0) {
        return Swal.fire('Data Kosong', 'Tidak ada data untuk di-download', 'warning');
    }
    
    // Gunakan globalData agar ID tetap urutan 1, 2, 3...
    const ws = XLSX.utils.json_to_sheet(globalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data_Nota_AliAkatiri");
    
    XLSX.writeFile(wb, `Laporan_AliAkatiri_${new Date().toLocaleDateString('id-ID')}.xlsx`);
}

// 7. HELPER FUNCTIONS
function formatIndo(dateStr) {
    if(!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function updateSummaryCard(ini, lalu) {
    const bandingElemen = document.getElementById('perbandinganBulan');
    if (!bandingElemen) return;
    
    if (lalu === 0) {
        bandingElemen.innerHTML = `<i class="fas fa-info-circle"></i> Memulai data bulan baru`;
    } else {
        const selisih = ini - lalu;
        const persen = ((selisih / lalu) * 100).toFixed(1);
        bandingElemen.innerHTML = selisih >= 0 ? 
            `<i class="fas fa-arrow-up"></i> Naik <strong>${persen}%</strong> dari bulan lalu` : 
            `<i class="fas fa-arrow-down"></i> Turun <strong>${Math.abs(persen)}%</strong> dari bulan lalu`;
    }
}

function updateChart(chartLabels) {
    const ctx = document.getElementById('chartPerbaikan');
    if (!ctx) return;
    
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(chartLabels),
            datasets: [{
                data: Object.values(chartLabels),
                backgroundColor: ['#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
    });
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
