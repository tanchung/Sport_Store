# Tawk.to User Identification - Hướng dẫn tích hợp

## Tổng quan

Hệ thống đã được cấu hình để mỗi user có một kênh chat riêng với lịch sử được lưu lại. Khi user đăng nhập/đăng xuất, Tawk.to sẽ tự động cập nhật thông tin.

## Cách hoạt động

### 1. User đăng nhập
- `AuthContext` gọi `TawkToService.updateUser(user)` 
- Tawk.to nhận được: name, email, userId, phone
- Lịch sử chat của user này được load lại

### 2. User đăng xuất
- `AuthContext` gọi `TawkToService.logout()`
- Tawk.to chuyển sang chế độ "Guest"
- Conversation hiện tại có thể kết thúc (tùy config)

### 3. Guest user (chưa đăng nhập)
- Tawk.to vẫn hoạt động nhưng đánh dấu là "Guest"
- Sau khi user đăng nhập, có thể liên kết conversation với account

## Files đã tạo

### 1. `src/services/TawkTo/TawkToService.js`
Service chính quản lý Tawk.to widget và user identification.

**Methods:**
- `initialize(user)` - Khởi tạo widget với/không user info
- `updateUser(user)` - Cập nhật thông tin khi user đăng nhập
- `logout()` - Reset về guest mode khi đăng xuất
- `setUserAttributes(user)` - Set user details vào Tawk.to
- `show/hide/maximize/minimize()` - Control widget visibility

### 2. `src/hooks/useTawkTo.js`
React hook để dễ dàng sử dụng trong components.

**Usage:**
\`\`\`jsx
import { useTawkTo } from '../hooks/useTawkTo';

function MyComponent() {
  const tawkTo = useTawkTo();
  
  return (
    <button onClick={() => tawkTo.maximize()}>
      Mở Chat
    </button>
  );
}
\`\`\`

### 3. `src/context/AuthContext.jsx` (đã cập nhật)
- Import `TawkToService`
- Gọi `updateUser()` sau khi login/fetchUserInfo thành công
- Gọi `logout()` khi user đăng xuất

## Bảo mật - Secure Hash (QUAN TRỌNG!)

⚠️ **Hiện tại đang dùng hash đơn giản (base64) - KHÔNG an toàn cho production!**

### Cách implement đúng:

#### Backend API (Recommended)
Tạo endpoint để generate secure hash:

\`\`\`java
// UserController.java
@GetMapping("/tawk-hash/{userId}")
public ResponseEntity<String> getTawkHash(@PathVariable Long userId) {
    String secretKey = "YOUR_TAWK_API_SECRET_KEY"; // Lấy từ Tawk.to dashboard
    String hash = generateHMACSHA256(userId.toString(), secretKey);
    return ResponseEntity.ok(hash);
}

private String generateHMACSHA256(String data, String key) {
    try {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        return Hex.encodeHexString(sha256_HMAC.doFinal(data.getBytes()));
    } catch (Exception e) {
        throw new RuntimeException("Error generating hash", e);
    }
}
\`\`\`

#### Frontend update
Sau khi có API, cập nhật `TawkToService.js`:

\`\`\`javascript
// Thay thế method generateUserHash
async generateUserHash(userId) {
  try {
    const response = await fetch(\`/api/user/tawk-hash/\${userId}\`);
    const hash = await response.text();
    return hash;
  } catch (error) {
    console.error('Error getting Tawk hash:', error);
    return null;
  }
}

// Update setUserAttributes để dùng async
async setUserAttributes(user) {
  if (!window.Tawk_API) return;
  
  const hash = await this.generateUserHash(user.id);
  
  window.Tawk_API.setAttributes({
    name: user.fullName || user.name || 'User',
    email: user.email || '',
    hash: hash,
    userId: user.id.toString(),
    phone: user.phoneNumber || user.phone || '',
  });
  // ... rest of code
}
\`\`\`

## Lấy Tawk.to API Secret Key

1. Đăng nhập vào [Tawk.to Dashboard](https://dashboard.tawk.to)
2. Vào **Administration** → **Property Settings**
3. Tìm section **Secure Mode**
4. Enable "Secure Mode" và copy **API Secret Key**
5. Lưu key này vào environment variables backend:
   \`\`\`
   TAWK_API_SECRET=your_secret_key_here
   \`\`\`

## Custom Attributes & Tags

Có thể thêm nhiều thông tin hơn vào Tawk.to:

\`\`\`javascript
// Trong TawkToService.setUserAttributes
window.Tawk_API.addTags([
  user.role || 'customer',
  user.isVerified ? 'verified' : 'unverified',
  user.membershipLevel || 'basic',
  \`registered-\${new Date(user.createdAt).getFullYear()}\`
]);

// Custom attributes
window.Tawk_API.setAttributes({
  // ... existing attributes
  'Số đơn hàng': user.totalOrders || 0,
  'Tổng chi tiêu': user.totalSpent || 0,
  'Thành viên từ': new Date(user.createdAt).toLocaleDateString('vi-VN'),
  'Địa chỉ': user.address || '',
});
\`\`\`

## Events & Callbacks

Lắng nghe events từ Tawk.to:

\`\`\`javascript
// Trong component
const tawkTo = useTawkTo();

useEffect(() => {
  // Khi chat được load
  tawkTo.on('load', () => {
    console.log('Tawk.to loaded');
  });
  
  // Khi có tin nhắn mới
  tawkTo.on('chatMessageVisitor', (message) => {
    console.log('User sent:', message);
  });
  
  // Khi admin trả lời
  tawkTo.on('chatMessageAgent', (message) => {
    console.log('Agent replied:', message);
  });
  
  // Khi chat được minimize
  tawkTo.on('chatMinimized', () => {
    console.log('Chat minimized');
  });
}, [tawkTo]);
\`\`\`

## Testing

### Test với user đã đăng nhập:
1. Đăng nhập vào website
2. Mở chat widget
3. Gửi tin nhắn
4. Kiểm tra Tawk.to dashboard - sẽ thấy user info (name, email, userId)
5. Đăng xuất và đăng nhập lại
6. Mở chat - lịch sử conversation vẫn còn

### Test với guest user:
1. Truy cập website không đăng nhập
2. Mở chat và gửi tin nhắn
3. Tawk.to dashboard sẽ hiển thị "Khách" với tag "guest"

## Troubleshooting

### Chat không hiển thị user info
- Check console: `window.Tawk_API` có tồn tại không?
- Verify user data được pass vào `setUserAttributes`
- Check Tawk.to dashboard → Settings → Visitor Information

### Lịch sử chat không load
- Cần enable Secure Mode với hash đúng
- Verify userId phải consistent (cùng 1 giá trị mỗi lần login)
- Check Tawk.to dashboard → Chat History

### Widget không xuất hiện
- Verify Tawk.to script đã load trong `index.html`
- Check Property ID trong script có đúng không
- Test ở incognito mode để loại trừ cache

## Advanced Features

### 1. Pre-chat form customization
Có thể ẩn pre-chat form cho user đã đăng nhập (vì đã có info):

\`\`\`javascript
if (user && user.id) {
  window.Tawk_API.hideWidget(); // Ẩn tạm
  window.Tawk_API.setAttributes({...}, (error) => {
    if (!error) {
      window.Tawk_API.showWidget(); // Hiện lại sau khi set xong
    }
  });
}
\`\`\`

### 2. Auto-open chat cho specific pages
\`\`\`javascript
// Trong component cụ thể
useEffect(() => {
  const tawkTo = useTawkTo();
  
  // Auto-open chat ở trang support
  if (window.location.pathname === '/support') {
    setTimeout(() => tawkTo.maximize(), 1000);
  }
}, []);
\`\`\`

### 3. Notification khi có tin nhắn mới
\`\`\`javascript
tawkTo.on('chatMessageAgent', () => {
  // Show browser notification
  if (Notification.permission === 'granted') {
    new Notification('Tin nhắn mới từ VNHI Store', {
      body: 'Bạn có tin nhắn mới từ đội ngũ hỗ trợ',
      icon: '/logo.png'
    });
  }
});
\`\`\`

## Best Practices

1. **Luôn dùng Secure Hash** - Tránh user giả mạo
2. **Không expose sensitive data** - Chỉ gửi info cần thiết
3. **Handle errors gracefully** - Tawk.to có thể bị block bởi adblockers
4. **Consistent userId** - Dùng database ID, không dùng session ID
5. **Tag appropriately** - Giúp phân loại và filter conversations

## Resources

- [Tawk.to JavaScript API](https://developer.tawk.to/jsapi/)
- [Secure Mode Documentation](https://help.tawk.to/article/secure-mode)
- [Visitor Attributes Guide](https://help.tawk.to/article/visitor-attributes)
