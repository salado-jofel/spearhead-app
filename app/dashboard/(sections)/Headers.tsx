"use client"
import { useAppSelector } from "@/store/hooks";

export default function Headers() {
  const userData = useAppSelector((state) => state.dashboard);

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">
        Dashboard
      </h1>
      <p className="text-xs md:text-sm text-slate-500 mt-0.5">
        Welcome back,{" "}
        <span className="font-semibold text-slate-700">
          {userData.name}
        </span>
        ! Here&apos;s your sales overview.
      </p>
    </div>
  );
}
