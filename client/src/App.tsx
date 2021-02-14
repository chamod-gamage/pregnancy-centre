import React from "react";

import "./App.css";
import SampleContainer from "./components/SampleContainer";

function App(): React.ReactNode {
  return (
    <div className="App">
      <header className="App-header">
        <SampleContainer />
      </header>
    </div>
  );
}

export default App;
