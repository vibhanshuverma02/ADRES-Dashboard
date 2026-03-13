//import node module libraries
import { Fragment } from "react";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";

//import custom components
import DashboardStats from "components/dashboard/DashboardStats";
import ActiveProject from "components/dashboard/ActiveProject";
import TaskProgress from "components/dashboard/TaskProgress";
import TeamsTable from "components/dashboard/TeamsTable";
import AIBanner from "components/dashboard/AIBanner";
import ActivityLog from "components/dashboard/ActivityLog";
import ProjectBudget from "components/dashboard/ProjectBudget";
import TaskList from "components/dashboard/TaskList";
import UpcomingMeetingSlider from "components/dashboard/UpcomingMeetingSlider";
import { getAssetPath } from "helper/assetPath";

export const metadata: Metadata = {
  title: "Project Dashboard | Dasher - Responsive Bootstrap 5 Admin Dashboard",
  description: "Dasher - Responsive Bootstrap 5 Admin Dashboard",
};

// const HomePage = () => {
//   return (
//     <Fragment>
//       <Row className="g-6 mb-6">
      
//       </Row>
//       <Row className="g-6 mb-6">
//         <Col xl={8}>   
//           <TeamsTable />
//           <ActivityLog />
//           <TaskList />
//         </Col>
//         <Col xl={4}>
//           <TaskProgress />
//           <AIBanner />
//           <ProjectBudget />
//           <UpcomingMeetingSlider />
//         </Col>
//       </Row>
//     </Fragment>
//   );
// };

const HomePage = () => {
  return (
    <Fragment>
      <Row className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <img
                  src={getAssetPath("/images/brand/logo/transparent-Photoroo.png")}
                  alt="logo"
                  className="mb-3"
                  style={{ width: "620px", height: "350px" }}
                />

        <h1 className="fw-bold text-center">
          Welcome to ADRES Dasher
        </h1>
      </Row>
    </Fragment>
  );
};

export default HomePage;

// export default HomePage;
