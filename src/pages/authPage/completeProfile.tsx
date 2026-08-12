import { Navigate } from "react-router-dom";
import AuthLayout from "../../components/layout/authLayout.tsx";
import CompleteProfileForm from "../../components/authComponent/completeform.tsx";
import { useUser } from "../../components/layout/userContext.tsx";

export default function CompleteProfile() {
    const { user } = useUser();

    if (user?.first_name && user?.study_level_id) {
        return <Navigate to="/home" replace />;
    }

    return (
        <AuthLayout title="Account Finalization" description="Complete your profile">
            <CompleteProfileForm />
        </AuthLayout>
    );
}
