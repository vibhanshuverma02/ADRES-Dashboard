export type CoeListType = {
  id: string;
  name: string;
  about?: string | null;
  state?: string ;
  isActive?: boolean;
  type: string;
  logo:string | null;
  subType?: { id: string; name: string } | null;
  coeProfile?:{id: string ; managerName:string}; // refine later if needed
};
