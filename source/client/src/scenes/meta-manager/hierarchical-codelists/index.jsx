import React, {Fragment} from "react";
import HierarchicalCodelistsList from "./List";
import HierarchicalCodelistDetail from "./Detail";

const HierarchicalCodelists = () =>
  <Fragment>
    <HierarchicalCodelistsList/>
    <HierarchicalCodelistDetail/>
  </Fragment>;

export default HierarchicalCodelists;