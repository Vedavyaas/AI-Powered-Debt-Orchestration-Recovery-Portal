import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/services/api-client'
import { AutoForm, type FormField } from '@/components/common/AutoForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { type LoginRequest } from '@/types/auth'

export default function LoginPage() {
  const [error, setError] = useState<string>('')

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      // Store auth token
      localStorage.setItem('auth_token', response.data.token)
      // Redirect to dashboard
      window.location.href = '/dashboard'
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed. Please try again.')
    }
  })

  const handleLogin = async (data: LoginRequest) => {
    setError('')
    await loginMutation.mutateAsync(data)
  }

  const loginFields: FormField[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email address',
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Enter your password',
      validation: {
        min: 6,
        message: 'Password must be at least 6 characters'
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FedEx</h1>
          <p className="text-gray-600">Debt Management System</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AutoForm
              fields={loginFields}
              onSubmit={handleLogin}
              submitLabel="Sign In"
              loading={loginMutation.isPending}
              layout="vertical"
            />

            <div className="mt-6 text-center space-y-2">
              <Button
                variant="link"
                className="text-sm"
                onClick={() => window.location.href = '/auth/forgot-password'}
              >
                Forgot your password?
              </Button>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => window.location.href = '/auth/register'}
                >
                  Sign up
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 FedEx Debt Management System</p>
          <p>Secure login powered by JWT authentication</p>
        </div>
      </div>
    </div>
  )
}
