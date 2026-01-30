type ReviewStateSnapshot = {
  intervalDays: number;
  easeFactor: number;
  streak: number;
  nextReviewAt: Date;
  isMastered: boolean;
};

type ReviewUpdate = {
  intervalDays: number;
  easeFactor: number;
  streak: number;
  nextReviewAt: Date;
  isMastered: boolean;
};

const DEFAULT_STATE: ReviewStateSnapshot = {
  intervalDays: 0,
  easeFactor: 2.5,
  streak: 0,
  nextReviewAt: new Date(0),
  isMastered: false,
};

export function updateReviewState(
  prev: Partial<ReviewStateSnapshot> | null | undefined,
  isCorrect: boolean,
  now: Date
): ReviewUpdate {
  const current = { ...DEFAULT_STATE, ...prev };

  if (isCorrect) {
    const streak = current.streak + 1;
    const easeFactor = Math.min(3.0, current.easeFactor + 0.1);
    let intervalDays = 0;
    if (current.intervalDays === 0) {
      intervalDays = 1;
    } else if (current.intervalDays === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.round(current.intervalDays * current.easeFactor);
    }
    const nextReviewAt = new Date(now);
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);
    return {
      intervalDays,
      easeFactor,
      streak,
      nextReviewAt,
      isMastered: current.isMastered,
    };
  }

  const easeFactor = Math.max(1.3, current.easeFactor - 0.2);
  const intervalDays = 1;
  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);
  return {
    intervalDays,
    easeFactor,
    streak: 0,
    nextReviewAt,
    isMastered: current.isMastered,
  };
}

export function defaultReviewState(now: Date): ReviewStateSnapshot {
  return {
    intervalDays: 0,
    easeFactor: 2.5,
    streak: 0,
    nextReviewAt: now,
    isMastered: false,
  };
}
