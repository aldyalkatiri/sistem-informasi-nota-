<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nota Bermasalah | Ali Akatiri System</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    
    <link rel="stylesheet" href="dashboard.css">
</head>
<body class="enterprise-bg">

    <nav class="navbar navbar-dark bg-primary shadow-sm mb-4">
        <div class="container d-flex justify-content-between align-items-center">
            <span class="navbar-brand fw-bold">
                <i class="fas fa-exclamation-triangle me-2 text-warning"></i> NOTA BERMASALAH
            </span>
            
            <div class="d-flex align-items-center gap-2">
                <a href="dashboard.html" class="btn btn-light btn-sm fw-bold px-3 shadow-sm text-primary">
                    <i class="fas fa-arrow-left me-2"></i> KEMBALI KE DASHBOARD
                </a>
                <span id="displayUser" class="text-white small fw-bold d-none d-md-inline ms-2"></span>
                <button onclick="logout()" class="btn btn-outline-light btn-sm fw-bold px-3 ms-2">LOGOUT</button>
            </div>
        </div>
    </nav>

    <div class="container mb-5">
        
        <div id="panelInputMasalah" class="card border-0 shadow-sm mb-4 border-start border-danger border-5">
            <div class="card-header bg-white py-3">
                <h6 class="fw-bold mb-0 text-danger"><i class="fas fa-edit me-2"></i>LAPORKAN TEMUAN NOTA BERMASALAH</h6>
            </div>
            <div class="card-body p-4">
                <form id="formMasalah">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="small fw-bold">TANGGAL TEMUAN</label>
                            <input type="date" id="tglMasalah" class="form-control" required>
                        </div>
                        <div class="col-md-6">
                            <label class="small fw-bold">DESKRIPSI KESALAHAN / MASALAH</label>
                            <input type="text" id="descMasalah" class="form-control" placeholder="Contoh: Nota #001 salah jumlah unit, harusnya 5 tertulis 50" required>
                        </div>
                        <div class="col-md-3">
                            <label class="small fw-bold">UPLOAD FOTO BUKTI</label>
                            <input type="file" id="fotoMasalah" class="form-control" accept="image/*" required>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-danger w-100 mt-4 fw-bold py-2 shadow-sm">
                        <i class="fas fa-paper-plane me-2"></i> SIMPAN LAPORAN MASALAH
                    </button>
                </form>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h6 class="fw-bold text-dark mb-0"><i class="fas fa-list me-2"></i>RIWAYAT NOTA BERMASALAH</h6>
                <div class="d-flex gap-2">
                    <input type="date" id="filterTglMasalah" class="form-control form-control-sm" style="width: 150px;">
                    <button onclick="loadMasalah()" class="btn btn-primary btn-sm px-3">FILTER</button>
                    <button onclick="exportMasalahToExcel()" class="btn btn-success btn-sm px-3"><i class="fas fa-file-excel"></i></button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr class="text-center">
                            <th>No</th>
                            <th>Tanggal Temuan</th>
                            <th class="text-start">Deskripsi Masalah</th>
                            <th>Pelapor</th>
                            <th>Foto</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabelMasalah" class="text-center">
                        </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="masalah.js"></script>
    <script>
        // Fungsi logout global agar tidak error jika index.js tidak dipanggil
        function logout() {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    </script>
</body>
</html>
