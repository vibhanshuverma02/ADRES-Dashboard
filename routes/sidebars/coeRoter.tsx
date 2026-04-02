import { v4 as uuid } from "uuid";
import {
  IconBuilding,
  IconUsers,
  IconClipboard,
  IconLibrary,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { MenuItemType } from "types/menuTypes";

export const CoEManagerMenu: MenuItemType[] = [
  {
    id: uuid(),
    title: "CoE Manager Dashboard",
    link: "/coemanager/Dashboard",
    icon: <IconBuilding size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "Our Team",
    icon: <IconUsers size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "Active Members",   link: "/coemanager/Dashboard/OurTeam?section=active" },
      // { id: uuid(), name: "Inactive Members", link: "/coemanager/Dashboard/OurTeam?section=inactive" },
      { id: uuid(), name: "Onboard +",        link: "/coemanager/Dashboard/OurTeam?section=onboardUser" },
    ],
  },
  {
    id: uuid(),
    title: "Manage Resource Hub",
    icon: <IconLibrary size={20} strokeWidth={2.5} />,
    link: "/coemanager/Dashboard/Resource?section=Pending" ,
  },
  // {
  //   id: uuid(),
  //   title: "Reports",
  //   icon: <IconClipboard size={20} strokeWidth={1.5} />,
  //   children: [
  //     { id: uuid(), name: "Monthly", link: "monthly" },
  //     { id: uuid(), name: "Annual",  link: "annual" },
  //   ],
  // },
  {
    id: uuid(),
    title: "Working Areas",
    link: "/coemanager/Dashboard/setup-areas",
    icon: <IconLibrary size={20} strokeWidth={2.5} />,
    // children: [
    //   { id: uuid(), name: "New Request", link: "/coemanager/Dashboard/Resource?section=Pending" },
    //   { id: uuid(), name: "Published",   link: "/coemanager/Dashboard/Resource?section=Published" },
    //   { id: uuid(), name: "Processed",   link: "/coemanager/Dashboard/Resource?section=Processed" },
    //   { id: uuid(), name: "Rejected",    link: "/coemanager/Dashboard/Resource?section=Rejected" },
    // ],
  },
  // ✅ NEW — Events & Gallery
  {
    id: uuid(),
    title: "Events & Gallery",
    icon: <IconCalendarEvent size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "Upcoming Events",  link: "/coemanager/Dashboard/EventsGallery?section=upcoming" },
      { id: uuid(), name: "Request Event",    link: "/coemanager/Dashboard/EventsGallery?section=request" },
      { id: uuid(), name: "Past Events",      link: "/coemanager/Dashboard/EventsGallery?section=past" },
      { id: uuid(), name: "Gallery",          link: "/coemanager/Dashboard/EventsGallery?section=gallery" },
    ],
  },
];