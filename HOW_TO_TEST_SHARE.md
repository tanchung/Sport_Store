# Hướng Dẫn Test Share Facebook từ Localhost

## Cách 1: Dùng ngrok (Khuyên dùng - Nhanh nhất)

### Bước 1: Cài đặt ngrok
```powershell
# Tải ngrok từ: https://ngrok.com/download
# Hoặc dùng winget (Windows 11):
winget install --id=ngrok.ngrok -e
```

### Bước 2: Chạy app của bạn
```powershell
npm run dev
# App chạy tại http://localhost:5174
```

### Bước 3: Tạo public URL
Mở terminal mới và chạy:
```powershell
ngrok http 5174
```

Bạn sẽ nhận được URL dạng:
```
https://abc123.ngrok-free.app
```

### Bước 4: Test
1. Mở URL ngrok trong browser
2. Click share Facebook
3. Facebook sẽ lấy được đầy đủ: tiêu đề, hình, mô tả

### Bước 5: Debug với Facebook
- Vào: https://developers.facebook.com/tools/debug/
- Paste URL ngrok của bạn
- Click "Debug" để xem Facebook đọc được gì

---

## Cách 2: Deploy lên Vercel (Miễn phí - Production)

### Bước 1: Cài Vercel CLI
```powershell
npm install -g vercel
```

### Bước 2: Deploy
```powershell
vercel
# Làm theo hướng dẫn
```

### Bước 3: Test
Vercel sẽ cho bạn URL dạng: `https://milk-store.vercel.app`

---

## Cách 3: Test Local (Giới hạn)

### Có thể test:
✅ Nút share hiện ra
✅ Click được nút share
✅ Popup share mở ra

### KHÔNG thể test:
❌ Preview hình ảnh trên Facebook
❌ Người khác mở link
❌ Facebook Debugger

### Cách test:
1. Chạy `npm run dev`
2. Mở http://localhost:5174/san-pham/3
3. Kéo xuống phần "Chia sẻ sản phẩm này"
4. Kiểm tra:
   - Nút share có hiện không?
   - Click vào có popup không?
   - F12 → Console có lỗi không?

---

## Test Meta Tags Ngay Trên Localhost

Mở F12 → Console và chạy:

```javascript
// Kiểm tra các meta tags
document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
  console.log(tag.getAttribute('property'), ':', tag.getAttribute('content'));
});

// Kiểm tra ShareThis đã load chưa
console.log('ShareThis loaded:', !!window.__sharethis__);

// Kiểm tra image URL
const ogImage = document.querySelector('meta[property="og:image"]');
console.log('Image URL:', ogImage?.getAttribute('content'));
```

Kết quả mong đợi:
```
og:type : product
og:url : http://localhost:5174/san-pham/3
og:title : Tên sản phẩm
og:description : Mô tả sản phẩm...
og:image : http://localhost:5174/path/to/image.jpg (hoặc URL Cloudinary)
ShareThis loaded: true
```

---

## Khuyến Nghị

**Để test đầy đủ tính năng share Facebook:**
👉 **Dùng ngrok** (5 phút setup, test được ngay)

**Để có URL chính thức:**
👉 **Deploy lên Vercel** (10 phút, có URL vĩnh viễn)

**Nếu chỉ muốn xem giao diện:**
👉 **Test trên localhost** (đủ để kiểm tra UI)
