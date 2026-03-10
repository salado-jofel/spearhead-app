import React from "react";

export default function Headers({ displayName }: { displayName: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="text-sm text-slate-500">
        Welcome back,{" "}
        <span className="font-semibold text-slate-700">{displayName}</span>!
        Here&apos;s your sales overview.
      </p>
    </div>
  );
}
