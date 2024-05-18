"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex flex-col h-screen justify-center items-center gap-8">
      <Link href="/new-event">
        <button className="btn btn-primary">Bootstrap Event</button>
      </Link>
      <Link href="/events">
        <button className="btn btn-secondary">See Your Tickets</button>
      </Link>
    </div>
  );
};

export default Home;
