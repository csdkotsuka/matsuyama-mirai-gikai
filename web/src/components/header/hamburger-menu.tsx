"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RubyToggle } from "@/lib/rubyful";

import Link from "next/link";
import { Building2, Users, FileText, Sparkles } from "lucide-react";

export function HamburgerMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-3" align="end">
        <div className="space-y-1 text-sm font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-primary" />
            国会・法案トップ
          </Link>
          <Link
            href="/councils"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Building2 className="w-4 h-4 text-primary" />
            地方議会（松山・愛媛）
          </Link>
          <Link
            href="/politicians"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Users className="w-4 h-4 text-primary" />
            議員・発言一覧
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="px-3 py-1 text-xs text-gray-400 font-semibold mb-1">
            表示設定
          </div>
          <RubyToggle />
        </div>
      </PopoverContent>
    </Popover>
  );
}
