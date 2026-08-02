import { Modal } from "../ui/modal";
import {useModal} from "../../hoooks/useModal.ts";
import {useUser} from "../layout/userContext.tsx";
import { useEffect, useState } from "react";
import { Faculties, type Faculty, type Program, Programs, StudyLevels, type StudyLevel } from "../../utils/school.ts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select.tsx";
import { useUpdateProfile } from "../../utils/user.ts";
import { RotatingLines } from "react-loader-spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form.tsx";
import type { UpdateProfileRequest } from "../../utils/type.ts";
import Button from "../ui/button/Button.tsx";
import { useTranslation } from "react-i18next";

type UpdateProfileFormData = UpdateProfileRequest & {
  program_name?: string;
};

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useUser();
  const [programsByFaculty, setProgramsByFaculty] = useState<Program[]|undefined>([]);
  const [useOtherProgram, setUseOtherProgram] = useState(false);
  const [isGraduate, setIsGraduate] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const OTHER_VALUE = "other";
  const { t } = useTranslation('app');
  const { t: tErr } = useTranslation('errors');

  const updateProfileSchema = z.object({
    first_name: z.string().min(2, t('user_profile.first_name_min')),
    last_name: z.string().min(2, t('user_profile.last_name_min')),
    email: z.email(tErr('email.invalid')).nonempty(tErr('email.required'))
        .refine((v) => v.endsWith("@uottawa.ca"), { message: tErr('email.uottawa') }),
    study_level_id: z.string().min(1, t('user_profile.study_level_min')),
    faculty_id: z.string().optional(),
    program_id: z.string().optional(),
    program_name: z.string().optional(),
  }).superRefine((val, ctx) => {
    const otherSelected = val.program_id === "other";
    if (otherSelected) {
      if (!val.program_name || val.program_name.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["program_name"], message: t('user_profile.program_name_required') });
      }
    } else {
      if (!val.faculty_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["faculty_id"], message: t('user_profile.faculty_required') });
      }
      if (!val.program_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["program_id"], message: t('user_profile.program_required') });
      }
    }
  });

  const faculties = Faculties();
  const programs = Programs();
  const studyLevels = StudyLevels();
  const updateProfile = useUpdateProfile();

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      study_level_id: "",
      faculty_id: "",
      program_id: "",
      program_name: "",
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      setIsInitializing(true);
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        study_level_id: user.study_level_id ? String(user.study_level_id) : "",
        faculty_id: user.faculty_id ? String(user.faculty_id) : "",
        program_id: user.program_id ? String(user.program_id) : "",
        program_name: user.other_program || user.program?.name || "",
      });
      setUseOtherProgram(!!user.other_program);
      if (user.study_level_id && studyLevels.data) {
        const selected = studyLevels.data.find((s: StudyLevel) => String(s.id) === String(user.study_level_id));
        const grad = selected?.name?.toLowerCase().includes("études supérieures") ?? false;
        setIsGraduate(!!grad);
      }
      if (user.faculty_id && programs.data) {
        setProgramsByFaculty(programs.data.filter(prog => prog.faculty_id === user.faculty_id));
      }
      setTimeout(() => setIsInitializing(false), 100);
    } else if (!isOpen) {
      setIsInitializing(true);
    }
  }, [user, isOpen, studyLevels.data, programs.data, form]);

  useEffect(() => {
    if (isInitializing) return;
    const levelId = form.watch("study_level_id");
    if (!levelId || !studyLevels.data) return;
    const selected = studyLevels.data.find((s: StudyLevel) => String(s.id) === String(levelId));
    const grad = selected?.name?.toLowerCase().includes("études supérieures") ?? false;
    setIsGraduate(!!grad);
    if (grad) {
      form.setValue("faculty_id", "");
      form.setValue("program_id", "");
      form.setValue("program_name", "");
      setUseOtherProgram(true);
    }
  }, [studyLevels.data, isInitializing, form]);

  useEffect(() => {
    const faculty = form.watch("faculty_id");
    if (faculty) {
      setProgramsByFaculty(programs.data?.filter(prog => prog.faculty_id === parseInt(faculty)));
    }
  }, [form, programs.data]);

  useEffect(() => {
    if (isInitializing) return;
    const pid = form.watch("program_id");
    if (pid === OTHER_VALUE) {
      setUseOtherProgram(true);
    } else if (pid && !isGraduate) {
      setUseOtherProgram(false);
    }
  }, [isInitializing, isGraduate, form]);

  const onSubmit = (data: UpdateProfileFormData) => {
    const payload: UpdateProfileRequest = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      study_level_id: data.study_level_id,
      faculty_id: isGraduate || useOtherProgram || data.program_id === OTHER_VALUE ? undefined : data.faculty_id,
      program_id: isGraduate || useOtherProgram || data.program_id === OTHER_VALUE ? undefined : data.program_id,
      other_program: (isGraduate || useOtherProgram || data.program_id === OTHER_VALUE) && data.program_name ? data.program_name : undefined,
    };
    updateProfile.mutate(payload, { onSuccess: () => { closeModal(); } });
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {t('user_profile.personal_info_title')}
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{t('user_profile.first_name')}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.first_name}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{t('user_profile.last_name')}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.last_name}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{t('user_profile.email')}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.email}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{t('user_profile.faculty')}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.faculty?.name}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{t('user_profile.program')}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.other_program ? user?.other_program : user?.program?.name}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{t('user_profile.study_level')}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.study_level?.name}</p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
          </svg>
          {t('user_profile.edit_btn')}
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t('user_profile.edit_title')}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {t('user_profile.edit_desc')}
            </p>
          </div>
          <Form {...form}>
            <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    {t('user_profile.personal_info_title')}
                  </h5>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <FormField name="first_name" control={form.control} render={({field}) => (
                      <FormItem className="col-span-2 lg:col-span-1">
                        <FormLabel>{t('user_profile.first_name')}</FormLabel>
                        <FormControl>
                          <input {...field} className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none dark:bg-gray-800"
                            placeholder={t('user_profile.first_name_placeholder')} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>

                    <FormField name="last_name" control={form.control} render={({field}) => (
                      <FormItem className="col-span-2 lg:col-span-1">
                        <FormLabel>{t('user_profile.last_name')}</FormLabel>
                        <FormControl>
                          <input {...field} className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none dark:bg-gray-800"
                            placeholder={t('user_profile.last_name_placeholder')} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>

                    <FormField name="email" control={form.control} render={({field}) => (
                      <FormItem className="col-span-2 lg:col-span-1">
                        <FormLabel>{t('user_profile.email')}</FormLabel>
                        <FormControl>
                          <input {...field} type="email" className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none dark:bg-gray-800"
                            placeholder={t('user_profile.email_placeholder')} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>

                    <FormField name="study_level_id" control={form.control} render={({field}) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{t('user_profile.study_level')}</FormLabel>
                        <FormControl>
                          <Select {...field} onValueChange={(val) => { field.onChange(val); }} value={field.value}>
                            <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                              <SelectValue placeholder={t('user_profile.select_placeholder')} />
                            </SelectTrigger>
                            <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {studyLevels.data?.map((level: StudyLevel) => (
                                <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={level.id} value={String(level.id)}>{level.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>

                    {!isGraduate && (
                    <FormField name="faculty_id" control={form.control} render={({field}) => (
                      <FormItem className="col-span-2 lg:col-span-1">
                        <FormLabel>{t('user_profile.faculty')}</FormLabel>
                        <FormControl>
                          <Select {...field} onValueChange={field.onChange} value={field.value} disabled={faculties.isPending || !faculties.data?.length}>
                            <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                              <SelectValue placeholder={t('user_profile.select_placeholder')} />
                            </SelectTrigger>
                            <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {faculties.data?.map((fac: Faculty) => (
                                <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={fac.id} value={String(fac.id)}>{fac.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                    )}

                    {!isGraduate && (
                    <FormField name="program_id" control={form.control} render={({field}) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{t('user_profile.program')}</FormLabel>
                        <FormControl>
                          <Select {...field} onValueChange={field.onChange} value={field.value} disabled={programs.isPending || !programsByFaculty?.length}>
                            <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-5 shadow-sm">
                              <SelectValue placeholder={t('user_profile.select_placeholder')} />
                            </SelectTrigger>
                            <SelectContent className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {programsByFaculty?.map((prog: Program) => (
                                <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" key={prog.id} value={String(prog.id)}>{prog.name}</SelectItem>
                              ))}
                              <SelectItem className="w-full overflow-hidden text-ellipsis whitespace-nowrap" value={OTHER_VALUE}>{t('user_profile.others')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                    )}

                    {(isGraduate || useOtherProgram) && (
                      <FormField name="program_name" control={form.control} render={({field}) => (
                        <FormItem className="col-span-2">
                          <FormLabel>{t('user_profile.program_name')}</FormLabel>
                          <FormControl>
                            <input {...field} className="block w-full border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] sm:text-sm sm:leading-6 appearance-none rounded-md px-2.5 py-2.5 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none dark:bg-gray-800"
                              placeholder={t('user_profile.program_placeholder')} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}/>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  {t('user_profile.cancel')}
                </Button>
                <Button size="sm"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updateProfile.isPending}
                  variant={updateProfile.isPending ? "outline" : "primary"}
                  className={`${updateProfile.isPending && "bg-background"} px-4 py-2 rounded-md bg-primary text-background`}
                >
                  {updateProfile.isPending ? (
                    <RotatingLines visible={true} strokeWidth="5" width="20" strokeColor="#3b82f6" animationDuration="0.75" ariaLabel="rotating-lines-loading" />
                  ) : t('user_profile.save')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
