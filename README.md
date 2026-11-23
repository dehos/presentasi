# Presentasi Dhouse

Editor slide laporan penjualan. Satu slide untuk satu sales, dengan nama bulan, produk, angka, dan target yang bisa diedit langsung. Dibuat dengan React dan Tailwind CSS, tanpa langkah build.

## Fitur

- Tampilan kaca dan 3D (latar gradasi, bola 3D, panel berkaca); dropdown bulan kustom, bukan bawaan browser
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
- Transisi Morph seperti PowerPoint di mode presentasi: judul, header, kartu brand, dan catatan berpindah posisi, ukuran, dan warna dari slide ke slide (elemen ber-nama sama ditandai `data-m` di `app.jsx`); menghormati pengaturan "kurangi gerakan" di perangkat
- Angka diketik biasa, tampil sebagai Rp dengan titik ribuan
- Pemilih tema slide (Langit bawaan, Lautan, Malam, Pasir, dan lainnya)
- Slide otomatis beralih ke tampilan padat bila brand banyak (5 ke atas); sampai sekitar 24 brand tetap terbaca. Di tampilan paling padat, tiap bulan hanya menampilkan persen capaian dan naik/turun
- Data dan tema tersimpan otomatis di database Supabase (tabel `lp_deck`); admin memakai cadangan di browser (localStorage)

## Export PPTX

Tombol **Export PPTX** di header membuat file `.pptx` berisi semua slide (sampul, tiap sales, penutup). Tiap slide dirender dari komponen yang sama dengan tampilan web lalu difoto resolusi 2x (2560×1440), jadi hasilnya sama persis dengan di layar: font, warna, bola 3D, dan kartu kaca. Slide berupa gambar (teks tidak bisa diedit di PowerPoint); isi tiap slide disertakan di catatan pembicara dan teks alternatif. Pustaka export (`html-to-image`, `pptxgenjs`) dimuat dari CDN hanya saat tombol ditekan.

## Logo, urutan, dan fokus sales

- Logo perusahaan (`logo.png`) tampil di login, header web, sampul, penutup, dan header tiap slide sales; ikut berpindah posisi saat transisi Morph.
- Bola 3D di latar slide acak per slide (di-seed dari id slide, jadi tetap sama di editor, presentasi, dan export).
- Admin: menu Data → **Atur urutan sales** (seret baris atau tombol panah).
- Sales: saat masuk langsung membuka slide miliknya (ditandai "Saya"), presentasi dimulai dari slide itu, dan tombol "Slide saya" kembali ke sana.

## Login dan hak akses

- **Admin**: login Supabase Auth (email + password). Hanya email yang terdaftar di tabel `lp_admin` yang boleh membaca dan menulis tabel `lp_deck`. Admin bisa mengubah semuanya.
- **Sales**: pilih nama dari dropdown (diambil dari nama di slide), password = nama huruf kecil tanpa spasi + `123` (contoh: `toni123`). Sales bisa melihat semua slide dan presentasi, tetapi hanya bisa mengubah slide miliknya sendiri (nama, rentang bulan, tema, dan slide sales lain terkunci).
- **Riwayat dan progres** (menu Data, khusus admin): siapa yang masuk atau keluar, apa yang diedit (nilai lama → baru) beserta jamnya, dan progres pengisian omzet dan target tiap sales per bulan. Edit beruntun dalam 5 menit digabung jadi satu entri. Disimpan di tabel `lp_activity`.
- Keluar akun memakai dialog konfirmasi; masuk, keluar, dan gagal masuk menampilkan toast. Bila simpan gagal, aplikasi mencoba lagi otomatis tiap 6 detik.
- Aturan ini ditegakkan di database (fungsi `lp_sales_login`, `lp_sales_save`, `lp_sales_names`, dan RLS), bukan hanya di tampilan.
- Menambah admin: tambahkan emailnya ke tabel `lp_admin` (akun harus sudah ada di Supabase Auth).

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

Isi deck disimpan sebagai satu baris JSON di tabel `public.lp_deck` (id `utama`) pada Supabase. Aplikasi membaca saat dibuka dan menyimpan otomatis sekitar 1 detik setelah perubahan. Tabel hanya bisa diakses admin yang login; sales lewat fungsi database yang memeriksa password. Jika koneksi gagal, aplikasi menampilkan peringatan dan tidak menimpa data di database.
