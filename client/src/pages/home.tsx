import DailySwipeCard from "@/components/DailySwipeCard";
import StatsCard from "@/components/StatsCard";
import { Users, Coins } from "lucide-react";

export default function HomePage() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleSwipe = (worked: boolean) => {
    console.log('Workout logged:', worked ? 'worked out' : 'missed');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <DailySwipeCard 
          date={today}
          onSwipe={handleSwipe}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            label="Gym Buddies"
            value={5}
            icon={<Users className="w-6 h-6" />}
          />
          <StatsCard
            label="Total in Pots"
            value="₹680"
            icon={<Coins className="w-6 h-6" />}
          />
        </div>
      </div>
    </div>
  );
}
