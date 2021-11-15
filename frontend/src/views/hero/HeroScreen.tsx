import React from "react";
import { useParams } from "react-router-dom";
import "./HeroScreen.css";
const HeroScreen = () => {
  const { id } = useParams();

  const f = {
    tokenId: 1,
    name: "TokenRage#1",
    level: 7,
    wins: 2,
    hp: 1040,
    strength: 409,
    dexterity: 202,
    agility: 210,
    intelligence: 130,
    durability: 480,
  };
  const img =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nNTAwJyB3aWR0aD0nNTAwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPSd3aGl0ZScgZm9udC1zaXplPScxLjVlbSc+PHJlY3Qgd2lkdGg9JzUwMCcgaGVpZ2h0PSc1MDAnIHN0eWxlPSdmaWxsOmJsYWNrOycvPjx0ZXh0IHg9JzUwJScgeT0nMjAlJyBmb250LXNpemU9JzJlbSc+Qmxvb2RTcG9ydCAjMDwvdGV4dD48bGluZSB4MT0nMjAlJyB5MT0nMjclJyB4Mj0nODAlJyB5Mj0nMjclJyBzdHlsZT0nc3Ryb2tlOndoaXRlJy8+PHRleHQgeD0nNTAlJyB5PSczNyUnIGZvbnQtc2l6ZT0nMS41ZW0nPkxldmVsOiA4PC90ZXh0Pjx0ZXh0IHg9JzUwJScgeT0nNDUlJyBmb250LXNpemU9JzEuNWVtJz5XaW5zOiAwPC90ZXh0PjxsaW5lIHgxPScyMCUnIHkxPSc1MCUnIHgyPSc4MCUnIHkyPSc1MCUnIHN0eWxlPSdzdHJva2U6d2hpdGUnLz48dGV4dCB4PSc1MCUnIHk9JzU3JSc+SFA6IDE2MDwvdGV4dD48dGV4dCB4PSc1MCUnIHk9JzYyJSc+U3RyZW5ndGg6IDMxPC90ZXh0Pjx0ZXh0IHg9JzUwJScgeT0nNjclJz5EZXh0ZXJpdHk6IDE4PC90ZXh0Pjx0ZXh0IHg9JzUwJScgeT0nNzIlJz5BZ2lsaXR5OiAyMzwvdGV4dD48dGV4dCB4PSc1MCUnIHk9Jzc3JSc+SW50ZWxsaWdlbmNlOiAzNDwvdGV4dD48dGV4dCB4PSc1MCUnIHk9JzgyJSc+RHVyYWJpbGl0eTogMzc8L3RleHQ+PC9zdmc+";
  return (
    <main className="main-container">
      <img
        srcSet="/assets/logo@2x.png 2x"
        src="/assets/logo.png"
        className="tokenrage-logo"
      />
      <div className="hero-container">
        <div className="hero-section hero-side">
          <div className="stat-container">
            <span className="stat-name">Hp</span>
            <div className="hero-bar-container">
              <div className="stats hp" style={{ width: (f.hp * 100) / 2000 }}>
                {f.hp}
              </div>
            </div>
          </div>

          <div className="stat-container">
            <span className="stat-name">Strength</span>
            <div className="hero-bar-container">
              <div
                className="stats strength"
                style={{ width: (f.strength * 100) / 500 }}
              >
                {f.strength}
              </div>
            </div>
          </div>

          <div className="stat-container">
            <span className="stat-name">Dexterity</span>
            <div className="hero-bar-container">
              <div
                className="stats dexterity"
                style={{ width: (f.dexterity * 100) / 500 }}
              >
                {f.dexterity}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-section hero-mid">
          <div>
            <img src={img} alt="" />
            <div className="connect-button-container">
              <img
                srcSet="/assets/continue-with-metamask-button@2x.png 2x"
                src="/assets/continue-with-metamask-button.png"
              />
            </div>
          </div>
        </div>

        <div className="hero-section hero-side">
          <div className="stat-container">
            <span className="stat-name">Agility</span>
            <div className="hero-bar-container">
              <div
                className="stats agility"
                style={{ width: (f.agility * 100) / 500 }}
              >
                {f.agility}
              </div>
            </div>
          </div>
          <div className="stat-container">
            <span className="stat-name">Intelligence</span>
            <div className="hero-bar-container">
              <div
                className="stats intelligence"
                style={{ width: (f.intelligence * 100) / 500 }}
              >
                {f.intelligence}
              </div>
            </div>
          </div>
          <div className="stat-container">
            <span className="stat-name">Durability</span>
            <div className="hero-bar-container">
              <div
                className="stats durability"
                style={{ width: (f.durability * 100) / 500 }}
              >
                {f.durability}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HeroScreen;
