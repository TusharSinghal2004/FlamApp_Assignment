import React from 'react';
import type { User } from '@/types/canvas';

interface RemoteCursorsProps {
  users: User[];
  localUserId: string;
}

export const RemoteCursors: React.FC<RemoteCursorsProps> = ({ users, localUserId }) => {
  const remoteUsers = users.filter(u => u.id !== localUserId && u.cursor);

  return (
    <>
      {remoteUsers.map((user) => (
        <div
          key={user.id}
          className="remote-cursor"
          style={{
            transform: `translate(${user.cursor!.x}px, ${user.cursor!.y}px)`,
            color: user.color,
          }}
        >
          {/* Cursor pointer */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M5.65376 12.4563L7.12356 17.9088C7.20556 18.2178 7.5956 18.3312 7.84112 18.1116L10.9999 15.4999L16.5858 17.5858C17.0457 17.7657 17.5499 17.5311 17.6758 17.0549L21.4999 3L3.29999 9.93C2.78999 10.13 2.78999 10.87 3.29999 11.07L5.65376 12.4563Z"
              fill={user.color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          
          {/* User label */}
          <div
            className="cursor-label text-xs font-medium shadow-soft"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </>
  );
};
