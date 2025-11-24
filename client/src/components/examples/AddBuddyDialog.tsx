import AddBuddyDialog from '../AddBuddyDialog';

export default function AddBuddyDialogExample() {
  return (
    <div className="p-6 flex justify-center">
      <AddBuddyDialog 
        onAddBuddy={(email, name) => console.log('Adding buddy:', { name, email })}
      />
    </div>
  );
}
