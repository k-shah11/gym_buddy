import StatsCard from '../StatsCard';
import { Users, Coins } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-6 grid grid-cols-2 gap-4 max-w-2xl">
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
  );
}
