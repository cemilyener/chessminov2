# ChessMino Projesi - Git Yönetimi Kararı

**Güncellenme Tarihi:** 6 Mayıs 2025

Bu belge, ChessMino projesinde kullanılacak temel Git yönetim stratejilerini tanımlar.

---

## 1. Belirlenen Stratejiler

Projenin versiyon kontrolünü etkili bir şekilde yönetmek için aşağıdaki Git stratejileri benimsenecektir:

*   **Branch Stratejisi:**
    *   `main`: Üretim ortamına çıkan stabil kod.
    *   `develop`: Ana geliştirme dalı.
    *   `feature/<özellik-adı>`: Her yeni özellik için `develop`'tan ayrılan dallar.
    *   `release/<sürüm-adı>` ve `hotfix/<hata-adı>` dalları da gerektiğinde kullanılacaktır.
*   **Commit Mesajı Formatı:** Anlamlı ve tutarlı commit mesajları için standart bir format kullanılacaktır:
    ```
    [ALAN]: Kısa açıklama

    Daha detaylı açıklama (isteğe bağlı).

    İlgili görev/sorun: #[numara]
    ```
    `[ALAN]` için `FEAT`, `FIX`, `REFACTOR`, `STYLE`, `DOCS`, `TEST` gibi değerler kullanılacaktır.
*   **Sık Commit Yapma:** Değişiklikler küçük, mantıksal parçalar halinde sık sık commit edilecektir.
*   **Sık Birleştirme (Merge):** Geliştirme dalları (`feature/*`) düzenli olarak `develop` dalı ile birleştirilerek konfliktler erken çözülecektir.

## 2. Karar Gerekçesi

Bu stratejiler, projenin geçmişini temiz ve anlaşılır tutmayı, paralel geliştirmeyi kolaylaştırmayı ve merge konflikti riskini azaltmayı amaçlar. Disiplinli Git kullanımı, projenin bakımını ve işbirliğini önemli ölçüde iyileştirir. Detaylı bilgi için [ChessMino Projesi - Git Yönetimi Sorunları ve Çözümleri](ChessMino-Git-Yonetimi-Sorunlari.md) belgesine başvurulabilir.

---

Bu belge, projenin Git yönetimi kararlarını netleştirir.