import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import blobWorkedVideo from "@assets/generated_videos/happy_blob_doing_bicep_curls.mp4";
import blobMissedVideo from "@assets/generated_videos/same_blob_crying_with_tears.mp4";
import blobNeutral from "@assets/generated_images/blob_mascot_cream_background.png";
import { useState } from "react";
import { Check, X } from "lucide-react";

interface DailySwipeCardProps {
  date: string;
  onSwipe?: (worked: boolean) => void;
  initialStatus?: 'worked' | 'missed' | null;
}

export default function DailySwipeCard({ date, onSwipe, initialStatus = null }: DailySwipeCardProps) {
  const [status, setStatus] = useState<'worked' | 'missed' | null>(initialStatus);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSwipe = (worked: boolean) => {
    setIsAnimating(true);
    setStatus(worked ? 'worked' : 'missed');
    onSwipe?.(worked);
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getBlobMedia = () => {
    if (status === 'worked') return { type: 'video' as const, src: blobWorkedVideo };
    if (status === 'missed') return { type: 'video' as const, src: blobMissedVideo };
    return { type: 'image' as const, src: blobNeutral };
  };

  const getMessage = () => {
    if (status === 'worked') return "Amazing work! 💪";
    if (status === 'missed') return "That's okay, tomorrow is a new day!";
    return "Did you work out today?";
  };

  return (
    <Card className="rounded-3xl p-8 md:p-12 max-w-2xl mx-auto border-card-border" data-testid="card-daily-swipe">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <p className="text-sm tracking-wide uppercase text-muted-foreground mb-2" data-testid="text-date">
            {date}
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground" data-testid="text-question">
            {getMessage()}
          </h2>
        </div>

        <div className={`relative transition-transform duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          {getBlobMedia().type === 'video' ? (
            <video 
              src={getBlobMedia().src}
              autoPlay
              loop
              muted
              playsInline
              className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-primary/20 object-cover"
              data-testid="video-avatar"
            />
          ) : (
            <img 
              src={getBlobMedia().src}
              alt="Blob mascot" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-primary/20 object-cover"
              data-testid="img-avatar"
            />
          )}
        </div>

        {!status && (
          <div className="w-full flex gap-3 pt-4">
            <Button
              onClick={() => handleSwipe(false)}
              variant="outline"
              size="lg"
              className="flex-1 h-20 text-lg font-semibold rounded-2xl border-2 hover-elevate active-elevate-2"
              data-testid="button-missed"
            >
              <X className="w-6 h-6 mr-2" />
              Didn't Work Out
            </Button>
            <Button
              onClick={() => handleSwipe(true)}
              variant="default"
              size="lg"
              className="flex-1 h-20 text-lg font-semibold rounded-2xl hover-elevate active-elevate-2"
              data-testid="button-worked"
            >
              <Check className="w-6 h-6 mr-2" />
              Worked Out!
            </Button>
          </div>
        )}

        {status && (
          <Button
            onClick={() => setStatus(null)}
            variant="ghost"
            size="sm"
            className="mt-2"
            data-testid="button-change"
          >
            Change my answer
          </Button>
        )}
      </div>
    </Card>
  );
}
