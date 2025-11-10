import {type ReactNode} from "react";

type FormLayoutProps = {
    children: ReactNode;
    title: string;
    description: string;
}

export default function FormLayout(props: FormLayoutProps) {

    return (
        <div className="w-full max-w-xl space-y-8">
            <div className="md:p-8 p-1 rounded-xl space-y-6">
                <div className="">
                    <h2 className="sm:text-4xl text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{props.title}</h2>
                    <p className="mt-2 sm:text-sm text-xs text-gray-600 dark:text-gray-300">
                        {props.description}
                    </p>
                </div>
                {props.children}
            </div>
        </div>
    )
}