"use client";

import { ReactNode, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setFacilities } from "@/app/dashboard/facilities/(redux)/facilities-slice";
import { setOrders } from "@/app/dashboard/orders/(redux)/orders-slice";
import type { Facility } from "@/app/(interfaces)/facility";
import type { Order } from "@/app/(interfaces)/order";

interface DashboardProvidersProps {
  children: ReactNode;
  facilities: Facility[];
  orders: Order[];
}

export default function Providers({
  children,
  facilities,
  orders,
}: DashboardProvidersProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setFacilities(facilities));
    dispatch(setOrders(orders));
  }, [dispatch, facilities, orders]);

  return <>{children}</>;
}
