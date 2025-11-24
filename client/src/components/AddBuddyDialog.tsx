import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface AddBuddyDialogProps {
  onAddBuddy?: (email: string, name: string) => void;
}

export default function AddBuddyDialog({ onAddBuddy }: AddBuddyDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      onAddBuddy?.(email, name);
      setEmail("");
      setName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-xl hover-elevate active-elevate-2" data-testid="button-add-buddy">
          <UserPlus className="w-5 h-5 mr-2" />
          Add Buddy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Add Gym Buddy</DialogTitle>
            <DialogDescription>
              Enter your buddy's email to create a shared honey pot and start competing!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="buddy-name">Name</Label>
              <Input
                id="buddy-name"
                placeholder="Enter their name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-buddy-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buddy-email">Email</Label>
              <Input
                id="buddy-email"
                type="email"
                placeholder="buddy@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-buddy-email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit">
              Add Buddy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
