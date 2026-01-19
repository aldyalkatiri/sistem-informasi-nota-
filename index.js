/**
 * ALI AKATIRI SYSTEM - LOGIC CORE
 * Version: 2.0 (Final Sync)
 */

// 1. KEAMANAN & CEK LOGIN
const currentUser = sessionStorage.getItem('userName') || "Admin";
const userRole = sessionStorage.getItem('role') || "staff";
const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
    window.location.href = 'index.html'; // Tendang ke login jika belum masuk
}

// 2. INITIAL LOAD (Jalan Saat Halaman Dibuka)
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan Nama di Navbar
    const displayUser = document.getElementById('displayUser');
    if (displayUser) displayUser.innerText = `Halo, ${currentUser}`;

    // Tampilkan Tombol Masalah Hanya Untuk Admin
    const navMasalah = document.getElementById('navMasalah');
    if (navMasalah && (userRole === 'admin' || userRole === 'manager')) {
        navMasalah.classList.remove('d-none');
    }

    loadData(); // Jalankan render tabel & statistik
});

// 3. FUNGSI SIMPAN DATA (SUBMIT FORM)
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Ambil Data dari Form
        const tglNota = document.getElementById('tanggalNota').value;
        const kode = document.getElementById('kodeJenis').value;
        const ket = document.getElementById('kodeJenis').options[document.getElementById('kodeJenis').selectedIndex].text;
        const shift = document.getElementById('shift').value;
        const qty = parseInt(document.getElementById('jumlah').value);
        
        // TANGGAL INPUT OTOMATIS (Sistem Hari Ini)
        const tglInputSistem = new Date().toISOString().split('T')[0];

        // Buat Object Nota
        const dataNotaBaru = {
            id: Date.now(),
            tglNota: tglNota,        // Tanggal fisik nota
            tglInput: tglInputSistem, // Tanggal entry
            kode: kode,
            keterangan: ket,
            shift: shift,
            qty: qty,
            operator: currentUser
        };

        // Simpan ke LocalStorage
        let db = JSON.parse(localStorage.getItem('daftarNota')) || [];
        db.push(dataNotaBaru);
        localStorage.setItem('daftarNota', JSON.stringify(db));

        // Notifikasi Sukses
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data nota telah tersimpan.',
            timer: 1500,
            showConfirmButton: false
        });

        this.reset(); // Kosongkan form
        loadData();  // Refresh tampilan
    });
}

// 4. RENDER TABEL, STATISTIK, & CHART
let chartInstance = null; // Penampung grafik agar tidak tumpang tindih

function loadData() {
    const tableBody = document.getElementById('tabelNota');
    const db = JSON.parse(localStorage.getItem('daftarNota')) || [];
    
    // Reset Tampilan
    tableBody.innerHTML = '';
    
    // Variabel Counter Statistik
    let totalQty = 0;
    let pagiCount = 0;
    let malamCount = 0;
    let dataGrafik = {}; // Untuk Chart

    // Ambil keyword cari
    const cari = document.getElementById('cariData').value.toLowerCase();

    // Filter & Render (Data terbaru di atas)
    const filteredData = db.filter(item => 
        item.kode.toLowerCase().includes(cari) || 
        item.keterangan.toLowerCase().includes(cari)
    );

    filteredData.slice().reverse().forEach((nota, index) => {
        // Hitung Statistik
        totalQty += nota.qty;
        if(nota.shift === 'PAGI') pagiCount++;
        if(nota.shift === 'MALAM') malamCount++;
        
        // Kelompokkan data untuk Chart (berdasarkan Kode SL, SD, dll)
        dataGrafik[nota.kode] = (dataGrafik[nota.kode] || 0) + nota.qty;

        // Render Baris
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td><span class="tgl-nota-badge">${formatTgl(nota.tglNota)}</span></td>
                <td><span class="tgl-input-badge">Input: ${formatTgl(nota.tglInput)}</span></td>
                <td><span class="badge-jenis">${nota.kode}</span></td>
                <td class="text-start">${nota.keterangan}</td>
                <td><span class="badge ${nota.shift === 'PAGI' ? 'bg-warning text-dark' : 'bg-info'}">${nota.shift}</span></td>
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

    // Update Angka Statistik di Kotak Atas
    document.getElementById('statTotal').innerText = filteredData.length;
    document.getElementById('statPagi').innerText = pagiCount;
    document.getElementById('statMalam').innerText = malamCount;
    document.getElementById('statTotalQty').innerText = totalQty;

    // Gambar Ulang Grafik
    updateMyChart(dataGrafik);
}

// 5. FUNGSI GRAFIK (CHART.JS)
function updateMyChart(dataGrafik) {
    const ctx = document.getElementById('chartPerbaikan').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy(); // Hapus chart lama
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataGrafik),
            datasets: [{
                label: 'Total Qty Perbaikan',
                data: Object.values(dataGrafik),
                backgroundColor: '#0369a1',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// 6. EKSPOR KE EXCEL
function exportToExcel() {
    const db = JSON.parse(localStorage.getItem('daftarNota')) || [];
    if (db.length === 0) return Swal.fire('Data Kosong', '', 'info');

    const ws = XLSX.utils.json_to_sheet(db);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan_Nota");
    XLSX.writeFile(wb, `Laporan_AliAkatiri_${new Date().getTime()}.xlsx`);
}

// 7. FUNGSI HELPER
function formatTgl(tgl) {
    if(!tgl) return "-";
    const d = new Date(tgl);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function hapusNota(id) {
    Swal.fire({
        title: 'Hapus Nota?',
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
