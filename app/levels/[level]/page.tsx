// File: app/levels/[level]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PaginationControls = ({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const maxVisiblePages = 5;
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1) ||
      (totalPages <= maxVisiblePages)
    ) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== null) {
      pageNumbers.push(null);
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {pageNumbers.map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === null ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={pageNumber === currentPage}
                onClick={() => onPageChange(pageNumber as number)}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default function LevelPage({ params }: LevelPageProps) {
  const [levelTalks, setLevelTalks] = useState<Record<string, TalkInfo>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/level-talks/${params.level}?page=${currentPage}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLevelTalks(data.talks);
        setTotalPages(data.pagination.totalPages);
      } catch (e) {
        console.error("An error occurred while fetching data:", e);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.level, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Level {params.level}</h1>
      {Object.entries(levelTalks).map(([talkId, talkInfo]) => (
        <Card key={talkId} className="mb-6">
          <CardHeader>
            <CardTitle>{talkInfo.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                <Image
                  src={talkInfo.image}
                  alt={talkInfo.title}
                  width={320}
                  height={240}
                  className="rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
              <div className="md:w-2/3">
                <p className="text-sm text-gray-500 mb-2">By {talkInfo.author}</p>
                <p className="mb-2">{talkInfo.description}</p>
                <p className="text-sm text-gray-500">
                  Duration: {talkInfo.duration} | Views: {talkInfo.views}
                </p>
                {talkInfo.rank && (
                  <>
                    <p className="text-sm text-gray-500">
                      Words: {talkInfo.rank.words_no} | 
                      Rank: {talkInfo.rank.rank.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Top 1k: {talkInfo.rank.top1k} | 
                      Top 3k: {talkInfo.rank.top3k} | 
                      Top 5k: {talkInfo.rank.top5k} | 
                      Top 10k: {talkInfo.rank.top10k} | 
                      Top 50k: {talkInfo.rank.top50k}
                    </p>
                  </>
                )}
                <Button className="mt-4" asChild>
                  <a href={`/talk/${talkId}`}>Learn these words</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}