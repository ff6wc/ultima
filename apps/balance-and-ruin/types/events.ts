export interface EventData {
  id: string;
  title: string;
  status: "Upcoming" | "Current" | "Archived";
  date: string;
  shortDescription: string;
  description: string;
  rules?: string[];
  signupLink?: string;
  discordLink?: string;
  image?: string;
}
