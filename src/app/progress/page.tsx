import { createServerSupabase } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProgressPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const totalInterviews = sessions?.length || 0;
  const avgScore = sessions?.length
    ? Math.round(sessions.reduce((a, s) => a + (s.ai_score || 0), 0) / sessions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">PrepAI</div>
          <div className="flex gap-4">
            <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
            <form action="/auth/logout" method="post">
              <button type="submit" className="text-sm text-red-600 hover:underline">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Progress</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{totalInterviews}</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">Questions answered</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{avgScore}/10</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">Average score</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {avgScore >= 7 ? "Good" : avgScore >= 5 ? "Improving" : "Needs work"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">Your level</CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent sessions</h2>

        {(!sessions || sessions.length === 0) ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 mb-4">No practice sessions yet.</p>
              <Link href="/dashboard">
                <Button>Start your first interview</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 20).map((session) => (
              <Card key={session.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{session.question}</p>
                    <p className="text-sm text-gray-500">
                      Company: {session.company_id} • {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={session.ai_score >= 7 ? "default" : session.ai_score >= 5 ? "secondary" : "outline"}>
                    {session.ai_score}/10
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
