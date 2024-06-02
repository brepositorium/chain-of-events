"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { TypeAnimation } from "react-type-animation";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col h-screen justify-start items-center gap-8 bg-hero-pattern bg-cover">
      <div className="mt-40">
        <span className="font-black font-outfit text-4xl">BRING </span>
        <TypeAnimation
          sequence={["ANY EVENT", 1000, "YOUR MUSIC FESTIVAL", 1000, "YOUR SPORT EVENT", 1000, "YOUR CONFERENCE", 1000]}
          wrapper="span"
          speed={20}
          className="font-black font-outfit text-4xl"
          repeat={Infinity}
        />
        <span className="font-black font-outfit text-4xl"> ONCHAIN</span>
      </div>
      <div className="flex justify-around gap-20 mr-12">
        <p className="font-bold font-outfit text-2xl">LOW-COST</p>
        <p className="font-bold font-outfit text-2xl">TRANSPARENT</p>
        <p className="font-bold font-outfit text-2xl">SIMPLE</p>
      </div>
      <Link href="/new-event">
        <button className="btn btn-gradient-primary rounded w-44 border shadow hover:shadow-white">Create Event</button>
      </Link>
      <Link href="/events">
        <button className="btn btn-secondary rounded w-44 border shadow hover:shadow-white">Find events</button>
      </Link>
      <div className="flex flex-col mt-8 justify-center max-w-lg">
        <p className="font-black font-outfit text-4xl">How it works</p>
        <p>
          Chain of Events makes organizing and going to events easier, transparent and more fun. Our platform uses
          blockchain technology to enhance the overall experience, ensuring security, flexibility, and endless
          possibilities for customization through innovative use of Chainlink products.
        </p>
      </div>
    </div>
  );
};

export default Home;
