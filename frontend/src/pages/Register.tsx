import AuthLayout from "../components/layout/AuthLayout";
import RegisterForm from "../features/auth/components/RegisterForm";

export default function Register() {
  return (
    <AuthLayout
      title="Creează un cont"
      subtitle="Intră în platformă ca participant sau organizator."
    >
      <RegisterForm />
    </AuthLayout>
  );
}