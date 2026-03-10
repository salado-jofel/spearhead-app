"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signup } from "../actions";
import SubmitButton from "@/app/(components)/SubmitButton";
import { useActionState, useState } from "react";
import ErrorAlert from "@/app/(components)/ErrorAlert";

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signup, null);

  // Initialize state for all fields
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });

  // Universal change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 select-none">
      <div className="w-full max-w-120 bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-100">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 text-emerald-500 mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-emerald-600 uppercase">
            Spearhead Medical
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Sales Representative Portal
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="flex items-center gap-2 text-slate-700"
              >
                <User className="w-4 h-4 text-emerald-500" /> First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formValues.firstName} // Controlled value
                onChange={handleChange} // Update state on type
                required
                placeholder="John"
                className="h-11 border-slate-200 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="flex items-center gap-2 text-slate-700"
              >
                <User className="w-4 h-4 text-emerald-500" /> Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formValues.lastName} // Controlled value
                onChange={handleChange} // Update state on type
                required
                placeholder="Doe"
                className="h-11 border-slate-200 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-2 text-slate-700"
            >
              <Mail className="w-4 h-4 text-emerald-500" /> Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formValues.email} // Controlled value
              onChange={handleChange}
              required
              placeholder="john@example.com"
              className="h-11 border-slate-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="flex items-center gap-2 text-slate-700"
            >
              <User className="w-4 h-4 text-emerald-500" /> Username
            </Label>
            <Input
              id="username"
              name="username"
              value={formValues.username} // Controlled value
              onChange={handleChange}
              required
              placeholder="Choose a username"
              className="h-11 border-slate-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 text-slate-700"
            >
              <Lock className="w-4 h-4 text-emerald-500" /> Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formValues.password} // Controlled value
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Create a password"
              className="h-11 border-slate-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-4 pt-4">
            <SubmitButton
              classname="h-12 w-full bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-95 font-bold"
              isPending={isPending}
              type="submit"
              cta="Create Account"
              variant="default"
              size="lg"
              isPendingMesssage="Creating an account..."
            />
            {state?.error && <ErrorAlert errorMessage={state.error} />}
          </div>
        </form>
      </div>
    </div>
  );
}
