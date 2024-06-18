import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <div className="dropdown dropdown-end mr-2">
      <label
        tabIndex={0}
        style={{
          background: "transparent",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "150px",
          height: "40px",
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fontSize: "14px",
          backgroundColor: "#AA3A4B",
          paddingLeft: "11px",
          paddingRight: "11px",
          borderRadius: "10px",
          color: "#FFFFFF",
        }}
      >
        <span>Wrong network</span>
        <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 mt-1 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
      >
        <NetworkOptions />
        <li>
          <button className="text-error btn-sm !rounded-xl flex gap-3 py-3" type="button" onClick={() => disconnect()}>
            <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span>Disconnect</span>
          </button>
        </li>
      </ul>
    </div>
  );
};
