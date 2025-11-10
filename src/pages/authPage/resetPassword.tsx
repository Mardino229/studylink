import PasswordResetForm from "../../components/authComponent/passwordResetForm.tsx";
import AuthLayout from "../../components/layout/authLayout.tsx";


export default function ResetPassword() {

    return (
        <AuthLayout title="Password Reset" description="Reset your password">
            <PasswordResetForm />
        </AuthLayout>
    );
}