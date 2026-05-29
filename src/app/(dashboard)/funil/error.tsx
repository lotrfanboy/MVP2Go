"use client";

export default function FunilError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
      Erro no funil: {error.message}
    </div>
  );
}
