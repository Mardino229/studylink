import LoginForm from "../../components/authComponent/loginform.tsx";
import AuthLayout from "../../components/layout/authLayout.tsx";


export default function Login() {

    return (

        <AuthLayout title="Login" description="Log in to your account">
            <LoginForm />
        </AuthLayout>

    );
}