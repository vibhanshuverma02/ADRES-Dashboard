//import node module libraries
import { Fragment } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { Badge, Button, Image } from "react-bootstrap";
import Link from "next/link";
import { CoeListType } from "types/CoeType";

//import custom types
import { ProductListType } from "types/EcommerceType";

//import custom components
import DasherTippy from "components/common/DasherTippy";
import Checkbox from "components/table/Checkbox";

export const productListColumns: ColumnDef<ProductListType>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return (
        <Checkbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      );
    },
    cell: ({ row }) => (
      <div>
        <Checkbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      return (
        <div className="d-flex align-items-center">
          <Image
            src={row.original.imageSrc}
            alt=""
            className="rounded-3"
            width="56"
          />
          <div className="ms-3 d-flex flex-column">
            <Link href="#!" className="text-inherit fw-semibold">
              Transparent Sunglasses
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "addedDate",
    header: "Added Date",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusText = row.original.status;
      return (
        <Badge
          bg={`${statusText === "Active" ? "success-subtle" : "danger-subtle"}`}
          text={`${
            statusText === "Active" ? "success-emphasis" : "danger-emphasis"
          }`}
          pill={true}
        >
          {statusText}
        </Badge>
      );
    },
  },
  {
    accessorKey: "",
    header: "Action",
    cell: () => {
      return (
        <Fragment>
          <DasherTippy content="View">
            <Button
              href=""
              variant="ghost btn-icon"
              size="sm"
              className="rounded-circle"
            >
              <IconEye size={16} />
              <div id="eyeThree" className="d-none">
                <span>View</span>
              </div>
            </Button>
          </DasherTippy>
          <DasherTippy content="Edit">
            <Button
              href=""
              variant="ghost btn-icon"
              size="sm"
              className="rounded-circle"
            >
              <IconEdit size={16} />
              <div id="editTwo" className="d-none">
                <span>Edit</span>
              </div>
            </Button>
          </DasherTippy>
          <DasherTippy content="Delete">
            <Button
              href=""
              variant="ghost btn-icon"
              size="sm"
              className="rounded-circle"
            >
              <IconTrash size={16} />
              <div id="trashThree" className="d-none">
                <span>Delete</span>
              </div>
            </Button>
          </DasherTippy>
        </Fragment>
      );
    },
  },
];

export const coeListColumns: ColumnDef<CoeListType>[] = [
   {
  accessorKey: "logo",
  header: "Logo",
  cell: ({ row }) => {
    const logoUrl = row.original.logo;

    if (!logoUrl) return <span className="text-muted">—</span>;

    // Insert transformation after "upload/"
    const transformedUrl = logoUrl.replace(
      "/upload/",
      "/upload/w_40,h_40,c_fill,r_max/"
    );

    return (
      <Image
        src={transformedUrl}
        alt={row.original.name}
        width={40}
        height={40}
        className="rounded-circle object-cover"
      />
    );
  },
},
  {
    header: "Name",
    accessorKey: "name",
    cell: (info) => <strong>{info.getValue() as string}</strong>,
  },

  {
    header: "State",
    accessorKey: "state",
  },
  {
    header: "Category",
    accessorFn: (row) => row.subType?.name || "—",
  },
  {
    header: "About",
    accessorKey: "about",
    cell: (info) => (
      <span className="text-truncate d-inline-block" style={{ maxWidth: 150 }}>
        {info.getValue() as string}
      </span>
    ),
  },
 

  {
  accessorKey: "isActive",
  header: "Status",
  cell: ({ row }) => {
    const isActive = row.original.isActive;
    const statusText = isActive ? "Active" : "Inactive";

    return (
      <Badge
        bg={isActive ? "success-subtle" : "danger-subtle"}
        text={isActive ? "success-emphasis" : "danger-emphasis"}
        pill
      >
        {statusText}
      </Badge>
    );
  },
},

  {
    header: "CoE - PI",
    accessorFn: (row) => row.coeProfile?.managerName || "—",
  },
];