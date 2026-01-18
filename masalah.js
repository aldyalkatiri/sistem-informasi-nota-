/**
 * ali-akatiri-system: masalah.js
 * Logika Manajemen Nota Bermasalah
 */

// 1. Inisialisasi Data & User Aktif
// Mengambil nama dari sessionStorage hasil login untuk mencegah "null"
const userAktif = sessionStorage.getItem('userName') || "Administrator";

// 2. Fungsi Utama: Menampilkan Data dari LocalStorage ke Tabel
function tampilkanData() {
    const tabelBody = document.getElementById('bodyTabelMasalah');
    const counterDisplay = document.getElementById('countMasalah');
    
    // Ambil data dari penyimpanan lokal
    const dataMasalah = JSON.parse(localStorage.getItem('dataMasalah')) || [];
    
    // Update Counter (Jumlah Laporan)
    if (counterDisplay) {
        counterDisplay.innerText = dataMasalah.length;
    }

    // Reset isi tabel agar tidak duplikat saat render ulang
    tabelBody.innerHTML = '';

    // Jika data kosong, tampilkan pesan informatif
    if (dataMasalah.length === 0) {
        tabelBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="text-muted">
                        <i class="fas fa-folder-open fa-3x mb-3 d-block opacity-20"></i>
                        Belum ada laporan nota bermasalah.
                    </div>
                </td>
            </tr>`;
        return;
    }

    // Render baris tabel secara dinamis
    dataMasalah.forEach((item, index) => {
        const row = `
            <tr class="animate-fade">
                <td class="ps-3 fw-bold text-secondary">${index + 1}</td>
                <td class="fw-semibold">${formatTanggal(item.tanggal)}</td>
                <td class="small text-wrap" style="max-width: 300px;">${item.deskripsi}</td>
                <td><span class="badge-user"><i class="fas fa-user-edit me-1"></i> ${item.pelapor}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="lihatFoto('${item.foto}')">
                        <i class="fas fa-image me-1"></i> Lihat
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-circle" onclick="hapusData(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
        tabelBody.insertAdjacentHTML('beforeend', row);
    });
}

// 3. Logika Menangani Input Form (Simpan Data)
const formMasalah = document.getElementById('formMasalah');
if (formMasalah) {
    formMasalah.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inputTgl = document.getElementById('tglMasalah').value;
        const inputDesc = document.getElementById('descMasalah').value;

        // Ambil array lama, gabungkan dengan data baru
        const databaseLama = JSON.parse(localStorage.getItem('dataMasalah')) || [];
        
        const laporanBaru = {
            tanggal: inputTgl,
            deskripsi: inputDesc,
            pelapor: userAktif, // Nama pelapor otomatis dari akun login
            foto: "placeholder-nota.jpg",
            timestamp: new Date().toISOString()
        };

        databaseLama.push(laporanBaru);
        
        // Simpan kembali ke LocalStorage
        localStorage.setItem('dataMasalah', JSON.stringify(databaseLama));

        // Berikan Feedback ke User
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Disimpan',
            text: 'Laporan temuan nota telah masuk ke database.',
            timer: 2000,
            showConfirmButton: false,
            background: '#ffffff',
            iconColor: '#0369a1'
        });

        // Reset Form & Update Tabel secara Real-time
        this.reset();
        tampilkanData();
    });
}

// 4. Fungsi Hapus Laporan
function hapusData(index) {
    Swal.fire({
        title: 'Hapus Laporan?',
        text: "Data yang dihapus tidak dapat dipulihkan kembali!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            let currentData = JSON.parse(localStorage.getItem('dataMasalah'));
            currentData.splice(index, 1); // Hapus 1 item sesuai index
            
            localStorage.setItem('dataMasalah', JSON.stringify(currentData));
            
            // Refresh tabel
            tampilkanData();
            
            Swal.fire({
                title: 'Dihapus!',
                text: 'Laporan telah dihapus dari riwayat.',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
            });
        }
    });
}

// 5. Fungsi Lihat Foto (Preview Modal)
function lihatFoto(url) {
    Swal.fire({
        title: 'Bukti Temuan Nota',
        imageUrl: 'https://via.placeholder.com/600x400/e0f2fe/0369a1?text=Preview+Dokumen+Nota',
        imageAlt: 'Foto Bukti Nota Bermasalah',
        confirmButtonText: 'Tutup Dashboard',
        confirmButtonColor: '#0369a1'
    });
}

// 6. Fungsi Helper: Format Tanggal agar lebih cantik
function formatTanggal(dateString) {
    const opsi = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', opsi);
}

// 7. Fungsi Logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Jalankan fungsi tampilkan data saat seluruh elemen HTML selesai dimuat
document.addEventListener('DOMContentLoaded', tampilkanData);
