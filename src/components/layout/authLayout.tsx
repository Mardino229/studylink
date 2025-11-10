import type { ReactElement, ReactNode } from "react";
import PageMeta from "../common/PageMeta.tsx";
import AuthHeader from "../authComponent/authheader.tsx";
type AuthLayoutProps = {
    title : string, description : string, children: ReactNode
}
export default function AuthLayout(props: AuthLayoutProps): ReactElement {

    return (
        <>
            <PageMeta title={props.title} description={props.description} />
            <div className="relative overflow-hidden bg-white dark:bg-background">
                <div className="relative z-10 flex flex-col min-h-dvh">
                    <AuthHeader />
                    <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                        {props.children}
                    </main>
                </div>
            </div>
        </>
    )
}