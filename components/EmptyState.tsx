import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionHref && actionLabel ? (
        <Button className="mt-5" href={actionHref}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
