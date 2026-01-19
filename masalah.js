/**
 * ali-akatiri-system: masalah.js
 * Logika sinkronisasi data nota bermasalah dengan sistem dua tanggal
 */

// 1. PROTEKSI HALAMAN & AMBIL DATA USER
const userAktif = sessionStorage.getItem('userName') || "Administrator";
const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
    window.location.href = 'index.html';
}

// 2. FUNGSI UTAMA: MENAMPILKAN DATA
function tampilkanData() {
    const tableBody = document.getElementById('bodyTabelMasalah');
    const countDisplay = document.getElementById('countMasalah');
    
    // Ambil database masalah dari localStorage
    const dataMasalah = JSON.parse(localStorage.getItem('dataMasalah')) || [];
    
    // Update Counter Total Masalah
    if (countDisplay) {
        countDisplay.innerText = dataMasalah.length;
    }

    // Reset Tabel
    tableBody.innerHTML = '';

    if (dataMasalah.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="text-muted small">
                        <i class="fas fa-check-circle fa-3x mb-3 d-block opacity-20 text-success"></i>
                        Tidak ada laporan nota bermasalah saat ini.
                    </div>
                </td>
            </tr>`;
        return;
    }

    // Render Data (Urutan: Terbaru di atas)
    // Kita gunakan slice().reverse() agar tidak merusak urutan asli di localStorage
    dataMasalah.slice().reverse().forEach((item, index) => {
        const row = `
            <tr class="animate-fade">
                <td class="small text-muted">${index + 1}</td>
                <td>
                    <span class="tgl-nota-badge">${formatTglIndo(item.tglNota)}</span>
                </td>
                <td>
                    <span class="tgl-input-badge">Input: ${formatTglIndo(item.tglInput)}</span>
                </td>
                <td class="text-start small" style="max-width: 350px; line-height: 1.4;">
                    ${item.deskripsi}
                </td>
                <td>
                    <span class="badge bg-light text-primary border px-2 py-1">
                        <i class="fas fa-user-edit me-1" style="font-size: 0.7rem;"></i> ${item.pelapor}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info rounded-pill px-3" onclick="lihatFoto()">
                        <i class="fas fa-image"></i>
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="hapusMasalah(${item.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// 3. LOGIKA SIMPAN TEMUAN BARU
const formMasalah = document.getElementById('formMasalah');
if (formMasalah) {
    formMasalah.addEventListener('submit', function(e) {
        e.preventDefault();

        const tglNota = document.getElementById('tglNotaBermasalah').value;
        const deskripsi = document.getElementById('descMasalah').value;
        
        // TANGGAL INPUT OTOMATIS (SISTEM)
        const tglSistem = new Date().toISOString().split('T')[0];

        // Object Data Masalah
        const dataBaru = {
            id: Date.now(), // Unique ID untuk hapus data
            tglNota: tglNota,
            tglInput: tglSistem,
            deskripsi: deskripsi,
            pelapor: userAktif
        };

        // Simpan ke Database Lokal
        let database = JSON.parse(localStorage.getItem('dataMasalah')) || [];
        database.push(dataBaru);
        localStorage.setItem('dataMasalah', JSON.stringify(database));

        // Sweet Alert Feedback
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Disimpan',
            text: 'Temuan masalah telah masuk ke database audit.',
            timer: 1500,
            showConfirmButton: false,
            background: '#ffffff'
        });

        this.reset();
        tampilkanData();
    });
}

// 4. FUNGSI HAPUS DATA
function hapusMasalah(id) {
    Swal.fire({
        title: 'Hapus Laporan?',
        text: "Pastikan masalah ini sudah selesai ditangani.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            let db = JSON.parse(localStorage.getItem('dataMasalah'));
            // Filter semua kecuali ID yang dipilih
            db = db.filter(item => item.id !== id);
            localStorage.setItem('dataMasalah', JSON.stringify(db));
            
            tampilkanData();
            
            Swal.fire({
                title: 'Dihapus',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
            });
        }
    });
}

// 5. FUNGSI PEMBANTU (HELPERS)
function formatTglIndo(str) {
    if(!str) return "-";
    const d = new Date(str);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function lihatFoto() {
    Swal.fire({
        title: 'Preview Bukti',
        text: 'Fitur upload file memerlukan server. Saat ini menampilkan placeholder.',
        imageUrl: 'https://via.placeholder.com/500x350/f1f5f9/0369a1?text=Bukti+Fisik+Nota',
        imageAlt: 'Bukti Masalah',
        confirmButtonColor: '#0369a1'
    });
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Jalankan fungsi saat halaman dimuat sempurna
document.addEventListener('DOMContentLoaded', tampilkanData);
