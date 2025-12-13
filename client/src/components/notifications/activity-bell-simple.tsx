
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";

type ActivityLog = {
  id: string;
  type: string;
  description: string;
  websiteId: string | null;
  createdAt: string; // ISO
  metadata?: Record<string, any>;
};

const typeLabels: Record<string, string> = {
  content_published: "Content Published",
  content_generated: "Content Generated",
  content_scheduled: "Content Scheduled",
  seo_analysis: "SEO Analysis",
  seo_issue: "SEO Issue",
  website_connected: "Website Connected",
  seo_autofix: "SEO Auto-Fix",
};

export default function ActivityBellSimple() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("activity:lastSeenAt");
    if (saved) setLastSeenAt(saved);
  }, []);

  async function refresh() {
    try {
      setIsLoading(true);
      // Use the correct API helper - it handles the right endpoint automatically
      const data = await api.getActivityLogs();
      
      // Handle different response formats
      let activityLogs: ActivityLog[] = [];
      
      if (Array.isArray(data)) {
        activityLogs = data;
      } else if (data && typeof data === 'object') {
        // Check common response wrapper keys
        const possibleKeys = ['activities', 'logs', 'items', 'data', 'results'];
        for (const key of possibleKeys) {
          if (Array.isArray(data[key])) {
            activityLogs = data[key];
            break;
          }
        }
      }
      
      // Limit to 20 most recent
      setLogs(activityLogs.slice(0, 20));
    } catch (error) {
      console.error('[ActivityBell] Failed to fetch activity logs:', error);
      // Don't clear existing logs on error, just keep what we have
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    timer.current = window.setInterval(refresh, 15000); // every 15s
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const unread = useMemo(() => {
    if (!lastSeenAt) return logs.length;
    const t = new Date(lastSeenAt).getTime();
    return logs.filter((l) => new Date(l.createdAt).getTime() > t).length;
  }, [logs, lastSeenAt]);

  function markAllRead() {
    const now = new Date().toISOString();
    setLastSeenAt(now);
    localStorage.setItem("activity:lastSeenAt", now);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative bg-white p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] leading-4 text-white flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-medium">Activity</div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refresh}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {logs.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              {isLoading ? "Loading activity..." : "No activity yet"}
            </div>
          ) : (
            <ul className="divide-y">
              {logs.map((l) => {
                const label = typeLabels[l.type] || l.type;
                const isUnread =
                  !lastSeenAt || new Date(l.createdAt) > new Date(lastSeenAt);
                return (
                  <li key={l.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          isUnread ? "bg-primary-500" : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-sm text-gray-700">{l.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(l.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}