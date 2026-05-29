import { FunilDisclaimer } from "@/components/dashboard/funil-disclaimer";

export default function FunilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <FunilDisclaimer />
      {children}
    </div>
  );
}
