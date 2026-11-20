'use client';

import React from 'react';
import type { User } from '@/lib/api-client';

interface PanLoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: User) => Promise<void>;
}

export function PanLoginForm(props: PanLoginFormProps) {
  return <div>PanLoginForm</div>;
}

export default PanLoginForm;