import AuthLayout from "../../components/layout/authLayout.tsx";
import CompleteProfileForm from "../../components/authComponent/completeform.tsx";


export default function CompleteProfile() {

    return (
        <AuthLayout title="Account Finalization" description="Complete your profile">
            <CompleteProfileForm />
        </AuthLayout>
    );
}
