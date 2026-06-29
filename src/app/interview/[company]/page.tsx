"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { companies, getQuestionsForCompany } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function InterviewPage({ params }: { params: Promise<{ company: string }> }) {
  const router = useRouter();

  const resolveParams = async () => {
    const { company } = await params;
    return company;
  };

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ score: number; feedback: string; improvedAnswer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"select" | "intro" | "answering" | "feedback">("select");

  const supabase = createClient();

  if (!companyId) {
    resolveParams().then(setCompanyId);
  }

  const company = companies.find((c) => c.id === companyId);

  if (!company) {
    if (companyId) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">Company not found.</p>
              <Button className="mt-4" onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const startInterview = () => {
    const qs = getQuestionsForCompany(company.id, "hr");
    setQuestions(qs);
    setCurrentIndex(0);
    setFeedback(null);
    setAnswer("");
    setPhase("answering");
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please write an answer first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.name,
          question: questions[currentIndex],
          answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get feedback");
      }

      setFeedback(data);
      setPhase("feedback");

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("interview_sessions").insert({
          user_id: user.id,
          company_id: company.id,
          question: questions[currentIndex],
          user_answer: answer,
          ai_score: data.score,
          ai_feedback: data.feedback,
          improved_answer: data.improvedAnswer,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setFeedback(null);
      setAnswer("");
      setPhase("answering");
    } else {
      setPhase("select");
      setCurrentIndex(-1);
      toast.success("Interview complete! Great effort.");
    }
  };

  const navigateBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">PrepAI</div>
          <Button variant="ghost" onClick={navigateBack}>Back to dashboard</Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {phase === "select" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{company.name} Interview Practice</CardTitle>
              <CardDescription>{company.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Interview rounds</h3>
                <div className="flex gap-2">
                  {company.rounds.map((round) => (
                    <Badge key={round} variant="secondary">{round}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What to expect</h3>
                <p className="text-sm text-gray-600">
                  We&apos;ll ask you {questions.length || 10} HR/behavioral questions.
                  Type your answers and get AI-powered feedback including a score, detailed analysis, and an improved answer.
                </p>
              </div>
              <Button onClick={startInterview} className="w-full" size="lg">
                Start interview
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "answering" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Question {currentIndex + 1} of {questions.length}</Badge>
              <Badge>{company.name}</Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{questions[currentIndex]}</CardTitle>
                <CardDescription>Type your response as you would in a real interview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full min-h-[200px] p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <Button
                  onClick={submitAnswer}
                  className="w-full"
                  disabled={loading || !answer.trim()}
                >
                  {loading ? "Getting AI feedback..." : "Submit answer"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {phase === "feedback" && feedback && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Question {currentIndex + 1} of {questions.length}</Badge>
              <Badge>{company.name}</Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feedback</CardTitle>
                <CardDescription>{questions[currentIndex]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600">{feedback.score}/10</div>
                  <div>
                    <p className="font-medium">Your score</p>
                    <p className="text-sm text-gray-600">
                      {feedback.score >= 8 ? "Excellent! Keep it up." :
                       feedback.score >= 6 ? "Good, but room for improvement." :
                       "Needs work. Review the feedback below."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Detailed feedback</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback.feedback}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Improved answer</h3>
                  <div className="p-4 bg-blue-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                    {feedback.improvedAnswer}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={nextQuestion} className="w-full" size="lg">
              {currentIndex + 1 < questions.length ? "Next question" : "Finish interview"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
