import BuddyCard from "@/components/BuddyCard";
import AddBuddyDialog from "@/components/AddBuddyDialog";
import StatsCard from "@/components/StatsCard";
import { Coins } from "lucide-react";

export default function BuddiesPage() {
  const buddies = [
    { name: "Sarah Johnson", email: "sarah.j@example.com", pot: 240, status: 'both-on-track' as const },
    { name: "Mike Chen", email: "mike.chen@example.com", pot: 180, status: 'you-behind' as const },
    { name: "Alex Kumar", email: "alex.k@example.com", pot: 60, status: 'they-behind' as const },
    { name: "Emma Davis", email: "emma.d@example.com", pot: 120, status: 'both-on-track' as const },
    { name: "Ryan Taylor", email: "ryan.t@example.com", pot: 80, status: 'both-behind' as const },
  ];

  const totalPots = buddies.reduce((sum, buddy) => sum + buddy.pot, 0);

  const handleAddBuddy = (email: string, name: string) => {
    console.log('Adding new buddy:', { name, email });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Gym Buddies
          </h1>
          <AddBuddyDialog onAddBuddy={handleAddBuddy} />
        </div>

        <StatsCard
          label="Total Active Pots"
          value={`₹${totalPots}`}
          icon={<Coins className="w-6 h-6" />}
        />

        <div className="space-y-3">
          {buddies.map((buddy) => (
            <BuddyCard
              key={buddy.email}
              buddyName={buddy.name}
              buddyEmail={buddy.email}
              potBalance={buddy.pot}
              weeklyStatus={buddy.status}
              onClick={() => console.log('Clicked:', buddy.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
