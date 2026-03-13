import { v4 as uuid } from "uuid";
import { IconBook, IconUser, IconChartPie ,IconMessageCircleQuestion } from "@tabler/icons-react";
import { MenuItemType } from "types/menuTypes";

export const ResearcherMenu: MenuItemType[] = [
  {
    id: uuid(),
    title: "Researcher Dashboard",
    link: "/researcher/Dashboard",
    icon: <IconChartPie size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "My uploads",
    link: "/researcher/projects",
    icon: <IconBook size={20} strokeWidth={1.5} />,
    children: [
     { id: uuid(), name: "My Drafts", link: "/researcher/Dashboard/Myuploads?section=mydrafts" },
      { id: uuid(), name: "Under Review", link: "/researcher/Dashboard/Myuploads?section=underreview" },
      { id: uuid(), name: "Published", link: "/researcher/Dashboard/Myuploads?section=published" },
      { id: uuid(), name: "Rejected ", link:"/researcher/Dashboard/Myuploads?section=rejected"}
    ],
  },
  // {
  //   id: uuid(),
  //   title: "Feedbacks",
  //   link: "/researcher/profile",
  //   icon: <IconMessageCircleQuestion size={20} strokeWidth={1.5} />,
  //   children: [
  //     { id: uuid(), name: "Discussion Forum", link: "active" },
  //     { id: uuid(), name: "CoE", link: "completed" },
     
  //   ],
  // },
  // {
  //   id: uuid(),
  //   title: " My Profile",
  //   link: "/researcher/profile",
  //   icon: <IconUser size={20} strokeWidth={1.5} />,
  // },
];
