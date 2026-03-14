export const dynamic = "force-dynamic";

import QuickBooksClient from "./(sections)/QuickBooksClient";
import { getQuickBooksAuthUrl, getQuickBooksConnection } from "./actions";

export default async function QuickBooksPage() {
  const [authUrl, connection] = await Promise.all([
    getQuickBooksAuthUrl(),
    getQuickBooksConnection(),
  ]);

  return (
    <div className="p-8 w-full mx-auto space-y-6 select-none h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">QuickBooks</h1>
        <p className="text-slate-500 text-sm mt-1">
          Connect your QuickBooks account to sync orders, invoices, and
          payments.
        </p>
      </div>

      <QuickBooksClient authUrl={authUrl} connection={connection} />
    </div>
  );
}
