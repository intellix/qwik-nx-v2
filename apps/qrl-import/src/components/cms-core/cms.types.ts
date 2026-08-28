export interface CmsStory {
  title: string;
  body: CmsComponent[];
}

export interface CmsComponent {
  id: number;
  component: string;
  data: Record<string, unknown>;
}
