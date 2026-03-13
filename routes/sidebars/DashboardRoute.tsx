import { v4 as uuid } from "uuid";
import {
  IconFiles,
  IconShoppingBag,
  IconNews,
  IconFile,
  IconLock,
  IconAnalyzeFilled,
  IconCalendarEvent,
  IconHierarchy,
} from "@tabler/icons-react";
import { MenuItemType } from "types/menuTypes";

export const DashboardMenu: MenuItemType[] = [
  {
    id: uuid(),
    title: "Dashboard",
    link: "/superadmin/Dashboard",
    icon: <IconAnalyzeFilled size={20} strokeWidth={1.5} />,
  },
  {
    id: uuid(),
    title: "CoEs Management",
    link: "/",
    icon: <IconFiles size={20} strokeWidth={1.5} />,
    children: [
      {
        id: uuid(),
        title: "Resource Hub",
          link: "/superadmin/RESOURCEHUB",
        // children: [
        //   {
        //     id: uuid(),
        //     title: "Published_Resources",
        //     children: [
        //       { id: uuid(), name: "White_Papers", link: "archive-2023" },
        //       { id: uuid(), name: "Researches",   link: "archive-2022" },
        //       { id: uuid(), name: "Books",         link: "archive-2022" },
        //     ],
        //   },
        //   {
        //     id: uuid(),
        //     title: "Reviewed-Archive",
        //     children: [
        //       { id: uuid(), name: "Approved", link: "archive-2023" },
        //       { id: uuid(), name: "Rejected", link: "archive-2022" },
        //     ],
        //   },
        //   { id: uuid(), name: "New_Request", link: "annual-reports" },
        // ],
      },
      {
        id: uuid(),
        title: "Active Network",
        children: [
          { id: uuid(), name: "COE's",              link: "CoEs" },
          // { id: uuid(), name: "Researches",         link: "archive-2022" },
          { id: uuid(), name: "Onboarding Invites", link: "Invite_CoE" },
        ],
      },
      { id: uuid(), name: "Event Desk", link: "/superadmin/EventsGallery" },
    ],
  },
  // ✅ NEW — Events & Gallery top-level entry
  {
    id: uuid(),
    title: "Events & Gallery",
    icon: <IconCalendarEvent size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "Pending Requests",  link: "/superadmin/EventsGallery?section=pending" },
      { id: uuid(), name: "Upcoming (Major)",  link: "/superadmin/EventsGallery?section=major" },
      { id: uuid(), name: "Upcoming (Minor)",  link: "/superadmin/EventsGallery?section=minor" },
      { id: uuid(), name: "Past Events",       link: "/superadmin/EventsGallery?section=past" },
      { id: uuid(), name: "Gallery",           link: "/superadmin/EventsGallery?section=gallery" },
    ],
  },
  // ✅ Thematic Clusters
  {
    id: uuid(),
    title: "Thematic Clusters",
    icon: <IconHierarchy size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "All Clusters",    link: "/superadmin/Clusters" },
      { id: uuid(), name: "Create Cluster",  link: "/superadmin/Clusters?action=create" },
      { id: uuid(), name: "Assign Orgs",     link: "/superadmin/Clusters?action=assign" },
    ],
  },
  {
    id: uuid(),
    title: "Stakeholder Forums",
    link: "/",
    icon: <IconShoppingBag size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "Access Control",    link: "maintenance" },
      { id: uuid(), name: "Community Desk",    link: "not-found" },
      { id: uuid(), name: "Feedback Monitor",  link: "not-found" },
      { id: uuid(), name: "Agency Connect",    link: "not-found" },
    ],
  },
  {
    id: uuid(),
    title: "NoticeBoard",
    icon: <IconNews size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "All Notices",    link: "/superadmin/NoticeBoard?type=all" },
      { id: uuid(), name: "Events",         link: "/superadmin/NoticeBoard?type=event" },
      { id: uuid(), name: "Newsletters",    link: "/superadmin/NoticeBoard?type=newsletter" },
      { id: uuid(), name: "Alerts",         link: "/superadmin/NoticeBoard?type=alert" },
      { id: uuid(), name: "Notifications",  link: "/superadmin/NoticeBoard?type=notification" },
    ],
  },
  {
    id: uuid(),
    title: "DST x ICARS",
    link: "/sign-in",
    icon: <IconLock size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "ICARS-Report", link: "maintenance" },
      {
        id: uuid(),
        title: "Reports Vault",
        children: [
          { id: uuid(), name: "Monthly Reports", link: "monthly-reports" },
          { id: uuid(), name: "Annual Reports",  link: "annual-reports" },
          {
            id: uuid(),
            title: "Archive",
            children: [
              { id: uuid(), name: "2023 Reports", link: "archive-2023" },
              { id: uuid(), name: "2022 Reports", link: "archive-2022" },
            ],
          },
        ],
      },
    ],
  },
  { id: uuid(), title: "Site Management", grouptitle: true },
  {
    id: uuid(),
    title: "Pages",
    icon: <IconFile size={20} strokeWidth={1.5} />,
    children: [
      { id: uuid(), name: "About Section",     link: "maintenance" },
      { id: uuid(), name: "System Blueprint",  link: "not-found" },
      { id: uuid(), name: "Knowledge Center",  link: "not-found" },
      { id: uuid(), name: "Support Desk",      link: "not-found" },
    ],
  },
];