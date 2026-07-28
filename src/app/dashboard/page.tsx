import { createServerSupabase } from "@/lib/supabase-server";
import { companies } from "@/lib/companies";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Dashboard() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const userMeta = user?.user_metadata;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">PrepAI</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <form action="/auth/logout" method="post">
              <button type="submit" className="text-sm text-red-600 hover:underline">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome{userMeta?.college ? `, ${userMeta.college} student` : ""}!</h1>
          <p className="text-gray-600 mt-1">Choose a company and start practicing for your campus placement.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.filter(c => c.popular).map((company) => (
            <Link key={company.id} href={`/interview/${company.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{company.name}</CardTitle>
                    <Badge variant="secondary">{company.rounds.length} rounds</Badge>
                  </div>
                  <CardDescription>{company.fullName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{company.description}</p>
                  <div className="flex gap-2 mt-3">
                    {company.rounds.map((round) => (
                      <Badge key={round} variant="outline" className="text-xs">{round}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
