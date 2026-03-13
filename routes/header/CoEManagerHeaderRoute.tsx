import { v4 as uuid } from "uuid";
import {
  IconHome2,
  IconInbox,
  IconMessage,
  IconActivity,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

export const CoEManagerHeaderMenu = [
  {
    id: uuid(),
    link: "/coe/dashboard",
    title: "Home",
    icon: <IconHome2 size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/coe/inbox",
    title: "Inbox",
    icon: <IconInbox size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/coe/chat",
    title: "Chat",
    icon: <IconMessage size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/coe/activity",
    title: "Activity",
    icon: <IconActivity size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/coe/teams",
    title: "Manage Teams",
    icon: <IconUsers size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    link: "/coe/settings",
    title: "Account Settings",
    icon: <IconSettings size={20} strokeWidth={1.5} />,
  },
];
