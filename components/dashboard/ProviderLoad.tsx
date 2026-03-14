import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const providers = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    load: 18
  },
  {
    name: "Dr. Michael Lee",
    specialty: "Dermatology",
    load: 12
  },
  {
    name: "Dr. Priya Nair",
    specialty: "Internal Medicine",
    load: 14
  }
];

export function ProviderLoad() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider workload</CardTitle>
        <CardDescription>Daily case load distribution.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-white">{provider.name}</p>
                <p className="text-xs text-white/50">{provider.specialty}</p>
              </div>
              <p className="text-white/70">{provider.load} visits</p>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${Math.min(provider.load * 4, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
