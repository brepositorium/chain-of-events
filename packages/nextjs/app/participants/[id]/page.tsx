"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useParticipantsContractAddress from "~~/hooks/chain-of-events/useParticipantsContractAddress";
import {
  fetchExtraNameAndAddress,
  fetchParticipants,
  fetchParticipantsTickets,
} from "~~/utils/chain-of-events/deployContract";

type PageProps = {
  params: { id: number };
};

type ParticipantAddress = string;

type TicketDetail = {
  name: string;
  address: string;
};

type TicketCount = {
  ticket: TicketDetail;
  count: number;
};

const ParticipantsPage = ({ params }: PageProps) => {
  const id = params.id;
  const participantsContractAddress = useParticipantsContractAddress();
  const [participants, setParticipants] = useState<ParticipantAddress[]>([]);
  const [ticketsDetails, setTicketsDetails] = useState<Record<ParticipantAddress, TicketCount[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantAddress[]>([]);

  useEffect(() => {
    const loadParticipantsAndTickets = async () => {
      const loadedParticipants = await fetchParticipants(participantsContractAddress!, id);
      if (loadedParticipants) {
        setParticipants(loadedParticipants);
        setFilteredParticipants(loadedParticipants);
        const ticketsDetailsMap: Record<ParticipantAddress, TicketCount[]> = {};
        for (const participant of loadedParticipants) {
          const tickets = await fetchParticipantsTickets(participantsContractAddress!, participant);
          const ticketDetails = await Promise.all(tickets.map((ticket: string) => fetchExtraNameAndAddress(ticket)));
          const filteredTickets = ticketDetails.filter((detail): detail is TicketDetail => detail !== null);

          const counts: Record<string, TicketCount> = {};
          for (const ticket of filteredTickets) {
            if (!counts[ticket.address]) {
              counts[ticket.address] = { ticket, count: 0 };
            }
            counts[ticket.address].count += 1;
          }
          ticketsDetailsMap[participant] = Object.values(counts);
        }
        setTicketsDetails(ticketsDetailsMap);
      }
    };

    if (participantsContractAddress) {
      loadParticipantsAndTickets();
    }
  }, [id, participantsContractAddress]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredParticipants(participants);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filteredData = participants.filter(entry => entry.toLowerCase().includes(lowercasedFilter));
      setFilteredParticipants(filteredData);
    }
  }, [searchTerm, participants]);

  return (
    <div className="flex flex-col place-items-center">
      <div className="flex place-items-center justify-between xl:gap-80">
        <p className="text-center text-2xl font-medium font-poppins">Participants</p>
        <div className="place-self-end relative my-4 w-6/12">
          <input
            type="text"
            placeholder="Search by address..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="text-lg p-2 pl-8 border rounded-lg"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 absolute left-2 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      {filteredParticipants.map((participant, index) => (
        <div
          key={index}
          className="collapse collapse-arrow bg-secondary-content rounded-xl shadow-md space-x-4 my-2 w-6/12"
        >
          <input type="radio" name="participants-accordion" id={`participant-${index}`} />
          <label
            htmlFor={`participant-${index}`}
            className="collapse-title text-xl font-medium font-poppins"
            title={participant}
          >
            {participant}
          </label>
          <div className="collapse-content">
            <ul>
              {ticketsDetails[participant] &&
                ticketsDetails[participant].map(({ ticket, count }, idx) => (
                  <li key={idx} className="cursor-pointer hover:underline font-poppins text-md">
                    <Link href={`/extra/${ticket.address}`}>
                      {count}x {ticket.name} ({ticket.address})
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantsPage;
