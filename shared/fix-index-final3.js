const fs = require('fs');
const content = `// Export types - explicitly re-export to avoid ambiguity
export { 
  type Role, 
  type User, 
  type AuthResponse,
  type AdminUser,
  type ClientProfile
} from './types/user';

export { 
  type Goal,
  type AgeRange,
  type LifeStage,
  type InvestmentTenure,
  type InvestmentStyle,
  type ExpectedReturn,
  type RiskBehavior,
  type Assessment 
} from './types/assessment';

export { 
  type FundType,
  type UploadType,
  type PortfolioRow,
  type Portfolio 
} from './types/portfolio';

export { 
  type ScoreTag 
} from './types/scoring';

export { 
  type PaymentStatus, 
  type LeadStatus,
  type Payment,
  type Lead 
} from './types/payment';

export { 
  type ExistingClientData,
  type ExistingClientFolio,
  type AdminSupportQuery,
  type AdminUploadResponse,
  type AdminUserFilters,
  type AdminClientFilters,
  type AdminSessionFilters,
  type AdminQueryFilters,
  type PaginationParams,
  type SearchParams,
  type AdminSessionConfirm,
  type AdminSessionNotes,
  type AdminAvailabilitySlots,
  type AdminTab,
  type UserRole,
  type SessionStatus,
  type QueryStatus,
  type AvailabilitySlot,
  type AdminClientProfileUpdate,
  type AdminSessionConfirm,
  type AdminSessionNotes,
  type ClientData,
  type ClientDataOrNull,
} from './types/admin';
`;
fs.writeFileSync('src/index.ts', content, 'utf8');
console.log('Written');