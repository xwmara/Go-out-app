import { api } from "../../services/api";

export type DiscountType = "percent" | "fixed";

export interface DiscountItem {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount: number;
  eventId?: string | null;
  isActive: boolean;
}

export interface ValidateDiscountResult {
  valid: boolean;
  message: string;
  code?: string | null;
  discountType?: DiscountType | null;
  value?: number | null;
  discountAmount: number;
}

export interface CreateDiscountPayload {
  code: string;
  discountType: DiscountType;
  value: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  eventId?: string | null;
  isActive?: boolean;
}

export const discountsService = {
  async validate(eventId: string, code: string, subtotal: number): Promise<ValidateDiscountResult> {
    const { data } = await api.post<ValidateDiscountResult>("/Discounts/validate", {
      eventId,
      code,
      subtotal,
    });
    return data;
  },

  async listForEvent(eventId: string): Promise<DiscountItem[]> {
    const { data } = await api.get<DiscountItem[]>(`/Discounts/event/${eventId}`);
    return data;
  },

  async create(payload: CreateDiscountPayload): Promise<DiscountItem> {
    const { data } = await api.post<DiscountItem>("/Discounts", payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/Discounts/${id}`);
  },
};
