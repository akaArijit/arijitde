'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type { Assessment } from '@/lib/api-client';

interface AssessmentData {
  userId: string;
  age: number;
  goal: string;
  ageRange?: string;
  lifeStage?: string;
  investmentTenure?: string;
  isCompletePortfolio?: boolean;
  investmentStyle?: string;
  expectedReturn?: string;
  riskBehavior?: string;
  monthlyInvestment?: string;
  emergencyFund?: string;
}

interface CreateAssessmentData {
  userId: string;
  age: number;
  goal: string;
  ageRange?: string;
  lifeStage?: string;
  investmentTenure?: string;
  isCompletePortfolio?: boolean;
  investmentStyle?: string;
  expectedReturn?: string;
  riskBehavior?: string;
  monthlyInvestment?: string;
  emergencyFund?: string;
}

export function useAssessments(userId: string) {
  return useQuery({
    queryKey: queryKeys.assessments(userId),
    queryFn: () => api.assess.list(),
    enabled: !!userId,
  });
}

export function useAssessment(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.assessment(assessmentId),
    queryFn: () => api.assess.get(assessmentId),
    enabled: !!assessmentId,
  });
}

export function useUserAssessment(userId: string) {
  return useQuery({
    queryKey: queryKeys.userAssessment(userId),
    queryFn: () => api.assess.getUser(userId),
    enabled: !!userId,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssessmentData) => api.assess.create(data as Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userAssessment(variables.userId) });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, data }: { assessmentId: string; data: Partial<AssessmentData> }) => 
      api.assess.create(data as Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessment(variables.assessmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments('') });
      queryClient.invalidateQueries({ queryKey: queryKeys.userAssessment('') });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => api.assess.create({} as Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments('') });
      queryClient.invalidateQueries({ queryKey: queryKeys.userAssessment('') });
    },
  });
}