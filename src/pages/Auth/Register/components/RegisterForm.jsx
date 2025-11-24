import React from 'react';
import { Form, Input, Checkbox, Radio, DatePicker } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const RegisterForm = ({ form, onFinish, onFinishFailed, loading }) => {
  return (
    <Form
      form={form}
      name="register"
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      className="flex-1"
      scrollToFirstError
    >
      {/* Personal information - Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Form.Item
          label={<span className="text-sm font-medium">Họ</span>}
          name="lastName"
          rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
        >
          <Input className="rounded-lg" />
        </Form.Item>

        <Form.Item
          label={<span className="text-sm font-medium">Tên đệm</span>}
          name="middleName"
        >
          <Input className="rounded-lg" />
        </Form.Item>

        <Form.Item
          label={<span className="text-sm font-medium">Tên</span>}
          name="firstName"
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input className="rounded-lg" />
        </Form.Item>
      </div>

      {/* Username */}
      <Form.Item
        label={<span className="text-sm font-medium">Tên đăng nhập</span>}
        name="username"
        rules={[
          { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
          { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
          { 
            pattern: /^[a-zA-Z0-9_]+$/,
            message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!'
          }
        ]}
        className="mt-2"
      >
        <Input className="rounded-lg" />
      </Form.Item>

      {/* Email */}
      <Form.Item
        label={<span className="text-sm font-medium">Email</span>}
        name="email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' },
        ]}
      >
        <Input className="rounded-lg" />
      </Form.Item>

      {/* Phone number */}
      <Form.Item
        label={<span className="text-sm font-medium">Số điện thoại</span>}
        name="phone"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại!' },
          { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' },
        ]}
      >
        <Input className="rounded-lg" />
      </Form.Item>

      {/* Address - Optional */}
      <Form.Item
        label={<span className="text-sm font-medium">Địa chỉ</span>}
        name="address"
      >
        <Input className="rounded-lg" placeholder="123 Đường ABC, Quận 1, TP. HCM" />
      </Form.Item>

      {/* Date of Birth and Gender - Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label={<span className="text-sm font-medium">Ngày sinh</span>}
          name="dateOfBirth"
          rules={[
            { required: true, message: 'Vui lòng chọn ngày sinh!' }
          ]}
        >
          <DatePicker 
            className="w-full rounded-lg" 
            format="YYYY-MM-DD"
            placeholder="Chọn ngày sinh"
            disabledDate={(current) => {
              // Không cho chọn ngày trong tương lai và phải trên 13 tuổi
              return current && (current > dayjs().endOf('day') || current > dayjs().subtract(13, 'years'));
            }}
          />
        </Form.Item>
        
        {/* Gender selection */}
        <Form.Item
          label={<span className="text-sm font-medium">Giới tính</span>}
          name="gender"
          rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
        >
          <Radio.Group className="flex items-center h-8">
            <Radio value="nam">Nam</Radio>
            <Radio value="nữ">Nữ</Radio>
          </Radio.Group>
        </Form.Item>
      </div>

      {/* Password */}
      <Form.Item
        label={<span className="text-sm font-medium">Mật khẩu</span>}
        name="password"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
            message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'
          }
        ]}
        hasFeedback
      >
        <Input.Password className="rounded-lg" />
      </Form.Item>

      {/* Confirm password */}
      <Form.Item
        label={<span className="text-sm font-medium">Nhập lại mật khẩu</span>}
        name="confirmPassword"
        dependencies={['password']}
        hasFeedback
        rules={[
          { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu không khớp!'));
            },
          }),
        ]}
      >
        <Input.Password className="rounded-lg" />
      </Form.Item>

      {/* Terms and conditions */}
      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error('Bạn cần chấp nhận điều khoản')),
          },
        ]}
        className="mb-2"
      >
        <Checkbox>
          Tôi đã đọc và chấp nhận <a href="/terms" className="text-blue-600">điều khoản sử dụng</a> và <a href="/privacy" className="text-blue-600">chính sách bảo mật</a>
        </Checkbox>
      </Form.Item>

      {/* Submit button */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8ecae6] hover:bg-[#219ebc] text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : 'Đăng ký'}
        </button>
      </motion.div>
    </Form>
  );
};

export default RegisterForm;