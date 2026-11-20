'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type { Portfolio, Score } from '@/lib/api-client';

interface PortfolioRow {
  fundName: string;
  type: 'SIP' | 'LUMPSUM';
  startDate: string;
  sipAmount: number;
  invested: number;
  currentValue: number;
}

interface CreatePortfolioData {
  name: string;
  assessmentId: string;
  description?: string;
}

interface UploadPortfolioData {
  file: File;
  assessmentId: string;
}

interface ManualPortfolioData {
  assessmentId: string;
  rows: PortfolioRow[];
}

export function usePortfolios(userId: string) {
  return useQuery({
    queryKey: queryKeys.portfolios(userId),
    queryFn: () => api.portfolio.list(),
    enabled: !!userId,
  });
}

export function usePortfolio(portfolioId: string) {
  return useQuery({
    queryKey: queryKeys.portfolio(portfolioId),
    queryFn: () => api.portfolio.get(portfolioId),
    enabled: !!portfolioId,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePortfolioData) => api.portfolio.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(variables.assessmentId) });
    },
  });
}

export function useUploadPortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, assessmentId }: UploadPortfolioData) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assessmentId', assessmentId);
      return api.portfolio.create({ name: file.name, assessmentId, description: 'Uploaded portfolio' });
    },
  });
}

export function useCreateManualPortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ManualPortfolioData) => api.portfolio.create({ name: 'Manual Portfolio', assessmentId: data.assessmentId, description: 'Manually created portfolio' }),
  });
}

export function usePortfolioScores(portfolioId: string) {
  return useQuery({
    queryKey: queryKeys.portfolioScores(portfolioId),
    queryFn: () => api.score.portfolio(portfolioId),
    enabled: !!portfolioId,
  });
}

export function useScore(scoreId: string) {
  return useQuery({
    queryKey: queryKeys.score(scoreId),
    queryFn: () => api.score.get(scoreId),
    enabled: !!scoreId,
  });
}

export function useCalculateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (portfolioId: string) => api.score.calculate(portfolioId),
    onSuccess: (_, portfolioId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolioScores(portfolioId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(portfolioId) });
    },
  });
}

export function useClientData() {
  return useQuery({
    queryKey: queryKeys.clientData,
    queryFn: () => api.portfolio.clientData(),
  });
}