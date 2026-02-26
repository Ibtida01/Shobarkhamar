import { createBrowserRouter } from "react-router";
import { Home } from "./components/Home";
import { Selection } from "./components/Selection";
import { Detection } from "./components/Detection";
import { Treatment } from "./components/Treatment";
import { Results } from "./components/Results";
import { About } from "./components/About";
import { Profile } from "./components/Profile";
import { FarmInfo } from "./components/FarmInfo";
import { History } from "./components/History";
import { Notifications } from "./components/Notifications";
import { DiseaseDatabase } from "./components/DiseaseDatabase";
import { Feedback } from "./components/Feedback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/selection",
    Component: Selection,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/farm-info",
    Component: FarmInfo,
  },
  {
    path: "/detection",
    Component: Detection,
  },
  {
    path: "/treatment",
    Component: Treatment,
  },
  {
    path: "/history",
    Component: History,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/disease-database",
    Component: DiseaseDatabase,
  },
  {
    path: "/feedback",
    Component: Feedback,
  },
  {
    path: "/results",
    Component: Results,
  },
  {
    path: "/about",
    Component: About,
  },
]);