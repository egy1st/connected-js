// app/talk/[id]/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TalkPageProps {
  params: {
    id: string;
  };
}

interface TalkData {
  title: string;
  author: string;
  description: string;
  transcript: string;
}

export default function TalkPage({ params }: TalkPageProps) {
  const [talkData, setTalkData] = useState<TalkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/talk-data/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTalkData(data);
      } catch (e) {
        console.error("An error occurred while fetching data:", e);
        setError("Failed to load talk data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!talkData) {
    return <div className="text-center py-10">No talk data available.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{talkData.title}</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About this talk</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">By {talkData.author}</p>
          <p className="mb-4">{talkData.description}</p>
          <h2 className="text-xl font-semibold mb-2">Transcript</h2>
          <p className="whitespace-pre-wrap">{talkData.transcript}</p>
        </CardContent>
      </Card>
      <Button asChild>
        <a href={`/quiz/${params.id}`}>Take a quiz on this talk</a>
      </Button>
    </div>
  );
}