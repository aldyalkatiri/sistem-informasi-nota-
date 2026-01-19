/**
 * ali-akatiri-system: index.js
 * Logika Utama Dashboard dengan Sistem Dua Tanggal & Statistik
 */

// 1. KEAMANAN & INISIALISASI USER
const isLogged = sessionStorage.getItem('isLoggedIn');
const userName = sessionStorage.getItem('userName') || "Guest";
const userRole = sessionStorage.getItem('role') || "staff";

if (!isLogged) {
    window.location.href = 'index.html';
}

// Menampilkan Identitas di Navbar
document.addEventListener('DOMContentLoaded', () => {
    const displayUser = document.getElementById('displayUser');
    const navMasalah = document.getElementById('navMasalah');
    
    if (displayUser) displayUser.innerText = `Halo, ${userName}`;
    
    // Tampilkan tombol Nota Bermasalah hanya untuk Admin/Manager
    if (navMasalah && (userRole === 'admin' || userRole === 'manager')) {
        navMasalah.classList.remove('d-none');
    }
    
    loadData(); // Load data pertama kali
});

// 2. LOGIKA SIMPAN DATA (FORM SUBMIT)
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Ambil Nilai Form
        const tglNota = document.getElementById('tanggalNota').value;
        const kode = document.getElementById('kodeJenis').value;
        const ket = document.getElementById('kodeJenis').options[document.getElementById('kodeJenis').selectedIndex].text;
        const shift = document.getElementById('shift').value;
        const qty = parseInt(document.getElementById('jumlah').value);
        
        // TANGGAL INPUT OTOMATIS (SISTEM HARI INI)
        const tglSistem = new Date().toISOString().split('T')[0];

        // Buat Object Data
        const notaBaru = {
            id: Date.now(),
            tglNota: tglNota,      // Tanggal fisik nota
            tglInput: tglSistem,   // Tanggal entry data
            kode: kode,
            keterangan: ket,
            shift: shift,
            qty: qty,
            penginput: userName
        };

        // Simpan ke LocalStorage
        let databaseNota = JSON.parse(localStorage.getItem('daftarNota')) || [];
        databaseNota.push(notaBaru);
        localStorage.setItem('daftarNota', JSON.stringify(databaseNota));

        // Feedback Berhasil
        Swal.fire({
            icon: 'success',
            title: 'Data Disimpan',
            text: `Nota ${kode} berhasil dicatat`,
            timer: 1500,
            showConfirmButton: false
        });

        this.reset();
        loadData(); // Refresh tabel dan statistik
    });
}

// 3. RENDER TABEL & STATISTIK
let myChart; // Variabel global untuk Chart

function loadData() {
    const tableBody = document.getElementById('tabelNota');
    let databaseNota = JSON.parse(localStorage.getItem('daftarNota')) || [];
    
    // Ambil nilai filter (jika ada)
    const cari = document.getElementById('cariData').value.toLowerCase();
    
    tableBody.innerHTML = '';
    
    // Variabel Penampung Statistik
    let totalQty = 0;
    let pagiCount = 0;
    let malamCount = 0;
    let chartData = {};

    // Filter data berdasarkan pencarian
    const dataFiltered = databaseNota.filter(item => {
        return item.kode.toLowerCase().includes(cari) || 
               item.keterangan.toLowerCase().includes(cari) ||
               item.penginput.toLowerCase().includes(cari);
    });

    // Urutkan: Data terbaru diinput muncul paling atas
    dataFiltered.reverse().forEach((nota, index) => {
        // Hitung Statistik
        totalQty += nota.qty;
        if(nota.shift === 'PAGI') pagiCount++;
        if(nota.shift === 'MALAM') malamCount++;
        
        // Siapkan Data untuk Chart
        chartData[nota.kode] = (chartData[nota.kode] || 0) + nota.qty;

        // Render Baris Tabel
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td><span class="tgl-nota-badge">${formatIndo(nota.tglNota)}</span></td>
                <td><span class="tgl-input-badge">Input: ${formatIndo(nota.tglInput)}</span></td>
                <td><span class="badge-jenis">${nota.kode}</span></td>
                <td class="text-start small">${nota.keterangan}</td>
                <td><span class="badge ${nota.shift === 'PAGI' ? 'bg-warning text-dark' : 'bg-info'}">${nota.shift}</span></td>
                <td class="fw-bold">${nota.qty}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="hapusNota(${nota.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Update Angka Statistik di Atas
    document.getElementById('statTotal').innerText = dataFiltered.length;
    document.getElementById('statPagi').innerText = pagiCount;
    document.getElementById('statMalam').innerText = malamCount;
    document.getElementById('statTotalQty').innerText = totalQty;

    updateChart(chartData);
}

// 4. LOGIKA GRAFIK (CHART.JS)
function updateChart(chartData) {
    const ctx = document.getElementById('chartPerbaikan').getContext('2d');
    
    if (myChart) myChart.destroy(); // Hapus chart lama sebelum buat baru

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(chartData),
            datasets: [{
                label: 'Jumlah Unit Perbaikan',
                data: Object.values(chartData),
                backgroundColor: '#0369a1',
                borderRadius: 8,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// 5. EKSPOR KE EXCEL
function exportToExcel() {
    let databaseNota = JSON.parse(localStorage.getItem('daftarNota')) || [];
    if (databaseNota.length === 0) return Swal.fire('Kosong', 'Tidak ada data untuk diekspor', 'info');

    const worksheet = XLSX.utils.json_to_sheet(databaseNota);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Nota");
    XLSX.writeFile(workbook, `Laporan_AliAkatiri_${new Date().toLocaleDateString()}.xlsx`);
}

// 6. FUNGSI PENDUKUNG
function formatIndo(dateStr) {
    if(!dateStr) return "-";
    const event = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return event.toLocaleDateString('id-ID', options);
}

function hapusNota(id) {
    Swal.fire({
        title: 'Hapus Nota ini?',
        text: "Data akan hilang dari riwayat!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus'
    }).then((result) => {
        if (result.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('daftarNota'));
            db = db.filter(item => item.id !== id);
            localStorage.setItem('daftarNota', JSON.stringify(db));
            loadData();
        }
    });
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
