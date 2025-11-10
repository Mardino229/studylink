import RegisterForm from "../../components/authComponent/registerform.tsx";
import AuthLayout from "../../components/layout/authLayout.tsx";

export default function Register() {

    return (
        <AuthLayout title="Inscription" description="Create your account">
            <RegisterForm />
        </AuthLayout>
    )
}