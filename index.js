/**
 * ALI AKATIRI SYSTEM - CORE LOGIC
 * Version: 2.2 Final (ID Sequence Fix for Excel)
 */

// 1. KEAMANAN & INISIALISASI
const currentUser = sessionStorage.getItem('userName') || "Administrator";
const userRole = sessionStorage.getItem('role') || "staff";
const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
    window.location.href = 'index.html';
}

// 2. JALANKAN SAAT HALAMAN SIAP
document.addEventListener('DOMContentLoaded', () => {
    const displayUser = document.getElementById('displayUser');
    if (displayUser) displayUser.innerText = `Halo, ${currentUser}`;

    const navMasalah = document.getElementById('navMasalah');
    if (navMasalah && (userRole === 'admin' || userRole === 'manager')) {
        navMasalah.classList.remove('d-none');
    }

    loadData();
});

// 3. LOGIKA SIMPAN DATA (PERBAIKAN ID BERURUTAN)
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const databaseNota = JSON.parse(localStorage.getItem('daftarNota')) || [];

        // --- PERBAIKAN LOGIKA ID: BERURUTAN 1, 2, 3... ---
        const idBaru = databaseNota.length > 0 ? databaseNota[databaseNota.length - 1].id + 1 : 1;

        const tglNota = document.getElementById('tanggalNota').value;
        const kode = document.getElementById('kodeJenis').value;
        const ket = document.getElementById('kodeJenis').options[document.getElementById('kodeJenis').selectedIndex].text;
        const shift = document.getElementById('shift').value;
        const qty = parseInt(document.getElementById('jumlah').value);
        const tglSistem = new Date().toISOString().split('T')[0];

        const notaBaru = {
            id: idBaru, 
            tglNota: tglNota,
            tglInput: tglSistem,
            kode: kode,
            keterangan: ket,
            shift: shift,
            qty: qty,
            penginput: currentUser
        };

        databaseNota.push(notaBaru);
        localStorage.setItem('daftarNota', JSON.stringify(databaseNota));

        Swal.fire({
            icon: 'success',
            title: 'Berhasil Disimpan',
            text: `Data ke-${idBaru} berhasil dicatat`,
            timer: 1500,
            showConfirmButton: false
        });

        this.reset();
        loadData();
    });
}

// 4. RENDER TABEL & STATISTIK
let myChart = null; 

function loadData() {
    const tableBody = document.getElementById('tabelNota');
    let db = JSON.parse(localStorage.getItem('daftarNota')) || [];
    
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

    const cari = document.getElementById('cariData').value.toLowerCase();
    const dataFiltered = db.filter(item => {
        return item.kode.toLowerCase().includes(cari) || 
               item.keterangan.toLowerCase().includes(cari);
    });

    dataFiltered.slice().reverse().forEach((nota, index) => {
        totalQty += nota.qty;
        if(nota.shift === 'PAGI') pagiCount++;
        if(nota.shift === 'MALAM') malamCount++;
        
        const dNota = new Date(nota.tglNota);
        if (dNota.getMonth() === currMonth && dNota.getFullYear() === currYear) {
            qtyBulanIni += nota.qty;
        } else if (dNota.getMonth() === (currMonth === 0 ? 11 : currMonth - 1)) {
            qtyBulanLalu += nota.qty;
        }

        chartLabels[nota.kode] = (chartLabels[nota.kode] || 0) + nota.qty;

        const row = `
            <tr>
                <td class="text-muted fw-bold">#${nota.id}</td>
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

    // UPDATE UI
    document.getElementById('statTotal').innerText = dataFiltered.length;
    document.getElementById('statPagi').innerText = pagiCount;
    document.getElementById('statMalam').innerText = malamCount;
    document.getElementById('statTotalQty').innerText = totalQty;
    document.getElementById('statBulanIni').innerText = `${qtyBulanIni} UNIT`;

    // UPDATE SUMMARY CARD
    const bandingElemen = document.getElementById('perbandinganBulan');
    if (qtyBulanLalu === 0) {
        bandingElemen.innerHTML = `<i class="fas fa-info"></i> Data bulan lalu belum tersedia.`;
    } else {
        const selisih = qtyBulanIni - qtyBulanLalu;
        const persen = ((selisih / qtyBulanLalu) * 100).toFixed(1);
        bandingElemen.innerHTML = selisih >= 0 ? 
            `<i class="fas fa-arrow-up"></i> Naik <strong>${persen}%</strong> dari bulan lalu` : 
            `<i class="fas fa-arrow-down"></i> Turun <strong>${Math.abs(persen)}%</strong> dari bulan lalu`;
        if (selisih >= 0) bandingElemen.classList.add('text-warning');
    }

    updateChart(chartLabels);
}

// 5. FUNGSI GRAFIK
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

// 6. FUNGSI EKSPOR EXCEL (ID AKAN RAPI)
function exportToExcel() {
    let database = JSON.parse(localStorage.getItem('daftarNota')) || [];
    if (database.length === 0) return Swal.fire('Kosong', 'Tidak ada data.', 'info');
    
    // Pastikan ID dikirim sebagai angka biasa agar tidak berantakan
    const dataUntukExcel = database.map(item => ({
        "No ID": item.id,
        "Tgl Nota": item.tglNota,
        "Tgl Input": item.tglInput,
        "Kode": item.kode,
        "Keterangan": item.keterangan,
        "Shift": item.shift,
        "Qty": item.qty,
        "Penginput": item.penginput
    }));

    const ws = XLSX.utils.json_to_sheet(dataUntukExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan_AliAkatiri");
    XLSX.writeFile(wb, `Laporan_AliAkatiri_${new Date().toLocaleDateString()}.xlsx`);
}

function formatIndo(dateStr) {
    if(!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function hapusNota(id) {
    Swal.fire({
        title: 'Hapus data?',
        icon: 'warning',
        showCancelButton: true,
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
