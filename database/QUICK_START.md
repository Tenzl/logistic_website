# ⚡ Quick Start - Migration Guide

## 🎯 KHÔNG CẦN XÓA DATABASE!

Migration chỉ cập nhật 2 bảng: `provinces` và `ports`

## 🚀 Chạy Migration (3 bước đơn giản)

### Bước 1: Backup (5 giây)
```bash
mysql -u username -p database_name < database/backup_before_migration.sql
```

### Bước 2: Migration (10 giây)  
```bash
mysql -u username -p database_name < database/migration_update_provinces_newvn.sql
```

### Bước 3: Verify (5 giây)
```bash
mysql -u username -p database_name < database/verify_port_migration.sql
```

**Done! ✅**

---

## 🆘 Nếu gặp lỗi "Duplicate entry"

Chạy lệnh này trước, sau đó chạy lại Bước 2:

```sql
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM ports;
DELETE FROM provinces;
ALTER TABLE ports AUTO_INCREMENT = 1;
ALTER TABLE provinces AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 🛡️ Migration AN TOÀN với Transaction

Dùng script này để có thể UNDO:

```bash
mysql -u username -p database_name < database/migration_safe_mode.sql
```

Sau khi chạy, xem kết quả:
- Nếu OK → gõ: `COMMIT;`
- Nếu sai → gõ: `ROLLBACK;`

---

## 📊 Kết quả mong đợi

```
✓ Provinces: 34 (all active)
✓ Ports: 18 (all active)
✓ Provinces with ports: 13
✓ Coverage: ~38%
✓ Province IDs: Match ma_tinh from geojson (1, 4, 8, 11, 12, 14, 15, 19...)
```

## 💡 Quan trọng

**Province ID = ma_tinh từ newvn.geojson**
- Hà Nội: ID = 1 (ma_tinh: "01")
- Cao Bằng: ID = 4 (ma_tinh: "04")
- TP.HCM: ID = 79 (ma_tinh: "79")

**ID có gaps (không sequential)** - Đây là BÌNH THƯỜNG!
- Sequence: 1, 4, 8, 11, 12, 14, 15, 19, 20, 22...
- Không có: 2, 3, 5, 6, 7, 9, 10, 13...

📖 Chi tiết: `PROVINCE_ID_MAPPING.md`

---

## 🔙 Rollback nếu cần

```bash
mysql -u username -p database_name < database/rollback_migration.sql
```

---

## 📖 Tài liệu đầy đủ

- **WHAT_MIGRATION_DOES.md** - Giải thích chi tiết (ĐỌC NÀY TRƯỚC!)
- **MIGRATION_STEPS.md** - Hướng dẫn từng bước
- **PORT_MAPPING_GUIDE.md** - Chi tiết về cảng

---

## ❓ FAQ

**Q: Có mất dữ liệu không?**  
A: Có backup tự động, có thể rollback bất cứ lúc nào

**Q: Các bảng khác có bị ảnh hưởng không?**  
A: KHÔNG, chỉ 2 bảng provinces và ports

**Q: Có cần downtime không?**  
A: Recommended, nhưng nếu traffic thấp thì không cần

**Q: Mất bao lâu?**  
A: ~20-30 giây total

**Q: Có thể test trước không?**  
A: CÓ, dùng `migration_safe_mode.sql` với transaction

---

**Need help?** Đọc: `WHAT_MIGRATION_DOES.md`

