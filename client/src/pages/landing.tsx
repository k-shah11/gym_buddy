import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import poohMascot from "@assets/generated_images/neutral_curious_pooh_bear.png";
import honeyPot from "@assets/generated_images/honey_pot_icon.png";
import { Users, Target, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-20">
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="flex justify-center">
            <img src={poohMascot} alt="Gym Buddy Pooh" className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold text-foreground">
            gymmy-buddy
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Stay motivated with friends! Track daily workouts, compete with buddies, 
            and win the honey pot when they skip gym days.
          </p>
          
          <div className="pt-2 sm:pt-4">
            <Button 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-2xl hover-elevate active-elevate-2"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-16">
          <Card className="rounded-2xl p-4 sm:p-6 border-card-border text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-bold mb-1.5 sm:mb-2">Team Up</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with gym buddies and hold each other accountable
            </p>
          </Card>

          <Card className="rounded-2xl p-4 sm:p-6 border-card-border text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-bold mb-1.5 sm:mb-2">Track Daily</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Log your workouts every day with a simple swipe
            </p>
          </Card>

          <Card className="rounded-2xl p-4 sm:p-6 border-card-border text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full">
                <img src={honeyPot} alt="Honey pot" className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-bold mb-1.5 sm:mb-2">Win the Pot</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Hit 4+ workouts per week or pay ₹20 per missed day
            </p>
          </Card>
        </div>

        {/* How it Works */}
        <div className="mt-12 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-6 sm:mb-10">How It Works</h2>
          
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <Card className="rounded-2xl p-4 sm:p-6 border-card-border">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1">Add Your Gym Buddies</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Create a shared honey pot with each friend. Every pot starts at ₹0.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-4 sm:p-6 border-card-border">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1">Log Daily Workouts</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Each day, swipe to mark if you worked out or missed. If you miss, ₹20 is added to ALL your buddy pots.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-4 sm:p-6 border-card-border">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-1">Weekly Settlements</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Need 4+ workouts per week to stay safe. If exactly one person fails, they pay the entire pot to their buddy!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-20 text-center pb-8">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4">Ready to Start?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
            Join now and make fitness a team sport!
          </p>
          <Button 
            size="lg" 
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-2xl hover-elevate active-elevate-2"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-signup"
          >
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
}
