import DailySwipeCard from '../DailySwipeCard';

export default function DailySwipeCardExample() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="p-6">
      <DailySwipeCard 
        date={today}
        onSwipe={(worked) => console.log('Workout logged:', worked ? 'worked out' : 'missed')}
      />
    </div>
  );
}
