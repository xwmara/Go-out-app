import AuthLayout from "../components/layout/AuthLayout";
import LoginForm from "../features/auth/components/LoginForm";

export default function Login() {
  return (
    <AuthLayout
      title="Bine ai revenit"
      subtitle="Conectează-te pentru a continua în platforma GoOut"
    >
      <LoginForm />
    </AuthLayout>
  );
}