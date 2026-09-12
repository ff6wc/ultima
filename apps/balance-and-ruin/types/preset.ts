export type FlagPreset = {
  arguments: string;
  creator: string;
  creator_name: string;
  creator_id: number | string;
  preset_name?: string;
  preset_name_lower?: string;
  description: string;
  /** flags */
  flags: string;
  hidden: boolean;
  /** label */
  name: string;
  official: boolean;
  /** ISO date string from the API */
  created_at?: string;
  last_downloaded?: string;
  id?: string;
  tags?: string[];
  owner_id?: string;
  is_official?: boolean;
  downloads?: number;
  download_count?: number;
};
