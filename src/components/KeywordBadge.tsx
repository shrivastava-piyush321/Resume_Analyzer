
"use client"

import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface KeywordBadgeProps {
  keyword: string;
  matched: boolean;
}

export const KeywordBadge: React.FC<KeywordBadgeProps> = ({ keyword, matched }) => {
  return (
    <Badge 
      variant={matched ? "default" : "outline"}
      className={`py-1 px-3 gap-1.5 font-medium transition-all ${
        matched 
          ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" 
          : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
      }`}
    >
      {matched ? (
        <Check className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      {keyword}
    </Badge>
  );
};
