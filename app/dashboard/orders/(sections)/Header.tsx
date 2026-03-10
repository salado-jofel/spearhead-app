import { CreateOrderModal } from "./CreateOrderModal";

export default function Header() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-slate-800">Orders Management</h1>
      <p className="text-slate-500 text-sm">Track and manage your orders</p>
      <div className="pt-3">
        <CreateOrderModal />
      </div>
    </div>
  );
}
