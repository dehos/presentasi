# presentasi

Editor slide laporan penjualan. Satu slide untuk satu sales, dengan nama bulan, produk, angka, dan target yang bisa diedit langsung. Dibuat dengan React dan Tailwind CSS, tanpa langkah build.

## Fitur

- Slide sampul, satu slide per sales, dan slide penutup
- Rentang bulan dipilih lewat selector (maksimal 6 bulan)
- Form Isi data per bulan: pilih bulan, lalu isi total penjualan dan target tiap brand
- Slide otomatis menghitung persentase capaian terhadap target tiap brand per bulan, serta kenaikan atau penurunan dibanding bulan sebelumnya
- Klik elemen mana pun di slide sales (nama, brand, bulan, catatan) untuk langsung menuju kolom yang sesuai di form Isi data
- Catatan di slide tampil sebagai: Catatan dari <nama sales>: “isi catatan”
- Perubahan di form tersimpan otomatis ke database; tombol Simpan menyimpan seketika dan menampilkan toast
- Konfirmasi sebelum menghapus brand, slide, atau mengosongkan data
- Tambah, hapus, dan urutkan slide sales; tambah atau hapus brand per sales
- Mode presentasi layar penuh (panah atau spasi untuk pindah slide, Esc untuk keluar)
- Angka diketik biasa, tampil sebagai Rp dengan titik ribuan
- Pemilih tema slide: Navy dan teal, Remotion gelap, Putih bersih, Ungu, Senja
- Data dan tema tersimpan otomatis di database Supabase (tabel `lp_deck`), tanpa login; cadangan di browser (localStorage)

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

## Database

Isi deck disimpan sebagai satu baris JSON di tabel `public.lp_deck` (id `utama`) pada Supabase. Aplikasi membaca saat dibuka dan menyimpan otomatis sekitar 1 detik setelah perubahan. Tidak ada login, jadi siapa pun yang punya alamat halaman ini bisa melihat dan mengubah data. Jika koneksi gagal, aplikasi menampilkan peringatan dan tidak menimpa data di database.
