"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { TypeAnimation } from "react-type-animation";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center h-screen bg-base-200 lg:-mt-20">
        <div className="flex flex-col lg:flex-row lg:justify-around">
          <div className="flex flex-col items-center max-w-xl mt-20 md:ml-32 gap-4">
            <span className="font-black font-poppins text-4xl md:ml-28">
              BRING YOUR &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            </span>
            <TypeAnimation
              sequence={["EVENT", 1000, "MUSIC FESTIVAL", 1000, "SPORT EVENT", 1000, "CONFERENCE", 1000]}
              wrapper="span"
              speed={20}
              className="font-black font-poppins text-4xl"
              repeat={Infinity}
            />
            <span className="font-black font-poppins text-4xl"> ONCHAIN</span>
            <div className="flex flex-col lg:flex-row justify-around lg:gap-20 lg:mr-14 items-center">
              <p className="font-bold font-poppins text-2xl">NO COSTS</p>
              <p className="font-bold font-poppins text-2xl">TRANSPARENT</p>
              <p className="font-bold font-poppins text-2xl">EASY</p>
            </div>
            <Link href="/new-event">
              <button className="btn btn-primary text-secondary-content text-lg font-poppins rounded-xl w-44 border shadow hover:shadow-white">
                Create Event
              </button>
            </Link>
            <Link href="/events">
              <button className="btn btn-transparent rounded-xl w-44 text-lg border font-poppins border-black shadow hover:shadow-white">
                Find Events
              </button>
            </Link>
          </div>
          <Image src="/hero.png" alt="Hero" height={600} width={600} />
        </div>
      </div>
    </>
  );
};

export default Home;
