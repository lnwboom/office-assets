import { useState } from 'react';

interface RegisterFormProps {
  onToggleForm: () => void;
}

export default function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    department: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'username':
        if (value.length < 3) return 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น';
        break;
      case 'password':
        if (value.length < 8) return 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
        if (!/[A-Z]/.test(value)) return 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว';
        if (!/[a-z]/.test(value)) return 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว';
        if (!/[0-9]/.test(value)) return 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว';
        break;
      case 'confirmPassword':
        if (value !== formData.password) return 'รหัสผ่านไม่ตรงกัน';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'รูปแบบอีเมลไม่ถูกต้อง';
        break;
      case 'fullName':
        if (value.length < 2) return 'กรุณาระบุชื่อ-นามสกุล';
        if (!/^[\u0E00-\u0E7Fa-zA-Z\s]+$/.test(value)) return 'ชื่อ-นามสกุลต้องเป็นตัวอักษรเท่านั้น';
        break;
      case 'department':
        if (value.length < 2) return 'กรุณาระบุแผนก/ฝ่าย';
        break;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    // If this is confirmPassword, also validate password match
    if (name === 'password') {
      if (formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: value !== formData.confirmPassword ? 'รหัสผ่านไม่ตรงกัน' : ''
        }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          department: formData.department,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'มีข้อผิดพลาดในการลงทะเบียน');
      }

      // Registration successful
      onToggleForm(); // Switch back to login form
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'มีข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ลงทะเบียนผู้ใช้ใหม่
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          กรุณากรอกข้อมูลให้ครบถ้วน
        </p>
      </div>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {submitError}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              ชื่อ-นามสกุล
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              แผนก/ฝ่าย
            </label>
            <input
              id="department"
              name="department"
              type="text"
              required
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.department}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'ลงทะเบียน'}
          </button>
        </div>
      </form>

      <div className="text-center">
        <button
          onClick={onToggleForm}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          มีบัญชีผู้ใช้แล้ว? เข้าสู่ระบบที่นี่
        </button>
      </div>
    </div>
  );
}
