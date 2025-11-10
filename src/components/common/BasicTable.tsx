import {AnimatedNoise} from "../ui/animated-noise.tsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";



export default function BasicTable() {
    const [openDropDown, setOpenDropDown] = useState(false);
    const navigate = useNavigate();
  return (
      <div className="overflow-hidden rounded-xl">
          <div className="max-w-full ">
              <div className={"py-4 md:gap-8 gap-3 flex flex-wrap "}>
                  {/*<Loader className="h-64" />*/}
                  <div onClick={()=>navigate("/my-summaries/summary")} className="size-48 w-full cursor-pointer  md:max-w-xs xl:max-w-sm hover:-translate-y-2 hover:transition-all relative">
                      <AnimatedNoise className="rounded-lg" opacity={0.1}/>
                      <div className="p-4 h-full justify-between flex items-center">
                          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology 2025</h5>
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
                  </div>
                  <div className="size-48 w-full cursor-pointer  md:max-w-xs xl:max-w-sm hover:-translate-y-2 hover:transition-all relative">
                      <AnimatedNoise className="rounded-lg" opacity={0.1}/>
                      <div className="p-4 h-full justify-between flex items-center">
                          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology 2025</h5>
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
                  </div>
                  <div className="size-48 w-full cursor-pointer  md:max-w-xs xl:max-w-sm hover:-translate-y-2 hover:transition-all relative">
                      <AnimatedNoise className="rounded-lg" opacity={0.1}/>
                      <div className="p-4 h-full justify-between flex items-center">
                          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology 2025</h5>
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
                  </div>
                  <div className="size-48 w-full cursor-pointer  md:max-w-xs xl:max-w-sm hover:-translate-y-2 hover:transition-all relative">
                      <AnimatedNoise className="rounded-lg" opacity={0.1}/>
                      <div className="p-4 h-full justify-between flex items-center">
                          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology 2025</h5>
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
                  </div>
              </div>
          </div>
      </div>

  );
}
