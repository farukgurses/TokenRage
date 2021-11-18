import React from "react";
import ReactLoading from "react-loading";

const Loading = () => (
  <div
    style={{
      backgroundColor: "#2e2f36",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <ReactLoading
      type={"bars"}
      color={"rgba(221, 222, 228, 0.3)"}
      height={128}
      width={128}
    />
  </div>
);

export default Loading;
