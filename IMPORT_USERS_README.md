# User Import Guide (Excel)

## Cách sử dụng:

### 1️⃣ Tạo file Excel mẫu (99 users)
```bash
npm run create-sample-excel
```
Sẽ tạo file `users_import.xlsx` với 99 users từ user01 đến user99

### 2️⃣ Hoặc tạo file Excel của bạn
File Excel cần có 2 cột:
- **Cột 1**: username
- **Cột 2**: email

**Ví dụ:**
```
| username | email              |
|----------|-------------------|
| user01   | user01@haha.com   |
| user02   | user02@haha.com   |
| ...      | ...               |
```

### 3️⃣ Chạy import
```bash
node importUsers.js <path-to-file.xlsx>
```

**Ví dụ:**
```bash
node importUsers.js ./users_import.xlsx
node importUsers.js ./data/users.xlsx
```

### 4️⃣ Kết quả
- ✅ Users được tạo trong MongoDB
- ✅ Password ngẫu nhiên 16 ký tự được gửi qua email MailTrap
- ✅ File `user_passwords_log.json` lưu trữ log (username, email, password, timestamp)

---

## MailTrap Configuration

File `importUsers.js` sử dụng MailTrap. Cần cập nhật credentials:

Tìm dòng trong `importUsers.js`:
```javascript
auth: {
    user: "eb23f10bb2e21e",     // Thay bằng user của bạn
    pass: "d36c9b3c3db877",     // Thay bằng password của bạn
},
```

Lấy từ: https://mailtrap.io → Settings → SMTP Credentials

---

## Chi tiết quá trình:
1. Đọc file Excel
2. Kết nối MongoDB
3. Lấy role "user"
4. Với mỗi user:
   - Kiểm tra username/email đã tồn tại chưa
   - Tạo password ngẫu nhiên 16 ký tự
   - Hash password (bcrypt)
   - Lưu vào MongoDB
   - Gửi email với password qua MailTrap
   - Delay 100ms để không quá tải

---

## Xem email trên MailTrap

1. Truy cập https://mailtrap.io
2. Đăng nhập
3. Chọn Inbox
4. Xem tất cả emails được gửi

