import React, { FunctionComponent } from "react";

import Footer from '../organisms/Footer'
import Navbar from '../organisms/Navbar'

const DonorPage: FunctionComponent<Record<string, unknown>> = (props: React.PropsWithChildren<Record<string, unknown>>) => {
  return <div className="donor-page">
    <div className="donor-page-header">
      <Navbar links={ [ { name: "TPC Main Website", link: "/donation-guidelines"  }, 
                        { name: "How to Donate", link: "/donation-guidelines"  }, 
                        { name: "Organization Login", link: "/login" } ] } />
    </div>
    <div className="donor-page-content" >
      {props.children}
      </div>
    <div className="donor-page-footer">
      <Footer/>
      </div>
  </div>
};

export default DonorPage;
