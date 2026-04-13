import { useMemo, useCallback } from 'react';
import type { Subject } from '../utils/studyLogic';
import { calculateSpacedRepetitionDate } from '../utils/studyLogic';

export interface ReviewItem {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  reviewDate: string;
  daysOverdue: number;
}

export interface UseRevisionsReturn {
  reviewsDue: ReviewItem[];
  upcomingReviews: ReviewItem[];
  markReviewed: (topicId: string, subjectId: string) => void;
}

export function useRevisions(
  subjects: Subject[],
  updateTopic: (subjectId: string, topicId: string, patch: Record<string, unknown>) => void
): UseRevisionsReturn {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);


  const sevenDaysFromNow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }, [today]);

  const reviewsDue = useMemo<ReviewItem[]>(() => {
    const items: ReviewItem[] = [];
    for (const subject of subjects) {
      for (const topic of subject.topics) {
        if (!topic.reviewDate) continue;
        const reviewDate = new Date(topic.reviewDate);
        if (reviewDate <= today) {
          const diffMs = today.getTime() - reviewDate.getTime();
          const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          items.push({
            topicId: topic.id,
            topicName: topic.name,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color,
            reviewDate: topic.reviewDate,
            daysOverdue,
          });
        }
      }
    }
    return items;
  }, [subjects, today]);

  const upcomingReviews = useMemo<ReviewItem[]>(() => {
    const items: ReviewItem[] = [];
    for (const subject of subjects) {
      for (const topic of subject.topics) {
        if (!topic.reviewDate) continue;
        const reviewDate = new Date(topic.reviewDate);
        if (reviewDate > today && reviewDate <= sevenDaysFromNow) {
          items.push({
            topicId: topic.id,
            topicName: topic.name,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color,
            reviewDate: topic.reviewDate,
            daysOverdue: 0,
          });
        }
      }
    }
    return items;
  }, [subjects, today, sevenDaysFromNow]);

  const markReviewed = useCallback(
    (topicId: string, subjectId: string) => {
      const subject = subjects.find(s => s.id === subjectId);
      const topic = subject?.topics.find(t => t.id === topicId);
      if (!topic) return;

      const now = new Date().toISOString();
      const newReviewCount = (topic.reviewCount ?? 0) + 1;
      const updatedTopic = { ...topic, reviewCount: newReviewCount };
      const newReviewDate = calculateSpacedRepetitionDate(updatedTopic, now);

      updateTopic(subjectId, topicId, {
        lastReviewedAt: now,
        reviewCount: newReviewCount,
        reviewDate: newReviewDate,
      });
    },
    [subjects, updateTopic]
  );

  return { reviewsDue, upcomingReviews, markReviewed };
}
