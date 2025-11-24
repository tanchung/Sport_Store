import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MdOutlinePhotoCamera } from "react-icons/md";
import { Form, Input, DatePicker, Select, Button, message, Spin, Tabs, Avatar } from 'antd';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit } from 'react-icons/fi';
import moment from 'moment';
import PasswordChageForm from './components/PasswordChageForm'

const { TabPane } = Tabs;

const ProfilePage = () => {
  const { currentUser, updateUserFields, updateAvatar } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const { Option } = Select;

  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
      // console.log(currentUser)
      if (isEditing) {
        form.setFieldsValue({
          username: currentUser.username,
          lastName: currentUser.lastName,
          firstName: currentUser.firstName,
          phone: currentUser.phone,
          avatar: currentUser.avatar,
          permanentAddress: currentUser.permanentAddress,
          email: currentUser.email,
          gender: currentUser.gender,
          dateOfBirth: currentUser.dateOfBirth ? moment(currentUser.dateOfBirth, 'DD/MM/YYYY') : null,
        });
      }
    }
  }, [currentUser, form, isEditing]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare data in the format expected by the backend
      const userUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        permanentAddress: values.permanentAddress,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('DD/MM/YYYY') : null,
        username: values.username
      };

      const result = await updateUserFields(userUpdateData);

      if (result.success) {
        message.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
        // Update local state with new data
        setUserData(prev => ({
          ...prev,
          ...userUpdateData
        }));
      } else {
        message.error(result.error || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserInfo = () => {
    if (!userData) return <Spin />;

    const { username, lastName, firstName, email, phone, avatar, permanentAddress, gender, dateOfBirth } = userData;
    const fullName = `${lastName || ''} ${firstName || ''}`.trim();

    return (
      <div className="space-y-6">
        {/* User info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiUser className="text-blue-600 text-xl" />
              <h3 className="text-lg font-medium text-gray-800">Thông tin cá nhân</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Tên đăng nhập</p>
                <p className="font-medium">{username || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>
                <p className="font-medium">{fullName || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giới tính</p>
                <p>{gender || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày sinh</p>
                <p>{dateOfBirth ? moment(dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiPhone className="text-blue-600 text-xl" />
              <h3 className="text-lg font-medium text-gray-800">Thông tin liên hệ</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{email || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p>{phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p>{permanentAddress || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    if (!userData) return <Spin />;

    return (
      <div className="px-9 py-9 bg-white rounded-lg shadow">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            username: userData.username || '',
            lastName: userData.lastName || '',
            firstName: userData.firstName || '',
            phone: userData.phone || '',
            avatar: userData.avatar || '',
            permanentAddress: userData.permanentAddress || '',
            email: userData.email || '',
            gender: userData.gender || '',
            dateOfBirth: userData.dateOfBirth ? moment(userData.dateOfBirth, 'DD/MM/YYYY') : null,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input prefix={<FiUser className="text-gray-400" />} placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Họ"
              rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
            >
              <Input prefix={<FiUser className="text-gray-400" />} placeholder="Nhập họ" />
            </Form.Item>

            <Form.Item
              name="firstName"
              label="Tên"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input prefix={<FiUser className="text-gray-400" />} placeholder="Nhập tên" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input prefix={<FiMail className="text-gray-400" />} placeholder="Nhập email" disabled />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }
              ]}
            >
              <Input prefix={<FiPhone className="text-gray-400" />} placeholder="Nhập số điện thoại" />
            </Form.Item>
          </div>

          <Form.Item
            name="permanentAddress"
            label="Địa chỉ"
          >
            <Input prefix={<FiMapPin className="text-gray-400" />} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="gender"
              label="Giới tính"
            >
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
            >
              <DatePicker
                format="DD/MM/YYYY"
                className="w-full"
                placeholder="Chọn ngày sinh"
                suffixIcon={<FiCalendar className="text-gray-400" />}
              />
            </Form.Item>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thông tin
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
        <p className="text-gray-600">Xem và cập nhật thông tin cá nhân của bạn</p>
      </div>

      <div className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col items-center sm:flex-row sm:items-start">
        <div className="relative w-32 h-32 mb-4 sm:mb-0 sm:mr-8">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden relative border-4 border-white shadow">
            {userData?.avatar ? (
              <img
                src={userData.avatar}
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <FiUser className="text-gray-400 text-6xl" />
            )}
          </div>

          {/* Icon nằm đè lên viền */}
          <label
            htmlFor="avatarUpload"
            className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow cursor-pointer hover:bg-gray-100 border border-gray-300"
          >
            <MdOutlinePhotoCamera className="text-blue-600 text-lg" />
          </label>

          {/* input file ẩn */}
          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              try {
                const result = await updateAvatar(file);

                if (result.success) {
                  message.success("Cập nhật ảnh đại diện thành công!");
                  // The updateAvatar function already calls fetchUserInfo to update currentUser
                  // So we just need to update local state
                  setUserData(prev => ({
                    ...prev,
                    avatar: result.data.avatar || result.data.avatarUrl
                  }));
                } else {
                  message.error(result.error || "Cập nhật ảnh đại diện thất bại!");
                }
              } catch (error) {
                console.error("Update avatar error:", error);
                message.error("Có lỗi khi cập nhật ảnh đại diện!");
              }
            }}
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-semibold">
            {userData ?
              `${userData.lastName || ''} ${userData.firstName || ''}`.trim() :
              'Đang tải...'}
          </h2>
          <p className="text-gray-600 mt-1">{userData?.email || ''}</p>
          {/* <p className="text-gray-500 mt-1">{userData?.phone || 'Chưa cập nhật số điện thoại'}</p> */}

          <div className='mt-4 flex flex-wrap gap-2 justify-center sm:justify-start'>
            {!isEditing  && (
              <Button
                type="primary"
                // icon={<FiEdit className="mr-1" />}
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa thông tin
              </Button>
            )}

            {/* <Button
              // icon={<FiEdit className="mr-1" />}
              onClick={() => {
                setActiveTab('password');
                setIsEditing(true);
              }}
              className={activeTab === 'password' ? 'bg-blue-50' : ''}
            >
              Đổi mật khẩu
            </Button> */}
          </div>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={(key) => {
        setActiveTab(key);
        if (key === 'profile') {
          setIsEditing(false);
        }
      }}>
        <TabPane tab='Thông tin cá nhân' key='profile'>
          {isEditing ? renderForm() : renderUserInfo()}
        </TabPane>

        <TabPane tab='Đổi mật khẩu' key='password'>
          <PasswordChageForm />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfilePage;