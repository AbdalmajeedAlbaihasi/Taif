import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '@/lib/api';
import { auth } from '@/lib/auth';
import '../App.css';

const Login = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isRegister) {
        response = await authAPI.register(data);
      } else {
        response = await authAPI.login(data);
      }

      const { user, access_token } = response.data;
      auth.setUser(user, access_token);
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء العملية');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </CardTitle>
          <CardDescription>
            {isRegister 
              ? 'أدخل بياناتك لإنشاء حساب جديد' 
              : 'أدخل بياناتك للوصول إلى نظام إدارة المشاريع'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  {...register('email', { 
                    required: 'البريد الإلكتروني مطلوب',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'البريد الإلكتروني غير صحيح'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                {...register('username', { 
                  required: 'اسم المستخدم مطلوب',
                  minLength: {
                    value: 3,
                    message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
                  }
                })}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                {...register('password', { 
                  required: 'كلمة المرور مطلوبة',
                  minLength: {
                    value: 6,
                    message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? 'جاري المعالجة...' 
                : (isRegister ? 'إنشاء الحساب' : 'تسجيل الدخول')
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
              <Button
                variant="link"
                className="p-0 mr-1 text-blue-600 hover:text-blue-800"
                onClick={toggleMode}
              >
                {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

