// "use client";

// import { useAppSelector } from "@/store/hooks";
// import { Package } from "lucide-react";

// export default function Header() {
//   const total = useAppSelector((state) => state.products.items.length);

//   return (
//     <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
//       <div className="flex items-center gap-4">
//         <div className="w-14 h-14 rounded-xl bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
//           <Package className="w-7 h-7 text-[#2db0b0]" />
//         </div>
//         <div>
//           <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
//             Products
//           </h1>
//           <p className="text-slate-400 text-sm">
//             {total} product{total !== 1 ? "s" : ""} across all facilities
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useAppSelector } from "@/store/hooks";

export default function Header() {
  const total = useAppSelector((state) => state.products.items.length);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
          Products
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {total} product{total !== 1 ? "s" : ""} across all facilities
        </p>
      </div>
    </div>
  );
}
