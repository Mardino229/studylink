import {
    ArrowDownIcon,
    ArrowUpIcon,
    BoxIconLine,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function ProgressMetrics() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl dark:bg-gray-800">
                    <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE0ElEQVR4nO2aaYhVZRjHf1fNmWwqy8TSrKwgzTKsLFqmIAoyNWn5kGV9aIM2oqKkhVZa8ItllBlR2KKWH8ItysIoy1ZaMKls0aYgrJwsrcmc7o0H/geeTvec+57lXhH8w+EO5zzLuzzvs70DO7ADIegHtLOdoj8wCZgP/An8Ddy0rQc1FHgIeBw4OIWuAnQCs4BfgJqef4BePQewjWCr+rMb1PfAXjGaw4D7gXWOzp5PtQvDgef07uZWT8BseiZQ1QBeAlbo70XAfsA0DdYP3iZznybnMUHfV9FCjAI+keItwPUyG1vZDbGB12RGZk4niq4ednI7O6YVk7gU+EMKvwSOjH0/y03gDZmeHewQPCo+M8OmYTdgrhvk00BHAu0s0axJoamHTvF9l7JzhXAM8LWU/A5MDTg/0dkwTxaKCrBWfGaGpcEEXysfb8I/aOBePUYrPhjflAw6HxDPI5SEIcArElpVnAi19QhXiv/XDPFhjHg25ND3P0x2AWs9cHoBWS9KznvyTCFYJR5zybnQrpWPYsMyYG+KYQ8XCO8O5LlF9M/mUTgS+FgC7EzcCfShHHQq/bBU5JQA+v21mJszej0uEpNN4gtgLOXjLsn/oU4KUw9vZ3EUuwPzAmNDUdjuvi49SwPixFWiXdxI8HEKPEa8ETiP5sPyr27ptIGmYTCwVWY+KC3t3iSB7wAjaB3Old6egJxqqWivSCI4w6UChX11DsyW/tXAgBS6qaJ7M4lgV8UHI7qx4KBOUi3RNwPPAE2ipkkloUMJalVmmbgrVaXh48iHnYG/NKDbM/KaWfWI95wUusgZWW2TiBki+kq7lAdrJMMO5gkZea8Wb3fKik9y1WQi2oCPRPgM2THY7UhU/VkkD0UFWCjeFeqmxNHfpUvxqvI/OMR5sAszmtUy8f3o0vYFZMMgBcmagmY9PKbv9zYSdrEIN2liIeirAGeT2UcufKPkXJbDYfSmpDAnux1vWHDNczVHqEseGBM8RTLM0xxKNtwj3i5gzzpZQZe+H99IUIc7uNPJjyddN8TMLxT9XH61pM7KT9e3h0OEjVNKUC1QC+wCfC6l1i7KguGuCxOP5mP1/qfQuiaqBdYXqEUOV4yoqkjLm8IcEfv2mb6NDxFk9viaGF4u0M24zpUFWaK+4Qlnnr65fVvWUDFUW2hMN5APFVWEwwqa5wXu/YHaZfOuwZjoUpijaS0muoX0EzGs1PtMeNA12vKmMFnQFusZLKoTCq7JM5E2V8fPobkY6XRtkUlXEtpUW/Mq2JywzWXhEqfDdv+oBuW5ea9ciFKY34CDKA8Dgedd0jknwYTb5MZfcKl/bsyXgPczNNoa9QzWpvST+ygHm+3q/Oh2a3kRxbal30qY9Web1U8erZ7aN7E7ltV6X0p/IUphbFVOy8E/REE23k/eV5P7MDb4LtE0o8/GrTlTmDNj/eTz1Rh8VQsTDb5b/bVTm3VH4m13ubs3bKSsXRlr1bnWlfqtubR/rgJhGecvGMPcfZ/dH4bEhvhju/AWcHmLgm0ixmuV7cwc26CfHD+000ro8peKme5StMPFhgWxwdv3OzLcdrUc7e6a+im1g9a54DmjQM+s5Rjlrqt79fuuUu7tDmdrB3r0Xw0t9TyUDAtsWZoNhfAvzxyWBG3S+EQAAAAASUVORK5CYII="
                        alt="flashcards"/>
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Nombre de flashcards
            </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            150
                        </h4>
                    </div>
                    <Badge color="success">
                        <ArrowUpIcon/>
                        20
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <BoxIconLine className="text-gray-800 size-6 dark:text-white/90"/>
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            5,359
                        </h4>
                    </div>

                    <Badge color="error">
                        <ArrowDownIcon/>
                        9.05%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}
        </div>
    );
}
