# presentasi

Editor slide laporan penjualan. Satu slide untuk satu sales, dengan nama bulan, produk, angka, dan target yang bisa diedit langsung. Dibuat dengan React dan Tailwind CSS, tanpa langkah build.

## Fitur

- Slide sampul, satu slide per sales, dan slide penutup
- Edit langsung di slide: nama sales, nama bulan, nama produk, angka per bulan, target, catatan
- Grafik batang dan garis target ikut berubah saat angka diisi
- Tambah, hapus, dan urutkan slide sales; tambah atau hapus produk per sales
- Mode presentasi layar penuh (panah atau spasi untuk pindah slide, Esc untuk keluar)
- Pemilih tema aplikasi: Remotion gelap, Remotion terang, Ungu, Hijau
- Data dan tema tersimpan di browser (localStorage)

## Menjalankan

Buka `index.html` lewat server statis apa pun, misalnya:

```bash
python3 -m http.server 8000
```

lalu buka http://localhost:8000. Membuka file langsung dengan `file://` tidak cukup, karena `app.jsx` dimuat lewat permintaan HTTP.

React, Tailwind, dan Babel dimuat dari CDN, jadi perlu koneksi internet.

## Struktur

| File | Isi |
| --- | --- |
| `index.html` | Halaman dan pemuatan pustaka |
| `app.jsx` | Seluruh komponen React |
| `styles.css` | Tema aplikasi dan gaya dasar |

## Menambah tema

Tambahkan blok `:root[data-theme="nama"]` di `styles.css` dengan variabel warna yang sama, lalu daftarkan di `APP_THEMES` pada `app.jsx`.
