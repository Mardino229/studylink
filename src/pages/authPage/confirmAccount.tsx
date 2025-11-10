import ConfirmForm from "../../components/authComponent/confirmform.tsx";
import AuthLayout from "../../components/layout/authLayout.tsx";


export default function ConfirmAccount() {

    return (
        <AuthLayout title="Account Confirmation" description="Confirm your account">
            <ConfirmForm />
        </AuthLayout>
    );
}
