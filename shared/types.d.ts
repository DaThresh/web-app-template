export type Nullable<Type> = Type | null;

export type ParanoidData = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Nullable<Date>;
};
