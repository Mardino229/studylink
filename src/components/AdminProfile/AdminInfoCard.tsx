import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {useState} from "react";
import {useModal} from "../../hoooks/useModal.ts";
import {useAxiosPrivate} from "../../hoooks/useAxiosPrivate.ts";
import type {User} from "../../utils/type.ts";
import {Label} from "../ui/label.tsx";
import {Input} from "../ui/input.tsx";

// Schéma de validation avec Zod
const adminInfoSchema = z.object({
  email: z.string().email("L’email doit être valide").min(1, "L’email est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Type déduit du schéma Zod
type AdminInfoFormData = z.infer<typeof adminInfoSchema>;

// Interface pour les erreurs renvoyées par Laravel
interface ValidationErrors {
  email?: string[];
  password?: string[];
  general?: string;
}

interface ApiResponse {
  message: string;
  user: User;
}

export default function AdminInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<ValidationErrors>({});


  // Récupérer les informations de l'utilisateur
  const fetchUser = async (): Promise<User> => {
    const response = await axiosPrivate.get("/user");
    return response.data.body;
  };

  const { data: user, isPending, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  // Configuration de React Hook Form avec Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<AdminInfoFormData>({
    resolver: zodResolver(adminInfoSchema),
    defaultValues: {
      email: user?.email || "admin@example.com",
      password: "",
    },
  });

  // Mutation pour mettre à jour l'email de l'administrateur
  const { mutate, isPending:isPend } = useMutation<
      ApiResponse,
      AxiosError<{ errors?: ValidationErrors }>,
      AdminInfoFormData
  >({
    mutationFn: async (data: AdminInfoFormData) => {
      try {
        const response = await axiosPrivate.put("/user", {
          email: data.email,
          password: data.password,
        });
        return response.data;
      } catch (err ) {
        const error = err as AxiosError
        console.log(err)
        if (error.status === 422) {
          // Erreurs de validation
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          throw { validationErrors: error.response?.data.errors || {} };
        } else {
          throw new Error(error.message || 'Une erreur est survenue');
        }
      }
    },
    onSuccess: (data) => {
      // Mettre à jour les données de l'utilisateur après succès
      refetch();
      handleCloseModal();
      reset({
        email: data.user.email,
        password: "",
      });
      setError({});
    },
    onError: (error) => {
      if ('validationErrors' in error) {
        setError(error.validationErrors || {});
      } else if (error instanceof Error) {
        setError({ general: error.message || 'Une erreur est survenue lors de la mise à jour du mot de passe' });
      } else {
        setError({ general: 'Une erreur inconnue est survenue' });
      }
    },
  });

  const handleCloseModal = () => {
    reset();
    setError({});
    closeModal();
  };


  // Gestion de la soumission
  const onSubmit: SubmitHandler<AdminInfoFormData> = (data) => {
    mutate(data);
  };

  return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Information Personelle
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Prénoms
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.first_name || "Admin"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Nom
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.last_name || "Admin"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Addresse email
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={openModal} disabled={isPend} variant={"outline"}>
            <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
              />
            </svg>
            Modifier
          </Button>
        </div>

        <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Mettez à jour votre adresse mail
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Mettez à jour votre adresse e-mail. Vous devez fournir votre mot de passe pour des raisons de sécurité.
              </p>
            </div>
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              {error.general && (
                  <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
                    {error.general}
                  </div>
              )}
              <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
                <div className="mt-7">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Email</Label>
                      <Input
                          type="email"
                          placeholder="Email"
                          {...register("email")}
                          // error={!!error.email || !!errors.email}
                          // hint={error.email?.join(',') || errors.email?.message}
                      />
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Mot de passe</Label>
                      <Input
                          type="password"
                          placeholder="Mot de passe"
                          {...register("password")}
                          // error={!!error.password || !!errors.password}
                          // hint={error.password?.join(',') || errors.password?.message}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                <Button size="sm" variant="outline" onClick={handleCloseModal} disabled={isPending}>
                  Fermer
                </Button>
                <Button size="sm" disabled={isPending} variant={isPending? "outline": "primary"}>
                  {isPending? "Mise à jour en cours ...":"Valider"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
  );
}