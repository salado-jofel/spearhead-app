"use client";

import type { Facility } from "@/app/(interfaces)/facility";
import type { Product } from "@/app/(interfaces)/product";
import { useAppDispatch } from "@/store/hooks";
import { type ReactNode, useEffect } from "react";
import { setFacility, setProducts } from "../(redux)/facility-slice";

export default function Providers({
  children,
  facility,
  products,
}: {
  children: ReactNode;
  facility: Facility;
  products: Product[];
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setFacility(facility));
    dispatch(setProducts(products));
  }, [dispatch, facility, products]);

  return <>{children}</>;
}
