"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/auth.action";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) =>
  z.object({
    name:
      type === "sign-up"
        ? z.string().min(3, "Name must be at least 3 characters")
        : z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(3, "Password must be at least 3 characters"),
  });

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const isSignIn = type === "sign-in";

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, email, password } = values;

    try {
      if (!isSignIn) {
        // Sign-Up Flow
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name ?? "", // fallback for type safety
          email,
          password,
        });

        if (!result?.success) {
          toast.error(result.message || "Sign up failed");
          return;
        }

        toast.success("Account created successfully!");
        router.push("/sign-in");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in failed. No token returned.");
          return;
        }

        const result = await signIn({ email, idToken });

        if (!result?.success) {
          toast.error(result?.message || "Sign in failed");
          return;
        }

        toast.success("Signed in successfully!");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast.error(error.message || "Something went wrong");
    }
  }

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100 text-xl font-semibold">Prepwise</h2>
        </div>
        <h3 className="text-center text-lg font-medium">
          Practice job interview with AI
        </h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
                type="text"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />
            <Button className="btn w-full" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>
      </div>

      <p className="text-center mt-4 text-sm">
        {isSignIn ? "No account yet?" : "Have an account already?"}
        <Link
          href={!isSignIn ? "/sign-in" : "/sign-up"}
          className="font-bold text-user-primary ml-1"
        >
          {!isSignIn ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
