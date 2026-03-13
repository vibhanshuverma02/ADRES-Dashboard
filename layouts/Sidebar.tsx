// "use client";
// import React, { Fragment, useEffect, useState } from "react";
// import { Accordion, ListGroup } from "react-bootstrap";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { MenuItemType } from "types/menuTypes";
// import CustomToggle from "./SidebarMenuToggle";

// // Menus
// import { DashboardMenu } from "routes/DashboardRoute";
// import { ResearcherMenu } from "routes/ResearcherRoute";
// import { CoEManagerMenu } from "routes/coeRoter";

// // utils + context
// import useMenu from "hooks/useMenu";
// import { getAssetPath } from "helper/assetPath";
// import { useAuth } from "context/Authcontext";

// interface SidebarProps {
//   hideLogo?: boolean;
//   containerId?: string;
// }

// const Sidebar: React.FC<SidebarProps> = ({ hideLogo = false, containerId }) => {
//   const location = usePathname();
//   const { showMenu } = useMenu();
//   const { activeRole, switchRole } = useAuth();

//   // ✅ Decide menu based on activeRole
//   let menuConfig: MenuItemType[] = [];
//   switch (activeRole?.toUpperCase()) {
//     case "SUPER_ADMIN":
//       menuConfig = DashboardMenu;
//       break;
//     case "RESEARCHER":
//       menuConfig = ResearcherMenu;
//       break;
//     case "COE_MANAGER":
//       menuConfig = CoEManagerMenu;
//       break;
//     default:
//       menuConfig = []; // no menu if role not matched
//   }

//   const [activeKeys, setActiveKeys] = useState<Record<number, string | null>>({});

//   useEffect(() => {
//     if (!showMenu) setActiveKeys({});
//   }, [showMenu]);

//   const handleToggle = (eventKey: string, depth: number) => {
//     setActiveKeys((prev) => ({
//       ...prev,
//       [depth]: prev[depth] === eventKey ? null : eventKey,
//     }));
//   };

//   const generateLink = (item: MenuItemType, depth: number, key: string, extraClass = "") => (
//     <Link
//       href={showMenu && item.link ? `${item.link}` : "#"}
//       className={`nav-link depth-${depth} ${extraClass} ${
//         location === `/${item.link}` ? "active" : ""
//       } ${!showMenu ? "disabled" : ""} ${
//         activeKeys[depth] === key ? "isOpenBranch" : ""
//       }`}
//       onClick={(e) => {
//         if (!showMenu) e.preventDefault();
//       }}
//       style={{ paddingLeft: `${depth * 1.5}rem` }}
//     >
//       {item.icon && <span className="nav-icon">{item.icon}</span>}
//       <span className="text">{item.title ?? item.name}</span>
//     </Link>
//   );

//   const renderMenu = (items: MenuItemType[], depth: number = 1) => (
//     <Accordion alwaysOpen={false} activeKey={activeKeys[depth]}>
//       {items.map((menu, index) => {
//         const key = `${depth}-${index}`;
//         const hasChildren = !!menu.children?.length;

//         return (
//           <Fragment key={key}>
//             {showMenu && hasChildren ? (
//               <>
//                 <CustomToggle
//                   eventKey={key}
//                   icon={menu.icon}
//                   disabled={!showMenu}
//                   depth={depth}
//                   callback={() => handleToggle(key, depth)}
//                   className={`depth-${depth} ${
//                     activeKeys[depth] === key ? "isOpenBranch" : ""
//                   }`}
//                 >
//                   {menu.title ?? menu.name}
//                 </CustomToggle>

//                 <Accordion.Collapse eventKey={key}>
//                   <ListGroup as="ul" className="nav flex-column p-0 m-0">
//                     {renderMenu(menu.children!, depth + 1)}
//                   </ListGroup>
//                 </Accordion.Collapse>
//               </>
//             ) : (
//               <ListGroup.Item
//                 as="li"
//                 bsPrefix="nav-item"
//                 className={`p-0 m-0 depth-${depth} ${
//                   activeKeys[depth] === key ? "isOpenBranch" : ""
//                 }`}
//               >
//                 {showMenu ? (
//                   generateLink(menu, depth, key)
//                 ) : (
//                   <span className="icon-only">{menu.icon}</span>
//                 )}
//               </ListGroup.Item>
//             )}
//           </Fragment>
//         );
//       })}
//     </Accordion>
//   );

//   return (
//     <div id={containerId} className="sidebar">
//       {!hideLogo && (
//         <div className="brand-logo">
//           <Link href="/" className="d-none d-md-flex align-items-center gap-2">
//             <img src={getAssetPath("/images/brand/logo/logo-icon.svg")} alt="logo" />
//             {showMenu && (
//               <span className="fw-bold fs-4 site-logo-text">ADRES Dasher</span>
//             )}
//           </Link>
//         </div>
//       )}

//       <div className="sidebar-scroll flex-grow-1">
//         {renderMenu(menuConfig, 1)}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Accordion, ListGroup } from "react-bootstrap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuItemType } from "types/menuTypes";
import CustomToggle from "./SidebarMenuToggle";

// Menus
import { DashboardMenu } from "routes/sidebars/DashboardRoute";
import { ResearcherMenu } from "routes/sidebars/ResearcherRoute";
import { CoEManagerMenu } from "routes/sidebars/coeRoter";

// utils + context
import useMenu from "hooks/useMenu";
import { getAssetPath } from "helper/assetPath";
import { useAuth } from "context/Authcontext";

interface SidebarProps {
  hideLogo?: boolean;
  containerId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ hideLogo = false, containerId }) => {
  const location = usePathname();
  const { showMenu } = useMenu();
  const { activeRole, switchRole, user } = useAuth();

  // ✅ Decide menu based on activeRole
  let menuConfig: MenuItemType[] = [];
  switch (activeRole?.toUpperCase()) {
    case "SUPER_ADMIN":
      menuConfig = DashboardMenu;
      break;
    case "RESEARCHER":
      menuConfig = ResearcherMenu;
      break;
    case "COE_MANAGER":
      menuConfig = CoEManagerMenu;
      break;
    default:
      menuConfig = [];
  }

  const [activeKeys, setActiveKeys] = useState<Record<number, string | null>>({});

  useEffect(() => {
    if (!showMenu) setActiveKeys({});
  }, [showMenu]);

  const handleToggle = (eventKey: string, depth: number) => {
    setActiveKeys((prev) => ({
      ...prev,
      [depth]: prev[depth] === eventKey ? null : eventKey,
    }));
  };

  const generateLink = (
    item: MenuItemType,
    depth: number,
    key: string,
    extraClass = ""
  ) => (
    <Link
      href={showMenu && item.link ? `${item.link}` : "#"}
      className={`nav-link depth-${depth} ${extraClass} ${
        location === `/${item.link}` ? "active" : ""
      } ${!showMenu ? "disabled" : ""} ${
        activeKeys[depth] === key ? "isOpenBranch" : ""
      }`}
      onClick={(e) => {
        if (!showMenu) e.preventDefault();
      }}
      style={{ paddingLeft: `${depth * 1.5}rem` }}
    >
      {item.icon && <span className="nav-icon">{item.icon}</span>}
      <span className="text">{item.title ?? item.name}</span>
    </Link>
  );

  const renderMenu = (items: MenuItemType[], depth: number = 1) => (
    <Accordion alwaysOpen={false} activeKey={activeKeys[depth]}>
      {items.map((menu, index) => {
        const key = `${depth}-${index}`;
        const hasChildren = !!menu.children?.length;

        return (
          <Fragment key={key}>
            {showMenu && hasChildren ? (
              <>
                <CustomToggle
                  eventKey={key}
                  icon={menu.icon}
                  disabled={!showMenu}
                  depth={depth}
                  callback={() => handleToggle(key, depth)}
                  className={`depth-${depth} ${
                    activeKeys[depth] === key ? "isOpenBranch" : ""
                  }`}
                >
                  {menu.title ?? menu.name}
                </CustomToggle>

                <Accordion.Collapse eventKey={key}>
                  <ListGroup as="ul" className="nav flex-column p-0 m-0">
                    {renderMenu(menu.children!, depth + 1)}
                  </ListGroup>
                </Accordion.Collapse>
              </>
            ) : (
              <ListGroup.Item
                as="li"
                bsPrefix="nav-item"
                className={`p-0 m-0 depth-${depth} ${
                  activeKeys[depth] === key ? "isOpenBranch" : ""
                }`}
              >
                {showMenu ? (
                  generateLink(menu, depth, key)
                ) : (
                  <span className="icon-only">{menu.icon}</span>
                )}
              </ListGroup.Item>
            )}
          </Fragment>
        );
      })}
    </Accordion>
  );

  return (
    <div id={containerId} className="sidebar">
      {!hideLogo && (
        <div className="brand-logo">
          <Link href="/" className="d-none d-md-flex align-items-center gap-2">
            <img
              src={getAssetPath("/images/brand/logo/transparent-Photoroom(2).png")}
              alt="logo"
            />
            {showMenu && (
              <span className="fw-bold fs-4 site-logo-text">ADRES Dasher</span>
            )}
          </Link>
        </div>
      )}

      <div className="sidebar-scroll flex-grow-1">
        {renderMenu(menuConfig, 1)}

        {/* ✅ Role Switcher Section */}
        {showMenu && user?.roles?.length > 1 && (
          <div className="p-3 mt-3 border-top">
            <h6 className="text-muted mb-2">Switch Role</h6>
            {user.roles.map((role: string) => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`btn w-100 mb-2 ${
                  activeRole === role ? "btn-primary" : "btn-outline-primary"
                }`}
              >
                {role.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
