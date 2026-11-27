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

- Di tabel angka tiap brand, bulan terbaru berada di baris paling atas (bar grafik tetap urut dari bulan awal ke akhir)
- Admin: tombol Menu → **Rentang bulan** mengubah rentang yang langsung dipakai semua slide sales, ringkasan, dan export

- Login admin memakai username (**Toni**), bukan email; Toni tidak muncul di daftar login sales
- Tombol **Download** (PPTX) hanya untuk admin; tombol **Lihat Presentasi** untuk semua
- Tema slide ada 7 model (**Neumorph**: latar tosca lembut, kartu timbul dan gelas cekung dengan bayangan ganda, semua teks berwarna tosca, font Manrope; **Glass**: latar hijau gelap ke hitam, aksen oranye, kartu kaca blur, font Manrope tipis, mengikuti template "Glass Morph Pitch Deck"; **Morph**: latar gradasi ungu-biru, kartu kaca, bola 3D, font Montserrat, mengikuti template PowerPoint Morph); lainnya: **Morph**: latar gradasi ungu-biru, kartu kaca, bola 3D, font Montserrat, mengikuti template PowerPoint Morph): Langit (kaca + bola 3D), Korporat (header gelap, kartu tegas, kotak), Malam neon (kartu bulat, cincin), Editorial (garis tegas, lingkaran datar). Tema lama otomatis dipetakan ke 4 model ini

- Login: satu daftar nama. **Toni (Admin)** (merah) di paling atas, lalu semua sales; password dicek sesuai pilihan
- **Canvasing**: satu atau beberapa slide otomatis sebelum Penutup (4 kartu per halaman). Sales dan admin mengisi form (nama kontraktor/konsumen, produk yang ditawarkan, catatan maks. 250 karakter, foto). Foto diperkecil otomatis. Sales hanya bisa mengubah/menghapus entri sendiri, admin semuanya. Data di tabel `lp_canvas` (fungsi `lp_canvas_list/save/delete` untuk sales)

## Export PPTX

Tombol **Export PPTX** di header membuat file `.pptx` berisi semua slide (sampul, tiap sales, penutup) sebagai **objek asli PowerPoint**: teks, kotak kartu, bar grafik, garis target, label persen, bola 3D (bentuk bergradasi) dan logo, semuanya bisa diedit. Posisi dan gaya dibaca dari hasil render web (`pptx-export.js`), jadi tampilannya mengikuti web. Font Inter dan Space Grotesk perlu terpasang di komputer agar tampilan identik.

Setiap objek bernama sama antar slide dengan awalan `!!` (`!!title`, `!!sub`, `!!logo`, `!!card-0`, `!!card-0.3`, `!!orb0`, ...). Transisi **Morph** tidak dipasang otomatis: di PowerPoint pilih semua slide → tab Transitions → Morph; objek ber-awalan `!!` yang sama akan berpindah/berubah mulus. Isi tiap slide juga ada di catatan pembicara. Pustaka (`pptxgenjs`, `jszip`) dimuat dari CDN hanya saat tombol ditekan.

## Logo, urutan, dan fokus sales

- Logo perusahaan (`logo.png`) tampil di login, header web, sampul, penutup, dan header tiap slide sales; ikut berpindah posisi saat transisi Morph.
- Slide sales: maksimal 5 brand per slide, sejajar dalam satu baris (kelebihannya di slide berikutnya), semua brand tampil dengan grafik batang + target. Setelah slide brand terakhir tiap sales ada slide **Kesimpulan** (kalau sales hanya punya 1–2 brand, kesimpulan digabung di slide yang sama) (total semua brand per bulan, capaian, tren, brand tertinggi dan perlu perhatian; hanya membandingkan brand di dalam satu sales)
- Grafik bulanan bergaya kaca: tabung transparan = 100% target, cairan = omzet (tanpa angka di dalam gelas), nama bulan di bawah gelas. Di bawahnya satu baris per bulan: nominal Rp utuh dan panah naik/turun (bulan pertama tanpa panah). Brand lebih dari 5 dibagi rata ke beberapa slide (6 = 3 + 3, 10 = 5 + 5)
- Download PPTX menyematkan font (Inter, Manrope, Montserrat, Space Grotesk dari folder `fonts/`) supaya tampilan di PowerPoint sama dengan web; kalau PowerPoint (mis. versi Mac) tidak memakai font sematan, instal font tersebut
- Bola 3D di latar slide acak per slide (di-seed dari id slide, jadi tetap sama di editor, presentasi, dan export).
- Admin: tombol Menu → **Atur urutan sales** (seret baris atau tombol panah).
- Sales: saat masuk langsung membuka slide miliknya (ditandai "Saya"), presentasi dimulai dari slide itu, dan tombol "Slide saya" kembali ke sana.

## Login dan hak akses

- **Admin**: login Supabase Auth (email + password). Hanya email yang terdaftar di tabel `lp_admin` yang boleh membaca dan menulis tabel `lp_deck`. Admin bisa mengubah semuanya.
- **Sales**: pilih nama dari dropdown (diambil dari nama di slide), password = nama huruf kecil tanpa spasi + `123` (contoh: `toni123`). Sales bisa melihat semua slide dan presentasi, tetapi hanya bisa mengubah slide miliknya sendiri (nama, rentang bulan, tema, dan slide sales lain terkunci).
- **Riwayat dan progres** (tombol Menu, khusus admin): siapa yang masuk atau keluar, apa yang diedit (nilai lama → baru) beserta jamnya, dan progres pengisian omzet dan target tiap sales per bulan. Edit beruntun dalam 5 menit digabung jadi satu entri. Disimpan di tabel `lp_activity`.
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

## Catatan performa
Halaman memuat `app.js` (hasil kompilasi `app.jsx`, sudah diperkecil) sehingga tidak perlu Babel di browser.
`app.jsx` tetap menjadi sumber; setelah mengubahnya, buat ulang `app.js` dengan esbuild
(`esbuild app.jsx --outfile=app.js --minify --target=es2019 --format=iife --loader:.jsx=jsx`).

## Warna persen
Persentase capaian (0–100%) diwarnai gradasi merah, oranye, hijau; tiap besaran persen punya warna sendiri (fungsi `pcol` di `app.jsx`). Di atas 100% tetap hijau penuh.
