import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import blobNeutral from "@assets/generated_images/neutral_calm_bear_avatar.png";
import blobHappy from "@assets/generated_images/happy_celebrating_bear_avatar.png";
import blobSad from "@assets/generated_images/sad_crying_bear_avatar.png";
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

  const getBlobImage = () => {
    if (status === 'worked') return blobHappy;
    if (status === 'missed') return blobSad;
    return blobNeutral;
  };

  const getAnimationClass = () => {
    if (status === 'worked') return 'animate-bounce';
    if (status === 'missed') return 'animate-pulse';
    return '';
  };

  const getMessage = () => {
    if (status === 'worked') return "Amazing work! 💪";
    if (status === 'missed') return "That's okay, tomorrow is a new day!";
    return "Did you work out today?";
  };

  return (
    <Card className="rounded-3xl p-4 sm:p-8 md:p-12 max-w-2xl mx-auto border-card-border" data-testid="card-daily-swipe">
      <div className="flex flex-col items-center space-y-4 sm:space-y-6">
        <div className="text-center">
          <p className="text-xs sm:text-sm tracking-wide uppercase text-muted-foreground mb-2" data-testid="text-date">
            {date}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground" data-testid="text-question">
            {getMessage()}
          </h2>
        </div>

        <div className={`relative transition-transform duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          <img 
            src={getBlobImage()}
            alt="Blob mascot" 
            className={`w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full ring-4 ring-primary/20 object-cover ${getAnimationClass()}`}
            data-testid="img-avatar"
          />
        </div>

        {!status && (
          <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              onClick={() => handleSwipe(false)}
              variant="outline"
              size="lg"
              className="flex-1 h-14 sm:h-20 text-sm sm:text-lg font-semibold rounded-2xl border-2 hover-elevate active-elevate-2"
              data-testid="button-missed"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Didn't Work Out
            </Button>
            <Button
              onClick={() => handleSwipe(true)}
              variant="default"
              size="lg"
              className="flex-1 h-14 sm:h-20 text-sm sm:text-lg font-semibold rounded-2xl hover-elevate active-elevate-2"
              data-testid="button-worked"
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
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
