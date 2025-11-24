import WeekGrid from '../WeekGrid';

export default function WeekGridExample() {
  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <WeekGrid
        weekLabel="This Week"
        days={['worked', 'worked', 'missed', 'worked', 'worked', null, null]}
        workoutCount={4}
      />
      <WeekGrid
        weekLabel="Last Week"
        days={['worked', 'missed', 'worked', 'worked', 'worked', 'worked', 'missed']}
        workoutCount={5}
      />
      <WeekGrid
        weekLabel="2 Weeks Ago"
        days={['worked', 'worked', 'missed', 'missed', 'worked', 'missed', 'missed']}
        workoutCount={3}
      />
    </div>
  );
}
