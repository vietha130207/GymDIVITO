const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'QuanLyGym',
  options: {
    instanceName: 'vieth',
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Kiểm tra kết nối nhanh
app.get('/api/health', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().query('SELECT 1 AS ok');
    res.json({ status: 'connected', database: 'QuanLyGym' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Lấy toàn bộ dữ liệu các bảng chính để đổ vào web
app.get('/api/gym-data', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const [
      goiTap,
      hoiVien,
      dangKyGoi,
      giaoDich,
      phieuThu,
      lichTap,
      nhanVienPT,
      nguoiDung,
    ] = await Promise.all([
      pool.request().query('SELECT * FROM GoiTap'),
      pool.request().query('SELECT * FROM HoiVien'),
      pool.request().query('SELECT * FROM DangKyGoi'),
      pool.request().query('SELECT * FROM GiaoDichThanhToan'),
      pool.request().query('SELECT * FROM PhieuThu'),
      pool.request().query('SELECT * FROM LichTap'),
      pool.request().query('SELECT * FROM NhanVien_PT'),
      pool.request().query('SELECT MaND, TenDangNhap, VaiTro FROM NguoiDung'),
    ]);

    res.json({
      GoiTap: goiTap.recordset,
      HoiVien: hoiVien.recordset,
      DangKyGoi: dangKyGoi.recordset,
      GiaoDichThanhToan: giaoDich.recordset,
      PhieuThu: phieuThu.recordset,
      LichTap: lichTap.recordset,
      NhanVien_PT: nhanVienPT.recordset,
      NguoiDung: nguoiDung.recordset,
    });
  } catch (err) {
    console.error('Lỗi truy vấn SQL:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});