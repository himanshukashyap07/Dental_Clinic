
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { MessageSquare, Sparkles, User, ShieldCheck } from "lucide-react";
import { getDentalTip } from "@/ai/flows/ai-dental-tip-tool";
import { Skeleton } from "@/components/ui/skeleton";

export default function TipsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer(null);

    try {
      const response = await getDentalTip({ question });
      setAnswer(response.tip);
    } catch (error) {
      setAnswer("I'm sorry, I couldn't process your request right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="py-20 bg-background min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Insights</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">AI Dental Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Get instant tips on oral hygiene or answers to common dental health questions from our digital assistant.
          </p>
        </div>

        <Card className="shadow-2xl overflow-hidden border-none">
          <CardHeader className="bg-primary text-primary-foreground p-8">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span>Ask a Question</span>
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Example: "How often should I floss?" or "Tips for sensitive teeth"
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="flex-grow py-6 text-lg"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-accent hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Thinking..." : "Get Answer"}
                </Button>
              </div>
            </form>

            <div className="mt-8 space-y-6">
              {isLoading && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                    </div>
                    <div className="flex-grow space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              )}

              {answer && !isLoading && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent/10 rounded-full flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-accent" />
                    </div>
                    <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
                      <p className="text-lg leading-relaxed text-foreground">
                        {answer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-6 flex flex-col items-center border-t">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span>General advice only. Not a substitute for professional diagnosis.</span>
            </div>
            {!answer && !isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[
                  "What causes bad breath?",
                  "Best way to whiten teeth?",
                  "Are electric brushes better?",
                  "Tips for healthy gums"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuestion(q); }}
                    className="text-left p-3 rounded-lg border bg-white hover:border-accent hover:text-accent transition-colors text-sm font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
