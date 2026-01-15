// PROTEKSI HALAMAN: Cek jika belum login
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Fitur Logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
// Fungsi Export ke Excel
function exportToExcel() {
    // 1. Pilih tabel yang akan diekspor
    const table = document.getElementById("tabelNota");
    
    // Cek jika tabel kosong
    if (table.rows.length === 0) {
        alert("Tidak ada data untuk diekspor!");
        return;
    }

    // 2. Persiapkan data (Menghilangkan kolom "Aksi" agar tidak ikut ter-export)
    const rows = [];
    const headers = ["No", "Kode Nota", "Deskripsi", "Shift", "Jumlah", "Waktu Input"];
    rows.push(headers);

    // Ambil data dari tiap baris tabel
    const trs = table.querySelectorAll("tr");
    trs.forEach((tr, index) => {
        const tds = tr.querySelectorAll("td");
        const rowData = [
            index + 1,                    // No
            tds[1].innerText,             // Kode Nota
            tds[2].innerText,             // Deskripsi
            tds[3].innerText,             // Shift
            tds[4].innerText.replace(' Nota', ''), // Jumlah (hanya angka)
            tds[5].innerText              // Waktu
        ];
        rows.push(rowData);
    });

    // 3. Proses konversi ke Excel menggunakan SheetJS
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Atur lebar kolom agar rapi
    const wscols = [
        {wch: 5},  // No
        {wch: 15}, // Kode Nota
        {wch: 30}, // Deskripsi
        {wch: 10}, // Shift
        {wch: 10}, // Jumlah
        {wch: 25}  // Waktu
    ];
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Nota");

    // 4. Download file
    const fileName = `Laporan_Nota_${new Date().toLocaleDateString('id-ID')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

// Logic Tabel Nota
document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const selectJenis = document.getElementById('kodeJenis');
    const shift = document.getElementById('shift').value;
    const jumlah = document.getElementById('jumlah').value;
    const kode = selectJenis.value;
    const deskripsi = selectJenis.options[selectJenis.selectedIndex].text;
    const waktu = new Date().toLocaleString('id-ID', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' });

    const tabel = document.getElementById('tabelNota');
    const row = document.createElement('tr');
    row.className = 'new-row';
    
    row.innerHTML = `
        <td class="fw-bold row-num"></td>
        <td><span class="badge bg-primary">${kode}-${shift}</span></td>
        <td>${deskripsi}</td>
        <td><span class="badge ${shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">${shift}</span></td>
        <td class="fw-bold text-center">${jumlah}</td>
        <td><small>${waktu}</small></td>
        <td class="text-center action-col">
            <button class="btn btn-danger btn-sm py-0 px-2 btn-hapus" style="font-size:11px">Hapus</button>
        </td>
    `;

    row.querySelector('.btn-hapus').addEventListener('click', function() {
        if(confirm('Hapus data ini?')) { row.remove(); updateNomor(); }
    });

    tabel.prepend(row);
    updateNomor();
    this.reset();
});

function updateNomor() {
    document.querySelectorAll('.row-num').forEach((cell, i) => cell.innerText = i + 1);
}

