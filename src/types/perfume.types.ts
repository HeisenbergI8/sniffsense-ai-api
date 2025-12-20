export type PerfumePayload = {
  brand: string;
  name: string;
  weatherTags: string[];
  occasionTags: string[];
  mlRemaining: number;
  lastUsedAt?: Date | null;
};

export type PerfumeUpdatePayload = Partial<PerfumePayload>;
