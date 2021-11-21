import React from "react";

export default function Header() {
  return (
    <header>
      <img
        srcSet="/assets/logo@2x.png 2x"
        src="/assets/logo.png"
        className="tokenrage-logo"
      />
      <div className="tokenrage-text-logo"></div>
      <div className="tokenrage-settings-icon"></div>
    </header>
  );
}
