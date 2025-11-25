# Fix: Đăng xuất/Đăng nhập lại vẫn hiện chat cũ

## ✅ Đã sửa

### Vấn đề
Khi logout và login lại với tài khoản khác, Tawk.to vẫn hiển thị conversation cũ.

### Nguyên nhân
- Tawk.to sử dụng browser session để lưu visitor
- Khi chỉ set attributes mới mà không end chat, conversation cũ vẫn còn
- Cần phải **end chat** và **clear visitor** khi logout

### Giải pháp đã implement

#### 1. Track Current User ID
```javascript
constructor() {
  this.currentUserId = null; // Track để phát hiện user change
}
```

#### 2. Detect User Change
```javascript
updateUser(user) {
  const currentUserId = this.currentUserId;
  if (currentUserId && currentUserId !== user.id.toString()) {
    // User khác - end chat cũ trước
    console.log('Different user detected, ending previous chat');
    window.Tawk_API.endChat();
  }
  this.currentUserId = user.id.toString();
  this.setUserAttributes(user);
}
```

#### 3. Enhanced Logout
```javascript
logout() {
  // 1. End conversation hiện tại
  window.Tawk_API.endChat();
  
  // 2. Minimize chat box
  window.Tawk_API.minimize();
  
  // 3. Clear visitor object
  window.Tawk_API.visitor = {};
  
  // 4. Clear current user ID
  this.currentUserId = null;
  
  // 5. Reset về guest mode
  this.setGuestMode();
}
```

#### 4. Clear Visitor Method
```javascript
clearVisitor() {
  // End chat
  window.Tawk_API.endChat();
  
  // Hide widget
  window.Tawk_API.hideWidget();
  
  // Clear all attributes
  window.Tawk_API.setAttributes({
    name: '',
    email: '',
    hash: '',
  });
  
  // Show lại sau 500ms
  setTimeout(() => {
    window.Tawk_API.showWidget();
  }, 500);
}
```

#### 5. Enhanced User Tagging
```javascript
window.Tawk_API.addTags([
  user.role || 'customer',
  user.isVerified ? 'verified' : 'unverified',
  `user-${user.id}` // Tag with user ID for easy identification
]);
```

## 🧪 Cách test

### Test Case 1: User Switch
1. Login với User A (email: userA@test.com)
2. Mở chat, gửi tin nhắn: "Hello from User A"
3. Check console: Phải thấy `Tawk.to attributes set successfully for userId: [ID_A]`
4. Logout
5. Check console: Phải thấy `Tawk.to logged out - conversation ended`
6. Login với User B (email: userB@test.com)
7. Check console: Phải thấy `Different user detected, ending previous chat`
8. Mở chat - **PHẢI thấy conversation mới, KHÔNG có tin nhắn của User A**
9. Gửi tin nhắn: "Hello from User B"
10. Logout và login lại User A
11. Mở chat - **PHẢI thấy lại tin nhắn "Hello from User A"**

### Test Case 2: Guest to User
1. Truy cập website (chưa login)
2. Mở chat, gửi tin nhắn: "I'm a guest"
3. Check console: Phải thấy `Tawk.to initialized for guest user`
4. Login với User C
5. Check console: Phải thấy `Different user detected, ending previous chat`
6. Mở chat - Conversation mới cho User C

### Test Case 3: Same User Multiple Logins
1. Login User A
2. Mở chat, gửi tin nhắn: "Message 1"
3. Logout
4. Login lại User A (cùng account)
5. Mở chat - **PHẢI thấy lại "Message 1"** (lịch sử được giữ)

## 🔍 Debug trong Console

Mở browser console (F12) và chạy:

```javascript
// 1. Kiểm tra Tawk.to loaded
console.log('Tawk_API:', window.Tawk_API);

// 2. Xem visitor hiện tại
console.log('Current visitor:', window.Tawk_API?.visitor);

// 3. Xem chat status
window.Tawk_API?.getStatus((status) => {
  console.log('Chat status:', status);
});

// 4. Manual end chat
window.Tawk_API?.endChat();

// 5. Manual clear visitor
window.TawkToService?.clearVisitor();
```

## 📊 Verify trong Tawk.to Dashboard

1. Login vào [Tawk.to Dashboard](https://dashboard.tawk.to)
2. Vào **Messaging** → **Chat List**
3. Phải thấy các conversations riêng biệt cho mỗi user:
   - User A: email `userA@test.com`, tag `user-[ID_A]`
   - User B: email `userB@test.com`, tag `user-[ID_B]`
4. Click vào từng conversation để xem lịch sử chat riêng

## ⚙️ Configuration

### AuthContext Integration
```javascript
const logout = async () => {
  // ...
  TawkToService.clearVisitor(); // Clear visitor data
  TawkToService.logout();       // End chat & reset
  // ...
}
```

### Automatic Detection
Service tự động:
- ✅ Detect khi user ID thay đổi
- ✅ End chat cũ trước khi set user mới
- ✅ Clear visitor data khi logout
- ✅ Tag mỗi conversation với user ID

## 🔧 Troubleshooting

### Vẫn thấy chat cũ?
1. Clear browser cache
2. Mở Incognito/Private window để test
3. Check console có log "Different user detected" không
4. Verify user.id có khác nhau giữa các accounts

### Chat không load?
1. Check `window.Tawk_API` có tồn tại
2. Verify Tawk.to script trong `index.html`
3. Check network tab - có request tới tawk.to không
4. Disable ad-blockers

### Guest mode không hoạt động?
1. Check console: `Tawk.to initialized for guest user`
2. Verify `setGuestMode()` được gọi
3. Check Tawk.to dashboard - phải thấy visitor với name "Khách"

## 📧 Marketing Subscription Flow

### User Journey After Registration
1. User completes registration form
2. Redirected to `/nhan-tin-quang-cao` (Marketing Subscription page)
3. User chooses:
   - **"Có, tôi muốn nhận tin"** → Shows Mailchimp subscription form
   - **"Không, cảm ơn"** → Redirects to `/dang-nhap`

### Mailchimp Integration
- Embedded classic form from Mailchimp
- Form action: `https://gmail.us15.list-manage.com/subscribe/post`
- List ID: `77664e6b2c`
- User ID: `ac0b7f9de2daad0f46e17375f`

### Features
- ✅ Optional subscription (user can skip)
- ✅ Styled to match application theme
- ✅ Animated transitions with Framer Motion
- ✅ Mobile responsive design
- ✅ Direct link to skip to login

## 🚀 Best Practices

1. **Luôn end chat khi logout** - Tránh conversation overlap
2. **Track userId** - Để detect user changes
3. **Clear visitor data** - Đảm bảo session sạch
4. **Use tags** - Dễ dàng filter và tìm conversations
5. **Test với nhiều accounts** - Verify isolation giữa users

## 📝 Notes

- `endChat()` sẽ kết thúc conversation hiện tại
- `clearVisitor()` xóa toàn bộ visitor data
- `userId` phải unique và consistent cho mỗi user
- Lịch sử chat được lưu theo `userId`, không phải session
- Guest mode vẫn có thể chat, sau đó link với account khi login

## 🎯 Expected Behavior

### ✅ Correct
- User A login → Chat riêng cho User A
- User A logout → Chat ended
- User B login → Chat MỚI cho User B (không thấy chat của A)
- User B logout, User A login lại → Thấy lại chat cũ của User A

### ❌ Incorrect (đã fix)
- User A login → Chat
- User A logout
- User B login → VẪN thấy chat của User A ← **ĐÃ SỬA**
