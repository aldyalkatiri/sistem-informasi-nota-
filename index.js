/**
 * ALI AKATIRI SYSTEM - CORE LOGIC
 * Version: 2.1 Final (Feature 6 & Dual Date Sync)
 */

// 1. KEAMANAN & INISIALISASI PENGGUNA
const currentUser = sessionStorage.getItem('userName') || "Administrator";
const userRole = sessionStorage.getItem('role') || "staff";
const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
    window.location.href = 'index.html';
}

// 2. JALANKAN SAAT HALAMAN SIAP
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan Nama User di Navbar
    const displayUser = document.getElementById('displayUser');
    if (displayUser) displayUser.innerText = `Halo, ${currentUser}`;

    // Tampilkan Tombol Admin (Nota Bermasalah) jika Role sesuai
    const navMasalah = document.getElementById('navMasalah');
    if (navMasalah && (userRole === 'admin' || userRole === 'manager')) {
        navMasalah.classList.remove('d-none');
    }

    loadData(); // Memuat tabel, statistik, dan grafik
});

// 3. LOGIKA SIMPAN DATA (FORM SUBMIT)
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
            penginput: currentUser
        };

        // Simpan ke LocalStorage
        let databaseNota = JSON.parse(localStorage.getItem('daftarNota')) || [];
        databaseNota.push(notaBaru);
        localStorage.setItem('daftarNota', JSON.stringify(databaseNota));

        // Feedback Berhasil
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Disimpan',
            text: `Nota ${kode} berhasil dicatat`,
            timer: 1500,
            showConfirmButton: false
        });

        this.reset();
        loadData(); // Refresh tampilan
    });
}

// 4. RENDER TABEL & STATISTIK (CORE FUNCTION)
let myChart = null; 

function loadData() {
    const tableBody = document.getElementById('tabelNota');
    let databaseNota = JSON.parse(localStorage.getItem('daftarNota')) || [];
    
    // Reset Tabel
    tableBody.innerHTML = '';
    
    // Variabel Penampung Statistik
    let totalQty = 0;
    let pagiCount = 0;
    let malamCount = 0;
    let qtyBulanIni = 0;
    let qtyBulanLalu = 0;
    let chartLabels = {};

    // Tanggal Hari Ini untuk Perbandingan Bulanan
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    // Filter Pencarian
    const cari = document.getElementById('cariData').value.toLowerCase();
    const dataFiltered = databaseNota.filter(item => {
        return item.kode.toLowerCase().includes(cari) || 
               item.keterangan.toLowerCase().includes(cari);
    });

    // Proses Data (Render & Hitung)
    dataFiltered.slice().reverse().forEach((nota, index) => {
        // A. Hitung Statistik Umum
        totalQty += nota.qty;
        if(nota.shift === 'PAGI') pagiCount++;
        if(nota.shift === 'MALAM') malamCount++;
        
        // B. Hitung Perbandingan Bulanan (Feature 6)
        const dNota = new Date(nota.tglNota);
        const mNota = dNota.getMonth();
        const yNota = dNota.getFullYear();

        if (mNota === currMonth && yNota === currYear) {
            qtyBulanIni += nota.qty;
        } else if (mNota === (currMonth === 0 ? 11 : currMonth - 1) && 
                   yNota === (currMonth === 0 ? currYear - 1 : currYear)) {
            qtyBulanLalu += nota.qty;
        }

        // C. Siapkan Data Grafik
        chartLabels[nota.kode] = (chartLabels[nota.kode] || 0) + nota.qty;

        // D. Render Baris Tabel
        const row = `
            <tr>
                <td class="text-muted small">${index + 1}</td>
                <td>
                    <span class="tgl-nota-badge">${formatIndo(nota.tglNota)}</span>
                    <span class="tgl-input-badge">Input: ${formatIndo(nota.tglInput)}</span>
                </td>
                <td><span class="badge-jenis">${nota.kode}</span></td>
                <td class="text-start">${nota.keterangan}</td>
                <td class="fw-bold">${nota.qty}</td>
                <td>
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="hapusNota(${nota.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // 5. UPDATE UI STATISTIK
    document.getElementById('statTotal').innerText = dataFiltered.length;
    document.getElementById('statPagi').innerText = pagiCount;
    document.getElementById('statMalam').innerText = malamCount;
    document.getElementById('statTotalQty').innerText = totalQty;
    document.getElementById('statBulanIni').innerText = `${qtyBulanIni} UNIT`;

    // 6. UPDATE SUMMARY CARD (FEATURE 6)
    const bandingElemen = document.getElementById('perbandinganBulan');
    if (qtyBulanLalu === 0) {
        bandingElemen.innerHTML = `<i class="fas fa-info-circle me-1"></i> Data bulan lalu belum tersedia.`;
    } else {
        const selisih = qtyBulanIni - qtyBulanLalu;
        const persen = ((selisih / qtyBulanLalu) * 100).toFixed(1);
        if (selisih >= 0) {
            bandingElemen.innerHTML = `<i class="fas fa-arrow-up me-1"></i> Naik <strong>${persen}%</strong> dari bulan lalu`;
            bandingElemen.classList.add('text-warning'); 
        } else {
            bandingElemen.innerHTML = `<i class="fas fa-arrow-down me-1"></i> Turun <strong>${Math.abs(persen)}%</strong> dari bulan lalu`;
            bandingElemen.classList.remove('text-warning');
        }
    }

    updateChart(chartLabels);
}

// 7. FUNGSI GRAFIK (CHART.JS)
function updateChart(chartLabels) {
    const ctx = document.getElementById('chartPerbaikan').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut', // Menggunakan Doughnut untuk proporsi di panel samping
        data: {
            labels: Object.keys(chartLabels),
            datasets: [{
                data: Object.values(chartLabels),
                backgroundColor: ['#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#0c4a6e', '#075985'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
            },
            cutout: '70%'
        }
    });
}

// 8. FUNGSI EKSPOR & HELPER
function exportToExcel() {
    let database = JSON.parse(localStorage.getItem('daftarNota')) || [];
    if (database.length === 0) return Swal.fire('Kosong', 'Tidak ada data.', 'info');
    const ws = XLSX.utils.json_to_sheet(database);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AliAkatiri_Log");
    XLSX.writeFile(wb, `Laporan_AA_${new Date().getTime()}.xlsx`);
}

function formatIndo(dateStr) {
    if(!dateStr) return "-";
    const event = new Date(dateStr);
    return event.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function hapusNota(id) {
    Swal.fire({
        title: 'Hapus data?',
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
