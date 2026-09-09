export type LocalKnowledgeTag = {
  code: string;
  name: string;
};

export type LocalKnowledgeItem = {
  id: string;
  country_code: string;
  title: string | null;
  content: string;
  explanation: string | null;
  image_link: string | null;
  source_url: string | null;
  type: { code: string; name: string } | null;
  language: { code: string; name: string; native_name: string | null } | null;
  geographic_area: { code: string; name: string } | null;
  tags: LocalKnowledgeTag[];
};
