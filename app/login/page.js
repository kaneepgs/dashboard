import LoginForm from '@/components/login-form';

export const metadata = {
  title: 'Dashboard Login — EP Golf Studios',
  description: 'Private access for the EP Golf Studios Marketing Command Centre.'
};

export default function LoginPage() {
  return (
    <main className="loading-shell">
      <div className="loading-card login-card">
        <LoginForm />
      </div>
    </main>
  );
}
