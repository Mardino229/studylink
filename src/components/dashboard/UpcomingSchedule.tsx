import { useState } from "react";

export default function UpcomingSchedule() {
    const [openDropDown, setOpenDropDown] = useState(false);
    const [checkedIndexes, setCheckedIndexes] = useState([false, false, false]);

    const schedules = [
        {
            date: "Wed, 11 jan",
            hour: "09:20 AM",
            title: "Devoir de physique",
            desc: " Chapitres 3-4",
        },
        {
            date: "Fri, 15 feb",
            hour: "10:35 AM",
            title: "Quizz Histoire",
            desc: "Révolution",
        },
        {
            date: "Thu, 18 mar",
            hour: "1:15 AM",
            title: "Projet Biologie",
            desc: "ADN",
        },
    ];

    const handleCheckClick = (i: number) =>
        setCheckedIndexes((old) =>
            old.map((value, idx) => (idx === i ? !value : value))
        );

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    À venir
                </h3>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpenDropDown((v) => !v)}
                        className={
                            openDropDown
                                ? "text-gray-700 dark:text-white"
                                : "text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        }
                    >
                        <svg
                            className="fill-current"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z"
                                fill=""
                            />
                        </svg>
                    </button>
                    {openDropDown && (
                        <div className="absolute right-0 top-full z-40 w-40 space-y-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
                            <button className="flex w-full rounded-lg px-3 py-2 text-left text-theme-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
                                View More
                            </button>
                            <button className="flex w-full rounded-lg px-3 py-2 text-left text-theme-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="custom-scrollbar max-w-full overflow-x-auto">
                <div className="min-w-[500px]">
                    <div className="flex flex-col gap-2">
                        {schedules.map((item, i) => (
                            <div
                                key={i}
                                className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                                onClick={() => handleCheckClick(i)}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] ${
                                            checkedIndexes[i]
                                                ? "border-brand-500 bg-brand-500"
                                                : "border-gray-300 dark:border-gray-700"
                                        }`}
                                    >
                                        <svg
                                            className={checkedIndexes[i] ? "block" : "hidden"}
                                            width="14"
                                            height="14"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M11.6668 3.5L5.25016 9.91667L2.3335 7"
                                                stroke="white"
                                                strokeWidth="1.94437"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            ></path>
                                        </svg>
                                    </div>
                                    <div>
                    <span className="mb-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                      {item.date}
                    </span>
                                        <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                      {item.hour}
                    </span>
                                    </div>
                                </div>
                                <div>
                  <span className="mb-1 block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                    {item.title}
                  </span>
                                    <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
