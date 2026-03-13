import { v4 as uuid } from "uuid";
import {
  IconHome2,
  IconInbox,
  IconMessage,
  IconActivity,
  IconSettings,
  IconBook,
} from "@tabler/icons-react";

export const ResearcherHeaderMenu = [
  {
    id: uuid(),
    link: "/researcher/Dashboard",
    title: "Home",
    icon: <IconHome2 size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/researcher/inbox",
    title: "Inbox",
    icon: <IconInbox size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/researcher/chat",
    title: "Chat",
    icon: <IconMessage size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/researcher/activity",
    title: "Activity",
    icon: <IconActivity size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/researcher/profile",
    title: "Profile",
    icon: <IconBook size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/researcher/settings",
    title: "Account Settings",
    icon: <IconSettings size={20} strokeWidth={1.5} />,
  },
];
