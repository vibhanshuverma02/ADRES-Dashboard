"use client";
//import node modules libraries
import {
  Row,
  Col,
  Card,
  CardHeader,
  FormControl,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "react-bootstrap";

//import custom components
import Flex from "components/common/Flex";
import TanstackTable from "components/table/TanstackTable";
import { useEffect, useState } from "react";
import { coeListColumns } from "./ColumnDifinitions";
import api from "helper/api";
import { CoeListType } from "types/CoeType";

const ProductListing = () => {
  const [data, setData] = useState<CoeListType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/coes")
      .then((res) => setData(res.data))
      .catch((err) => console.error("❌ Failed to fetch COEs", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Row>
      <Col>
        <Card className="card-lg" id="productList">
          {/* <CardHeader className="border-bottom-0">
            <Row className="g-4">
              <Col lg={4}>
                <FormControl
                  type="search"
                  className="listjs-search"
                  placeholder="Search"
                />
              </Col>
              <Col lg={8} className="d-flex justify-content-end">
                <Flex alignItems="center" breakpoint="lg" className="gap-2">
                  <div>
                    <Button variant="white">More Filter</Button>
                  </div>
                  <Dropdown>
                    <DropdownToggle variant="white">Category</DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem as="li" href="#">
                        Accessories
                      </DropdownItem>
                      <DropdownItem as="li" href="#">
                        Bags
                      </DropdownItem>
                      <DropdownItem as="li" href="#">
                        Men&apos;s Fashion
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Dropdown>
                    <DropdownToggle variant="white">Export</DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem as="li" href="#">
                        Download as CSV
                      </DropdownItem>
                      <DropdownItem as="li" href="#">
                        Print
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </Flex>
              </Col>
            </Row>
          </CardHeader> */}

          {/* COE List Table */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <Spinner animation="border" variant="primary" />
              <span className="ms-2">Loading COEs...</span>
            </div>
          ) : (
            <TanstackTable
              data={data}
              columns={coeListColumns}
              pagination={true}
              isSortable
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ProductListing;
