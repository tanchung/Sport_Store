# Mailchimp AJAX Implementation - Không chuyển hướng trang

## Tổng quan
Đã cập nhật form đăng ký Mailchimp trong `MarketingSubscription.jsx` để submit qua AJAX thay vì form submit truyền thống, giữ người dùng ở lại trang web.

## Thay đổi chính

### 1. Loại bỏ target="_blank"
- **Trước**: Form có `target="_blank"` → mở tab mới của Mailchimp
- **Sau**: Submit qua AJAX với JSONP → không chuyển hướng

### 2. Xử lý submit với JSONP
```javascript
const handleMailchimpSubmit = async (e) => {
  e.preventDefault();
  
  // Chuyển POST endpoint sang POST-JSON endpoint
  const actionUrl = form.action.replace('/post?', '/post-json?');
  
  // Sử dụng JSONP để tránh CORS
  const script = document.createElement('script');
  const callbackName = 'jsonpCallback_' + Date.now();
  
  window[callbackName] = (data) => {
    if (data.result === 'success') {
      // Hiển thị thông báo thành công
      handleSubscribeSuccess();
    } else {
      // Hiển thị lỗi từ Mailchimp
      message.error(errorMessage);
    }
  };
}
```

### 3. UI/UX Improvements
- **Loading state**: Button hiển thị "Đang xử lý..." khi submit
- **Disabled state**: Button bị vô hiệu hóa trong quá trình submit
- **Thông báo rõ ràng**: Success/error messages hiển thị bằng Ant Design message

## Cách hoạt động

### JSONP (JSON with Padding)
1. Thay đổi endpoint từ `/post` → `/post-json`
2. Mailchimp trả về JavaScript code thay vì HTML redirect
3. Response được xử lý qua callback function
4. Tránh được vấn đề CORS

### Flow đăng ký
```
User nhập email → Click "Đăng ký nhận tin"
↓
e.preventDefault() → Chặn form submit mặc định
↓
Tạo dynamic <script> tag với JSONP callback
↓
Mailchimp xử lý đăng ký và trả về JSON
↓
Callback function nhận kết quả
↓
- Success: Hiển thị thông báo + redirect về /dang-nhap
- Error: Hiển thị lỗi từ Mailchimp (email đã tồn tại, invalid, etc.)
↓
Cleanup: Xóa script tag và callback function
```

## Xử lý lỗi

### Các loại lỗi Mailchimp
- Email đã đăng ký
- Email không hợp lệ
- Too many subscribe attempts
- Invalid list ID

### Parse lỗi từ HTML
```javascript
// Mailchimp trả về HTML trong msg field
const tempDiv = document.createElement('div');
tempDiv.innerHTML = data.msg;
errorMessage = tempDiv.textContent || tempDiv.innerText;
```

## Testing

### Test cases cần kiểm tra
1. ✅ Email mới → Đăng ký thành công
2. ✅ Email đã tồn tại → Hiển thị lỗi "already subscribed"
3. ✅ Email invalid → Hiển thị lỗi validation
4. ✅ Không có internet → Hiển thị lỗi network
5. ✅ Bấm nút khi đang submit → Button bị disable

### Cách test
```bash
# 1. Start dev server
npm run dev

# 2. Đăng ký tài khoản mới
# 3. Tại trang Marketing Subscription:
#    - Chọn "Có, tôi muốn nhận tin"
#    - Nhập email
#    - Click "Đăng ký nhận tin"
#    - Kiểm tra KHÔNG bị chuyển sang trang Mailchimp
#    - Thông báo success xuất hiện
#    - Tự động redirect về /dang-nhap sau 1.5s
```

## Files thay đổi
- `src/pages/Auth/MarketingSubscription/MarketingSubscription.jsx`

## Lợi ích

### Trải nghiệm người dùng
✅ Không bị gián đoạn khi đăng ký  
✅ Thông báo rõ ràng ngay trên trang  
✅ Không cần đóng tab mới  
✅ Flow mượt mà hơn  

### Kỹ thuật
✅ Tránh CORS issues  
✅ Không cần backend proxy  
✅ Sử dụng Mailchimp API chính thức  
✅ Xử lý lỗi tốt hơn  

## Lưu ý

⚠️ **JSONP Endpoint**: Mailchimp hỗ trợ `/post-json` cho embedded forms  
⚠️ **Callback naming**: Sử dụng timestamp để tránh conflict  
⚠️ **Cleanup**: Luôn xóa script tag và callback sau khi xử lý  
⚠️ **HTML parsing**: Mailchimp msg field chứa HTML, cần parse ra text  

## Tài liệu tham khảo
- [Mailchimp Embedded Forms](https://mailchimp.com/help/add-a-signup-form-to-your-website/)
- [JSONP Explained](https://en.wikipedia.org/wiki/JSONP)
