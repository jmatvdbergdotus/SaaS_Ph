export interface Store {
  id: string;
  ownerId: string;
  name: string;
  ownerName: string;
  address?: string;
  contactNumber: string;
  dtiRegistrationNumber?: string;
  birTin?: string;
  trustmarkVerified: boolean;
  trustmarkBadgeUrl?: string;
  plan: "FREE" | "GROWTH" | "SCALE";
  monthlyOrderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantUser {
  id: string;
  phoneNumber: string;
  storeId?: string;
  createdAt: string;
  lastLoginAt?: string;
}
