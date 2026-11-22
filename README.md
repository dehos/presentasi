# presentasi

Editor slide laporan penjualan. Satu slide untuk satu sales, dengan nama bulan, produk, angka, dan target yang bisa diedit langsung. Dibuat dengan React dan Tailwind CSS, tanpa langkah build.

## Fitur

- Slide sampul, satu slide per sales, dan slide penutup
- Edit langsung di slide: nama sales, nama bulan, nama produk, angka per bulan, target, catatan
- Grafik batang dan garis target ikut berubah saat angka diisi
- Tambah, hapus, dan urutkan slide sales; tambah atau hapus produk per sales
- Mode presentasi layar penuh (panah atau spasi untuk pindah slide, Esc untuk keluar)
- Angka diketik biasa, tampil sebagai Rp dengan titik ribuan
- Pemilih tema slide: Navy dan teal, Remotion gelap, Putih bersih, Ungu, Senja
- Data dan tema tersimpan di browser (localStorage), belum di database

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

## Menambah tema slide

Tambahkan satu entri di `SLIDE_THEMES` pada `app.jsx` dengan kunci warna yang sama seperti tema lain (`paper`, `header`, `bars`, `target`, dan seterusnya). Tema otomatis muncul di pemilih.
