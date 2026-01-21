import React, { useState } from 'react';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RoomJoinDialogProps {
  onJoin: (roomId: string, userName: string) => void;
  defaultRoom?: string;
}

export const RoomJoinDialog: React.FC<RoomJoinDialogProps> = ({
  onJoin,
  defaultRoom = 'lobby',
}) => {
  const [roomId, setRoomId] = useState(defaultRoom);
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = userName.trim() || `Artist-${Math.random().toString(36).substring(2, 6)}`;
    onJoin(roomId || 'lobby', name);
  };

  const generateRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    setRoomId(randomId);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-glow">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Collaborative Canvas</h1>
          <p className="text-muted-foreground">
            Draw together in real-time with friends and colleagues
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-soft">
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="userName"
                type="text"
                placeholder="Enter your name (optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-input/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="roomId" className="text-sm font-medium">
                Room ID
              </label>
              <div className="flex gap-2">
                <Input
                  id="roomId"
                  type="text"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-input/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateRandomRoom}
                  className="flex-shrink-0"
                  title="Generate random room"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this room ID with others to draw together
              </p>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Users className="h-4 w-4 mr-2" />
              Join Room
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
          <p>✨ Real-time cursor sync • 🎨 Multiple colors • ↩️ Undo/Redo</p>
          <p className="mt-2">
            Tip: Open multiple tabs to test collaboration in demo mode
          </p>
        </div>
      </div>
    </div>
  );
};
