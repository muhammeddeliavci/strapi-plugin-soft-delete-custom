# Changelog

## [1.0.3] - 2026-02-05

### Fixed
- **CRITICAL:** Document Service decorator eklendi - Content Manager'dan silme artık çalışıyor
- Strapi v5'te Content Manager'ın kullandığı `strapi.documents` servisi decorate edildi
- Debug logları eklendi

### Added
- `decorateDocumentService()` metodu eklendi
- Document Service delete ve deleteMany operasyonları soft delete'e dönüştürülüyor

## [1.0.2] - 2026-02-05

### Fixed
- React DnD context hatası tamamen düzeltildi - Explorer bileşeni DndProvider ile sarmalandı
- react-dnd ve react-dnd-html5-backend dependency'leri eklendi

## [1.0.1] - 2026-02-05

### Fixed
- React DnD context hatası düzeltildi
- Plugin registration sırası optimize edildi (registerPlugin önce, addMenuLink sonra)
- Strapi v5'in admin panel yapısıyla uyumluluk sağlandı

### Changed
- Admin menü linkinde route yapısı güncellendi (`/plugins/${PLUGIN_ID}`)
- Build output'u iyileştirildi

## [1.0.0] - 2026-02-05

### Added
- İlk sürüm
- Soft delete fonksiyonalitesi
- Explorer sayfası
- Restore ve permanent delete servisleri
