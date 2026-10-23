import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Design tokens for model output status representation.
 * Explicitly pairs color with accessible iconography and textual labels
 * to guarantee WCAG compliance (never conveying status through color alone).
 */
export const statusTokens = {
  malignant: {
    label: 'Malignant Finding',
    badgeLabel: 'Malignant-class prediction',
    icon: AlertTriangle,
    bgClass: 'bg-red-50 text-red-900 border-red-600',
    badgeClass: 'bg-red-600 text-white border-red-600',
    borderClass: 'border-red-600',
    textClass: 'text-red-700',
    iconClass: 'text-red-600',
  },
  benign: {
    label: 'Benign Finding',
    badgeLabel: 'Benign-class prediction',
    icon: CheckCircle,
    bgClass: 'bg-green-50 text-green-900 border-green-600',
    badgeClass: 'bg-green-600 text-white border-green-600',
    borderClass: 'border-green-600',
    textClass: 'text-green-700',
    iconClass: 'text-green-600',
  },
} as const;

export type StatusType = keyof typeof statusTokens;
