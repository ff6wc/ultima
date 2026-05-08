export interface EventData {
  id: string;
  title: string;
  status: "upcoming" | "active" | "completed";
  date: string;
  shortDescription: string;
  description: string;
  rules?: string[];
  signupLink?: string;
  discordLink?: string;
  image?: string;
}
