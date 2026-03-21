# Adisyon Uygulaması - Temel Şablon

Bu, farklı projelerde kullanılabilecek yeniden kullanılabilir bir adisyon uygulaması temel şablonudur.

## 🎯 Özellikler

### Admin Paneli
- ✅ Masa yönetimi (ekle/düzenle/sil)
- ✅ Menü yönetimi (kategori, ürün, fiyat)
- ✅ Dashboard istatistikleri
- ✅ Raporlar (günlük satış, masa bazlı)

### Garson Paneli
- ✅ Masa listesi (boş/dolu/ödendi durumu)
- ✅ Sipariş ekleme
- ✅ Hesaplama ve ödeme
- ✅ Masa kapatma

### Teknik Özellikler
- ✅ LocalStorage ile veri kalıcılığı
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ Modern arayüz (Tailwind CSS)
- ✅ Türkçe dil desteği
- ❌ Masa ücreti yok
- ❌ QR sipariş yok (sonradan eklenebilir)

## 🛠 Teknolojiler

- **Frontend**: React + Vite
- **Stil**: Tailwind CSS
- **State**: React Context API
- **Routing**: React Router
- **Icons**: Lucide React

## 📦 Kurulum

\`\`\`bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Build
npm run build
\`\`\`

## 👤 Demo Hesaplar

| Rol | Kullanıcı Adı | Şifre |
|-----|---------------|-------|
| Admin | admin | admin |
| Garson | garson | garson |

## 📁 Proje Yapısı

\`\`\`
src/
├── components/
│   └── layout/          # Layout bileşenleri
├── pages/
│   ├── Admin/           # Admin sayfaları
│   ├── Garson/          # Garson sayfaları
│   └── Login/           # Giriş sayfası
├── context/             # Context providers
├── data/                # Başlangıç verileri
└── utils/               # Yardımcı fonksiyonlar
\`\`\`

## 🎨 Özelleştirme

### Renkler
\`tailwind.config.js\` dosyasında değiştirebilirsiniz.

### Menü Kategorileri
\`src/data/initialData.js\` dosyasında değiştirebilirsiniz.

### Kullanıcılar
\`src/data/initialData.js\` dosyasında yönetebilirsiniz.

## 🔄 Yeni Projede Kullanım

Bu temeli yeni bir projede kullanmak için:

1. Projeyi kopyala
2. \`src/data/initialData.js\` dosyasını düzenle (menü, masalar, vb.)
3. Logo ve marka öğelerini değiştir
4. Renkleri özelleştir
5. İhtiyacına göre yeni özellikler ekle

## 📝 Sonradan Eklenebilecek Özellikler

- [ ] Veritabanı entegrasyonu
- [ ] Push notification
- [ ] QR sipariş sistemi
- [ ] Masa ücreti/oturum ücreti
- [ ] Multi-language desteği
- [ ] Yazdırma özelliği
