import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, message } from 'antd';
import { MailOutlined, CloseOutlined } from '@ant-design/icons';

const MarketingSubscription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMailchimp, setShowMailchimp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = location.state?.email || '';

  const handleYes = () => {
    setShowMailchimp(true);
  };

  const handleNo = () => {
    message.info('Bạn đã bỏ qua đăng ký nhận tin');
    navigate('/dang-nhap');
  };

  const handleSubscribeSuccess = () => {
    message.success('Đăng ký nhận tin thành công! Cảm ơn bạn đã đăng ký.');
    setTimeout(() => {
      navigate('/dang-nhap');
    }, 1500);
  };

  const handleMailchimpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;
    const formData = new FormData(form);
    
    // Chuyển đổi form action từ POST sang GET bằng cách thêm /post-json
    const actionUrl = form.action.replace('/post?', '/post-json?');
    
    // Tạo query string từ form data
    const params = new URLSearchParams();
    for (let [key, value] of formData.entries()) {
      params.append(key, value);
    }
    params.append('c', 'jsonpCallback'); // JSONP callback parameter
    
    try {
      // Sử dụng JSONP để tránh CORS
      const script = document.createElement('script');
      const callbackName = 'jsonpCallback_' + Date.now();
      
      window[callbackName] = (data) => {
        setIsSubmitting(false);
        
        if (data.result === 'success') {
          handleSubscribeSuccess();
        } else {
          // Xử lý lỗi từ Mailchimp
          let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
          if (data.msg) {
            // Mailchimp trả về HTML trong msg, cần parse
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.msg;
            errorMessage = tempDiv.textContent || tempDiv.innerText || errorMessage;
          }
          message.error(errorMessage);
        }
        
        // Cleanup
        document.body.removeChild(script);
        delete window[callbackName];
      };
      
      script.src = `${actionUrl}&${params.toString()}&c=${callbackName}`;
      document.body.appendChild(script);
      
    } catch {
      setIsSubmitting(false);
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {!showMailchimp ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <MailOutlined className="text-4xl text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Đăng ký thành công! 🎉
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Bạn có muốn nhận tin quảng cáo và ưu đãi đặc biệt từ chúng tôi không?
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                type="primary"
                size="large"
                icon={<MailOutlined />}
                onClick={handleYes}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700 h-12 px-8 text-lg font-semibold"
              >
                Có, tôi muốn nhận tin
              </Button>
              
              <Button
                size="large"
                icon={<CloseOutlined />}
                onClick={handleNo}
                className="h-12 px-8 text-lg"
              >
                Không, cảm ơn
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Bạn có thể hủy đăng ký bất cứ lúc nào
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Đăng ký nhận tin
              </h3>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleNo}
                className="text-gray-500 hover:text-gray-700"
              >
                Bỏ qua
              </Button>
            </div>

            <div id="mc_embed_shell">
              <style type="text/css">
                {`
                  /* Reset và override font */
                  #mc_embed_signup {
                    background: transparent !important;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                    width: 100% !important;
                    clear: both !important;
                  }
                  
                  #mc_embed_signup * {
                    font-family: inherit !important;
                  }
                  
                  /* Tiêu đề */
                  #mc_embed_signup h2 {
                    font-size: 18px !important;
                    font-weight: 600 !important;
                    color: #1f2937 !important;
                    margin: 0 0 20px 0 !important;
                    padding: 0 !important;
                    text-align: left !important;
                  }
                  
                  /* Label */
                  #mc_embed_signup label {
                    font-size: 14px !important;
                    font-weight: 500 !important;
                    color: #374151 !important;
                    margin-bottom: 8px !important;
                    display: block !important;
                  }
                  
                  #mc_embed_signup .asterisk {
                    color: #ef4444 !important;
                  }
                  
                  /* Input field */
                  #mc_embed_signup input.email {
                    border: 1px solid #d1d5db !important;
                    border-radius: 8px !important;
                    padding: 12px 16px !important;
                    font-size: 15px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    transition: all 0.2s ease !important;
                    background: white !important;
                    color: #1f2937 !important;
                  }
                  
                  #mc_embed_signup input.email:focus {
                    outline: none !important;
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                  }
                  
                  /* Button */
                  #mc_embed_signup .button {
                    background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 14px 32px !important;
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    width: 100% !important;
                    color: white !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                    margin-top: 16px !important;
                    text-transform: none !important;
                    letter-spacing: 0 !important;
                  }
                  
                  #mc_embed_signup .button:hover {
                    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
                  }
                  
                  #mc_embed_signup .button:active {
                    transform: translateY(0) !important;
                  }
                  
                  #mc_embed_signup .button:disabled {
                    opacity: 0.6 !important;
                    cursor: not-allowed !important;
                    transform: none !important;
                  }
                  
                  /* Field group */
                  #mc_embed_signup .mc-field-group {
                    margin-bottom: 0 !important;
                    padding: 0 !important;
                  }
                  
                  /* Ẩn các phần không cần */
                  #mc_embed_signup .mc-field-group:not(:first-of-type),
                  #mc_embed_signup .refferal_badge,
                  #mc_embed_signup .brandingLogo,
                  #mc_embed_signup .indicates-required {
                    display: none !important;
                  }
                  
                  /* Response messages */
                  #mc_embed_signup .response {
                    font-size: 14px !important;
                    margin: 10px 0 !important;
                    padding: 10px !important;
                    border-radius: 6px !important;
                  }
                  
                  #mce-success-response {
                    background-color: #d1fae5 !important;
                    color: #065f46 !important;
                    border: 1px solid #a7f3d0 !important;
                  }
                  
                  #mce-error-response {
                    background-color: #fee2e2 !important;
                    color: #991b1b !important;
                    border: 1px solid #fecaca !important;
                  }
                  
                  /* Clear floats */
                  #mc_embed_signup .clear {
                    clear: both !important;
                  }
                  
                  /* Footer */
                  #mc_embed_signup .foot,
                  #mc_embed_signup .optionalParent {
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                `}
              </style>
              <div id="mc_embed_signup">
                <form
                  action="https://gmail.us15.list-manage.com/subscribe/post?u=ac0b7f9de2daad0f46e17375f&amp;id=77664e6b2c&amp;f_id=006d99e1f0"
                  method="post"
                  id="mc-embedded-subscribe-form"
                  name="mc-embedded-subscribe-form"
                  className="validate"
                  onSubmit={handleMailchimpSubmit}
                >
                  <div id="mc_embed_signup_scroll">
                    <h2>Nhập email để nhận tin tức và ưu đãi</h2>
                    <div className="mc-field-group">
                      <label htmlFor="mce-EMAIL">
                        Địa chỉ Email <span className="asterisk">*</span>
                      </label>
                      <input
                        type="email"
                        name="EMAIL"
                        className="required email"
                        id="mce-EMAIL"
                        required
                        defaultValue={email}
                        placeholder="vidu@email.com"
                      />
                    </div>
                    <div id="mce-responses" className="clear foot">
                      <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
                      <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
                    </div>
                    <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                      <input
                        type="text"
                        name="b_ac0b7f9de2daad0f46e17375f_77664e6b2c"
                        tabIndex="-1"
                        defaultValue=""
                      />
                    </div>
                    <div className="optionalParent">
                      <div className="clear foot">
                        <input
                          type="submit"
                          name="subscribe"
                          id="mc-embedded-subscribe"
                          className="button"
                          value={isSubmitting ? "Đang xử lý..." : "Đăng ký nhận tin"}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                type="link"
                onClick={handleNo}
                className="text-gray-600"
              >
                Tiếp tục đến trang đăng nhập →
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MarketingSubscription;
