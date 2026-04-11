import RegisterForm from "../components/auth/RegisterForm";
import LoginForm from "../components/auth/LoginForm";


export default function Home() {
  return (
    <div>
      {/* <h1>Welcome to Transcendance</h1> */}
      <RegisterForm />
      <LoginForm />
    </div>
  );
}
