import BuddyCard from '../BuddyCard';

export default function BuddyCardExample() {
  return (
    <div className="p-6 space-y-3 max-w-4xl">
      <BuddyCard
        buddyName="Sarah Johnson"
        buddyEmail="sarah.j@example.com"
        potBalance={240}
        weeklyStatus="both-on-track"
        onClick={() => console.log('Clicked Sarah')}
      />
      <BuddyCard
        buddyName="Mike Chen"
        buddyEmail="mike.chen@example.com"
        potBalance={180}
        weeklyStatus="you-behind"
        onClick={() => console.log('Clicked Mike')}
      />
      <BuddyCard
        buddyName="Alex Kumar"
        buddyEmail="alex.k@example.com"
        potBalance={60}
        weeklyStatus="they-behind"
        onClick={() => console.log('Clicked Alex')}
      />
    </div>
  );
}
