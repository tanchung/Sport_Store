import React, { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { FiLock, FiShield } from 'react-icons/fi';
import AuthService from '../../../services/Auth/AuthServices';

const PasswordChangeForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      const { currentPassword, newPassword, confirmPassword } = values;

      const response = await AuthService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (response?.data?.success || response?.status === 200) {
        message.success( 'Đổi mật khẩu thành công!');
        form.resetFields();
      } else {
        message.error('Không thể đổi mật khẩu. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error changing password:', error);

      if (error.response) {
        switch (error.response.status) {
          case 400:
            message.error('Mật khẩu hiện tại không đúng hoặc thông tin không hợp lệ');
            break;
          case 401:
            message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            break;
          case 404:
            message.error('Không tìm thấy thông tin người dùng');
            break;
          case 500:
            message.error('Lỗi server. Vui lòng thử lại sau');
            break;
          default:
            message.error('Không thể đổi mật khẩu. Vui lòng thử lại sau');
        }
      } else {
        message.error('Không thể kết nối đến server. Vui lòng thử lại sau');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-9 py-9 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-3 mb-6">
        <FiLock className="text-blue-600 text-xl" />
        <h3 className="text-lg font-medium text-gray-800">Đổi mật khẩu</h3>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handlePasswordChange}
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
          ]}
        >
          <Input.Password
            prefix={<FiLock className="text-gray-400" />}
            placeholder="Nhập mật khẩu hiện tại"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
              message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
            }
          ]}
        >
          <Input.Password
            prefix={<FiLock className="text-gray-400" />}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Hai mật khẩu không khớp nhau!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<FiLock className="text-gray-400" />}
            placeholder="Xác nhận mật khẩu mới"
          />
        </Form.Item>

        <div className="flex justify-end mt-6">
          <Button type="primary" htmlType="submit" loading={loading}>
            Đổi mật khẩu
          </Button>
        </div>
      </Form>

      <Divider />
    </div>
  );
};

export default PasswordChangeForm;