export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactTag {
  contactId: string;
  tagId: string;
  createdAt: Date;
}
