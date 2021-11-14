import React from "react";
import ReactLoading from "react-loading";

const Loading = () => (
  <div style={{ backgroundColor: "rgba(221, 222, 228, 0.3)" }}>
    <ReactLoading type={"bars"} color={"#2e2f36"} height={128} width={128} />
  </div>
);

export default Loading;
