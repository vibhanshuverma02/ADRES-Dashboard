import { useContext, ReactNode, MouseEvent } from "react";
import { AccordionContext, useAccordionButton, Nav } from "react-bootstrap";

interface CustomToggleProps {
  children: ReactNode;
  eventKey: string;
  className?: string;
  icon?: ReactNode;
  callback?: (eventKey: string) => void;
  disabled?: boolean;
  depth?: number;
}

export default function CustomToggle({
  children,
  eventKey,
  className = "",
  icon,
  callback,
  disabled = false,
  depth = 1,
}: CustomToggleProps) {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(eventKey, () => {
    if (!disabled && callback) {
      callback(eventKey);
    }
  });

  const handleClick = (e: MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    decoratedOnClick(e);
  };

  const isCurrentEventKey = Array.isArray(activeEventKey)
    ? activeEventKey.includes(eventKey)
    : activeEventKey === eventKey;

  return (
    <Nav.Item as="li" className={`dropdown depth-${depth} ${className}`}>
      <Nav.Link
        href={disabled ? undefined : "#"}
        onClick={handleClick}
        aria-expanded={isCurrentEventKey} 
        aria-disabled={disabled}
        className={`d-flex align-items-center w-100 ${
          disabled ? "disabled" : "dropdown-toggle"
        }`}
        style={{
          paddingLeft: `${depth * 1.5}rem`,
          pointerEvents: disabled ? "none" : "auto",
          opacity: 1,
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <span className="d-flex align-items-center gap-2">
          {icon && <span className="nav-icon">{icon}</span>}
          {children && <span className="text">{children}</span>}
        </span>
      </Nav.Link>
    </Nav.Item>
  );
}
