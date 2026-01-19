/**
 * ALI AKATIRI SYSTEM - ONLINE VERSION (GOOGLE SHEETS)
 * Version: 3.1 Final (Integrated)
 */

// 1. KONFIGURASI API GOOGLE SHEETS
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbytwYwvh_8hVTeatMCEM0YC600LvzhW5kLh8IbMwM8x5zNVrxHnHrfieQJaMMkeqFtg/exec";

// 2. KEAMANAN & INISIALISASI
const currentUser = sessionStorage.getItem('userName') || "Administrator";
const userRole = sessionStorage.getItem('role') || "staff";
const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
    window.location.href = 'index.html';
}

let myChart = null;

// 3. JALANKAN SAAT HALAMAN SIAP
document.addEventListener('DOMContentLoaded', () => {
    const displayUser = document.getElementById('displayUser');
    if (displayUser) displayUser.innerText = `Halo, ${currentUser}`;

    const navMasalah = document.getElementById('navMasalah');
    if (navMasalah && (userRole === 'admin' || userRole === 'manager')) {
        navMasalah.classList.remove('d-none');
    }

    loadData(); // Ambil data dari Google Sheets saat pertama kali buka
});

// 4. FUNGSI SIMPAN DATA KE GOOGLE SHEETS
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Tampilkan Loading
        Swal.fire({
            title: 'Sedang Menyimpan...',
            text: 'Data sedang dikirim ke Google Sheets',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const tglNota = document.getElementById('tanggalNota').value;
        const kode = document.getElementById('kodeJenis').value;
        const ket = document.getElementById('kodeJenis').options[document.getElementById('kodeJenis').selectedIndex].text;
        const shift = document.getElementById('shift').value;
        const qty = parseInt(document.getElementById('jumlah').value);
        const tglSistem = new Date().toISOString().split('T')[0];

        const notaBaru = {
            id: Date.now(), // ID Unik berbasis waktu
            tglNota: tglNota,
            tglInput: tglSistem,
            kode: kode,
            keterangan: ket,
            shift: shift,
            qty: qty,
            penginput: currentUser
        };

        // Kirim data menggunakan metode POST ke Google Apps Script
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Diperlukan agar tidak terkena kebijakan CORS browser
            cache: 'no-cache',
            body: JSON.stringify(notaBaru)
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data tersimpan secara online di Google Sheets',
                timer: 2000,
                showConfirmButton: false
            });
            this.reset();
            // Beri jeda 1.5 detik agar Google Sheets memproses data sebelum di-refresh
            setTimeout(loadData, 1500);
        })
        .catch(err => {
            Swal.fire('Error!', 'Gagal terhubung ke Cloud. Periksa internet Anda.', 'error');
            console.error(err);
        });
    });
}

// 5. FUNGSI AMBIL DATA (SINKRONISASI)
function loadData() {
    const tableBody = document.getElementById('tabelNota');
    
    // Fetch data dari Google Sheets melalui doGet di Apps Script
    fetch(SCRIPT_URL)
        .then(res => res.json())
        .then(databaseNota => {
            renderSemua(databaseNota);
        })
        .catch(err => {
            console.error('Error Load:', err);
            // Jika gagal load online, bisa tampilkan pesan di tabel
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data dari Cloud.</td></tr>';
        });
}

// 6. RENDER TABEL & STATISTIK (LOGIKA UTAMA)
function renderSemua(data) {
    const tableBody = document.getElementById('tabelNota');
    tableBody.innerHTML = '';
    
    let totalQty = 0;
    let pagiCount = 0;
    let malamCount = 0;
    let qtyBulanIni = 0;
    let qtyBulanLalu = 0;
    let chartLabels = {};

    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    // Balik urutan data agar yang terbaru di atas
    const dataSorted = data.slice().reverse();

    dataSorted.forEach((nota, index) => {
        // Hitung Statistik
        totalQty += parseInt(nota.qty);
        if(nota.shift === 'PAGI') pagiCount++;
        if(nota.shift === 'MALAM') malamCount++;
        
        const dNota = new Date(nota.tglNota);
        if (dNota.getMonth() === currMonth && dNota.getFullYear() === currYear) {
            qtyBulanIni += parseInt(nota.qty);
        } else if (dNota.getMonth() === (currMonth === 0 ? 11 : currMonth - 1)) {
            qtyBulanLalu += parseInt(nota.qty);
        }

        chartLabels[nota.kode] = (chartLabels[nota.kode] || 0) + parseInt(nota.qty);

        // Render Baris Tabel
        const row = `
            <tr>
                <td class="text-muted small">#${nota.id.toString().slice(-4)}</td>
                <td>
                    <span class="tgl-nota-badge">${formatIndo(nota.tglNota)}</span>
                    <span class="tgl-input-badge">Input: ${formatIndo(nota.tglInput)}</span>
                </td>
                <td><span class="badge-jenis">${nota.kode}</span></td>
                <td class="text-start">${nota.keterangan}</td>
                <td class="fw-bold">${nota.qty}</td>
                <td><small class="text-muted">${nota.penginput}</small></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // UPDATE UI DASHBOARD
    document.getElementById('statTotal').innerText = data.length;
    document.getElementById('statPagi').innerText = pagiCount;
    document.getElementById('statMalam').innerText = malamCount;
    document.getElementById('statTotalQty').innerText = totalQty;
    document.getElementById('statBulanIni').innerText = `${qtyBulanIni} UNIT`;

    // UPDATE SUMMARY CARD (FEATURE 6)
    updateSummaryCard(qtyBulanIni, qtyBulanLalu);
    
    // UPDATE GRAFIK
    updateChart(chartLabels);
}

// 7. FUNGSI PEMBANTU (HELPER)
function updateSummaryCard(ini, lalu) {
    const bandingElemen = document.getElementById('perbandinganBulan');
    if (lalu === 0) {
        bandingElemen.innerHTML = `<i class="fas fa-info-circle"></i> Data bulan lalu belum tersedia.`;
    } else {
        const selisih = ini - lalu;
        const persen = ((selisih / lalu) * 100).toFixed(1);
        bandingElemen.innerHTML = selisih >= 0 ? 
            `<i class="fas fa-arrow-up"></i> Naik <strong>${persen}%</strong> dari bulan lalu` : 
            `<i class="fas fa-arrow-down"></i> Turun <strong>${Math.abs(persen)}%</strong> dari bulan lalu`;
        if (selisih >= 0) bandingElemen.classList.add('text-warning');
        else bandingElemen.classList.remove('text-warning');
    }
}

function updateChart(chartLabels) {
    const ctx = document.getElementById('chartPerbaikan').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
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

function formatIndo(dateStr) {
    if(!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
