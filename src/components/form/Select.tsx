import { useEffect, useState } from "react";

interface Option {
    value: string|number;
    label: string;
}

interface SelectProps {
    options: Option[];
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    defaultValue?: string;
    error?: boolean;
    hint?: string;
}

const Select: React.FC<SelectProps> = ({
                                           options,
                                           placeholder = "Select an option",
                                           value,
                                           onChange,
                                           className = "",
                                           defaultValue = "",
                                           error = false,
                                           hint,
                                       }) => {
    // Utiliser value si fourni (par Controller), sinon utiliser defaultValue
    const [selectedValue, setSelectedValue] = useState<string>(value || defaultValue);

    // Synchroniser la valeur si elle change (par exemple via Controller)
    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setSelectedValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="relative">
            <select
                className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                    error
                        ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800"
                        : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
                } ${
                    selectedValue
                        ? "text-gray-800 dark:text-white/90"
                        : "text-gray-400 dark:text-gray-400"
                } ${className}`}
                value={selectedValue}
                onChange={handleChange}
            >
                <option
                    value=""
                    disabled
                    className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {hint && (
                <p
                    className={`mt-1.5 text-xs ${
                        error ? "text-error-500" : "text-gray-500"
                    }`}
                >
                    {hint}
                </p>
            )}
        </div>
    );
};

export default Select;