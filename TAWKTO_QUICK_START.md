# Tawk.to - Quick Start Guide

## ✅ Đã cài đặt

### 1. Script trong `index.html`
Widget Tawk.to đã được thêm vào website.

### 2. Service Layer
- **TawkToService** (`src/services/TawkTo/TawkToService.js`) - Quản lý widget và user identification

### 3. Integration với Auth
- Tự động cập nhật user info khi login
- Reset về guest mode khi logout
- Khởi tạo cho guest user chưa đăng nhập

### 4. React Hook
- **useTawkTo** hook để dễ dàng sử dụng trong components

## 🚀 Cách sử dụng

### Tự động (Không cần code thêm)
Widget sẽ tự động:
- Nhận diện user khi đăng nhập
- Lưu lịch sử chat cho mỗi user
- Reset khi đăng xuất

### Manual Control trong Components

\`\`\`jsx
import { useTawkTo } from '../hooks/useTawkTo';

function MyComponent() {
  const tawkTo = useTawkTo();
  
  return (
    <div>
      <button onClick={() => tawkTo.maximize()}>Mở Chat</button>
      <button onClick={() => tawkTo.hide()}>Ẩn Widget</button>
    </div>
  );
}
\`\`\`

## 🔒 Bảo mật (TODO)

⚠️ **QUAN TRỌNG**: Cần implement secure hash từ backend!

### Bước 1: Tạo API endpoint (Backend - Java Spring Boot)

\`\`\`java
@GetMapping("/api/user/tawk-hash/{userId}")
public ResponseEntity<String> getTawkHash(@PathVariable Long userId) {
    String secret = env.getProperty("TAWK_API_SECRET");
    String hash = generateHMAC_SHA256(userId.toString(), secret);
    return ResponseEntity.ok(hash);
}
\`\`\`

### Bước 2: Lấy Secret Key
1. Vào [Tawk.to Dashboard](https://dashboard.tawk.to)
2. **Administration** → **Property Settings** → **Secure Mode**
3. Enable và copy **API Secret Key**
4. Thêm vào `.env` backend: `TAWK_API_SECRET=your_key`

### Bước 3: Update Frontend
Xem chi tiết trong `TAWKTO_INTEGRATION_GUIDE.md`

## 📊 Xem Dashboard

Vào [Tawk.to Dashboard](https://dashboard.tawk.to) để:
- Xem tất cả conversations
- Trả lời tin nhắn real-time
- Xem user info, tags, custom attributes
- Phân tích metrics

## 🎯 Features

### User Identification
- ✅ Name
- ✅ Email  
- ✅ User ID (unique)
- ✅ Phone number
- ✅ Role tags

### Auto Sync
- ✅ Login → Load user profile
- ✅ Logout → Guest mode
- ✅ Page reload → Restore conversation

### Guest Support
- ✅ Chat vẫn hoạt động khi chưa đăng nhập
- ✅ Tag "guest" để dễ phân biệt

## 📖 Chi tiết

Xem full documentation: `TAWKTO_INTEGRATION_GUIDE.md`
