import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import honeyPot from "@assets/generated_images/honey_pot_icon.png";

interface BuddyCardProps {
  buddyName: string;
  buddyEmail: string;
  potBalance: number;
  userWeeklyCount: number;
  buddyWeeklyCount: number;
  avatarUrl?: string;
  connectedAt?: string;
  onClick?: () => void;
}

export default function BuddyCard({ 
  buddyName, 
  buddyEmail, 
  potBalance, 
  userWeeklyCount,
  buddyWeeklyCount,
  avatarUrl,
  connectedAt,
  onClick 
}: BuddyCardProps) {
  const getStatusBadge = () => {
    if (userWeeklyCount > buddyWeeklyCount) {
      return { text: "You're ahead", variant: 'default' as const };
    } else if (userWeeklyCount < buddyWeeklyCount) {
      return { text: "You're behind", variant: 'destructive' as const };
    } else {
      return { text: 'Tied', variant: 'secondary' as const };
    }
  };

  const status = getStatusBadge();
  const initials = buddyName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card 
      className="rounded-2xl p-4 sm:p-5 border-card-border hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-buddy-${buddyName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Mobile: stacked layout, Desktop: horizontal layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Top section: Avatar and info */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-card-border flex-shrink-0" data-testid="avatar-buddy">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={buddyName} />}
            <AvatarFallback className="font-semibold text-sm sm:text-base">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate" data-testid="text-buddy-name">
              {buddyName}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate" data-testid="text-buddy-email">
              {buddyEmail}
            </p>
            {connectedAt && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1" data-testid="text-connected-date">
                Connected {formatDate(connectedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Bottom section on mobile / Right section on desktop: Pot and badge */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0 pl-13 sm:pl-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img src={honeyPot} alt="Honey pot" className="w-6 h-6 sm:w-8 sm:h-8" data-testid="img-honey-pot" />
            <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground" data-testid="text-pot-balance">
              ₹{potBalance}
            </span>
          </div>

          <Badge variant={status.variant} className="whitespace-nowrap text-xs" data-testid="badge-status">
            {status.text}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
