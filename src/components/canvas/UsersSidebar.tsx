import React from 'react';
import { Users, Circle, Wifi, WifiOff } from 'lucide-react';
import type { User } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface UsersSidebarProps {
  users: User[];
  localUserId: string;
  isDemo: boolean;
  roomId: string;
}

export const UsersSidebar: React.FC<UsersSidebarProps> = ({
  users,
  localUserId,
  isDemo,
  roomId,
}) => {
  return (
    <div className="absolute top-4 right-4 z-20 w-56 bg-card/95 backdrop-blur-sm rounded-xl shadow-soft border border-border overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Room: {roomId}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isDemo ? (
            <>
              <WifiOff className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-warning">Demo</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-success">Live</span>
            </>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="p-2 max-h-64 overflow-y-auto scrollbar-thin">
        <div className="text-xs text-muted-foreground px-2 py-1.5">
          Online ({users.length})
        </div>
        <div className="space-y-1">
          {users.map((user) => (
            <div
              key={user.id}
              className={cn(
                'flex items-center gap-2 px-2 py-2 rounded-lg transition-colors',
                user.id === localUserId ? 'bg-primary/10' : 'hover:bg-muted/50'
              )}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm truncate flex-1">
                {user.name}
                {user.id === localUserId && (
                  <span className="text-muted-foreground ml-1">(you)</span>
                )}
              </span>
              <Circle
                className={cn(
                  'h-2 w-2 flex-shrink-0',
                  user.isDrawing ? 'text-success fill-success animate-pulse' : 'text-muted-foreground fill-muted-foreground'
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Demo Mode Notice */}
      {isDemo && (
        <div className="p-3 border-t border-border bg-warning/5">
          <p className="text-xs text-muted-foreground">
            Running in demo mode. Connect to a WebSocket server for real-time collaboration.
          </p>
        </div>
      )}
    </div>
  );
};
