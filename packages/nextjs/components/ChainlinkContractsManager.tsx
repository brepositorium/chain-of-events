import React, { useEffect, useState } from "react";
import { get, ref, runTransaction } from "firebase/database";
import { AUTOMATION_UPDATE_TYPES } from "~~/utils/chain-of-events/AutomationUpdateTypes";
import {
  MINT_UPDATE_STATUS,
  PAUSE_UPDATE_STATUS,
  PRICE_UPDATE_STATUS,
} from "~~/utils/chain-of-events/ChainlinkContractStatus";
import { deployContractForType, registerUpkeepForType } from "~~/utils/chain-of-events/deployContract";
import { database } from "~~/utils/chain-of-events/firebaseConfig";

const ChainlinkContractManager = ({
  extraAddress,
  onScheduleButtonClick,
}: {
  extraAddress: string;
  onScheduleButtonClick: (field: string) => void; // Callback to open the modal
}) => {
  const [contractAddress, setContractAddress] = useState("");
  const [updateType, setUpdateType] = useState(AUTOMATION_UPDATE_TYPES.PRICE);
  const [buttonState, setButtonState] = useState(getInitialButtonState(updateType));

  useEffect(() => {
    const fetchContractDetails = () => {
      const contractRef = ref(database, `${updateType}Contracts/${extraAddress}`);
      get(contractRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setContractAddress(data.chainlinkContractAddress);
            setButtonState(data.status);
          } else {
            console.log(`No details found for ${updateType}`);
            setButtonState(getInitialButtonState(updateType));
          }
        })
        .catch(error => {
          console.error(`Failed to fetch ${updateType} contract details:`, error);
        });
    };

    fetchContractDetails();
  }, [extraAddress, updateType]);

  const deployContract = async () => {
    let statusUpdate;
    switch (updateType) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        statusUpdate = PRICE_UPDATE_STATUS.FUND;
        break;
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        statusUpdate = MINT_UPDATE_STATUS.FUND;
        break;
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        statusUpdate = PAUSE_UPDATE_STATUS.FUND;
        break;
      default:
        return;
    }

    // const chainlinkContractAddress = await deployContractForType(extraAddress, updateType);
    const chainlinkContractAddress = "adresa aici";
    console.log(chainlinkContractAddress);
    setContractAddress(chainlinkContractAddress);
    setButtonState(statusUpdate);
    saveOrUpdateContractDetails(
      extraAddress,
      chainlinkContractAddress,
      `${updateType}Automation` + extraAddress,
      statusUpdate,
    );
  };

  const fundContract = () => {
    let statusUpdate;
    switch (updateType) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        statusUpdate = PRICE_UPDATE_STATUS.REGISTER_UPKEEP;
        break;
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        statusUpdate = MINT_UPDATE_STATUS.REGISTER_UPKEEP;
        break;
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        statusUpdate = PAUSE_UPDATE_STATUS.REGISTER_UPKEEP;
        break;
      default:
        return;
    }

    setButtonState(statusUpdate);
    saveOrUpdateContractDetails(extraAddress, contractAddress, `${updateType}Automation` + extraAddress, statusUpdate);
  };

  const registerUpkeep = async () => {
    let statusUpdate;
    switch (updateType) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        statusUpdate = PRICE_UPDATE_STATUS.SCHEDULE;
        break;
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        statusUpdate = MINT_UPDATE_STATUS.SCHEDULE;
        break;
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        statusUpdate = PAUSE_UPDATE_STATUS.SCHEDULE;
        break;
      default:
        return;
    }

    // await registerUpkeepForType(contractAddress, `${updateType}Automation` + extraAddress, updateType);

    setButtonState(statusUpdate);
    saveOrUpdateContractDetails(extraAddress, contractAddress, `${updateType}Automation` + extraAddress, statusUpdate);
  };

  const saveOrUpdateContractDetails = async (
    extraAddress: string,
    contractAddress: string,
    contractName: string,
    status: any,
  ) => {
    const contractsRef = ref(database, `${updateType}Contracts/${extraAddress}`);

    runTransaction(contractsRef, currentData => {
      if (currentData === null) {
        return {
          chainlinkContractName: contractName,
          chainlinkContractAddress: contractAddress,
          status: status,
        };
      } else {
        currentData.chainlinkContractAddress = contractAddress;
        currentData.status = status;
        return currentData;
      }
    })
      .then(result => {
        if (result.committed) {
          console.log(`${updateType} contract details saved or updated!`);
          console.log("Contract details: ", result.snapshot.val());
        } else {
          console.log("No changes were committed.");
        }
      })
      .catch(error => {
        console.error("Transaction failed: ", error);
      });
  };

  function getInitialButtonState(type: any) {
    switch (type) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        return PRICE_UPDATE_STATUS.DEPLOY;
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        return MINT_UPDATE_STATUS.DEPLOY;
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        return PAUSE_UPDATE_STATUS.DEPLOY;
      default:
        return "UNKNOWN_STATUS";
    }
  }

  function getFundState(type: any) {
    switch (type) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        return PRICE_UPDATE_STATUS.FUND;
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        return MINT_UPDATE_STATUS.FUND;
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        return PAUSE_UPDATE_STATUS.FUND;
      default:
        return "UNKNOWN_STATUS";
    }
  }

  function getRegisterUpkeepState(type: any) {
    switch (type) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        return PRICE_UPDATE_STATUS.REGISTER_UPKEEP;
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        return MINT_UPDATE_STATUS.REGISTER_UPKEEP;
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        return PAUSE_UPDATE_STATUS.REGISTER_UPKEEP;
      default:
        return "UNKNOWN_STATUS";
    }
  }

  function getScheduleState(type: any) {
    switch (type) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        return PRICE_UPDATE_STATUS.SCHEDULE;
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        return MINT_UPDATE_STATUS.SCHEDULE;
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        return PAUSE_UPDATE_STATUS.SCHEDULE;
      default:
        return "UNKNOWN_STATUS";
    }
  }

  const getStepsLabels = (type: any) => {
    switch (type) {
      case AUTOMATION_UPDATE_TYPES.PRICE:
        return ["Deploy Price Update Contract", "Fund Contract", "Register Upkeep", "Schedule Update"];
      case AUTOMATION_UPDATE_TYPES.MINT_LIMIT:
        return ["Deploy Mint Limit Update Contract", "Fund Contract", "Register Upkeep", "Schedule Update"];
      case AUTOMATION_UPDATE_TYPES.PAUSE:
        return ["Deploy Automated Pause Contract", "Fund Contract", "Register Upkeep", "Schedule Pause"];
      default:
        return ["Step 1", "Step 2", "Step 3", "Step 4"];
    }
  };

  const getStepStatus = (stepIndex: any, currentState: any, updateType: any) => {
    const statuses = {
      [AUTOMATION_UPDATE_TYPES.PRICE]: [
        PRICE_UPDATE_STATUS.DEPLOY,
        PRICE_UPDATE_STATUS.FUND,
        PRICE_UPDATE_STATUS.REGISTER_UPKEEP,
        PRICE_UPDATE_STATUS.SCHEDULE,
      ],
      [AUTOMATION_UPDATE_TYPES.MINT_LIMIT]: [
        MINT_UPDATE_STATUS.DEPLOY,
        MINT_UPDATE_STATUS.FUND,
        MINT_UPDATE_STATUS.REGISTER_UPKEEP,
        MINT_UPDATE_STATUS.SCHEDULE,
      ],
      [AUTOMATION_UPDATE_TYPES.PAUSE]: [
        PAUSE_UPDATE_STATUS.DEPLOY,
        PAUSE_UPDATE_STATUS.FUND,
        PAUSE_UPDATE_STATUS.REGISTER_UPKEEP,
        PAUSE_UPDATE_STATUS.SCHEDULE,
      ],
    };

    const stepStatuses = statuses[updateType];
    return currentState === stepStatuses[stepIndex] || stepStatuses.indexOf(currentState) > stepIndex
      ? "step-base-100"
      : "step-neutral";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="font-outfit">
        <p>Schedule update for</p>
        <select
          className="select bg-secondary rounded select-bordered"
          defaultValue={AUTOMATION_UPDATE_TYPES.PRICE}
          onChange={e => setUpdateType(e.target.value)}
        >
          <option value={AUTOMATION_UPDATE_TYPES.PRICE}>Price</option>
          <option value={AUTOMATION_UPDATE_TYPES.MINT_LIMIT}>Mint Limit</option>
          <option value={AUTOMATION_UPDATE_TYPES.PAUSE}>Pausing selling</option>
        </select>
      </div>
      <ul className="steps mt-12">
        {getStepsLabels(updateType).map((label, index) => (
          <li key={label} className={`step ${getStepStatus(index, buttonState, updateType)} font-outfit`}>
            {label}
          </li>
        ))}
      </ul>

      {/* Deploy Contract Button */}
      {buttonState === getInitialButtonState(updateType) && (
        <button className="btn btn-gradient-primary rounded btn-md w-48 mt-12 mb-4" onClick={deployContract}>
          Deploy {updateType.charAt(0).toUpperCase() + updateType.slice(1)} Contract
        </button>
      )}

      {/* Fund Contract Button */}
      {buttonState === getFundState(updateType) && (
        <button className="btn btn-gradient-primary rounded btn-md w-48 mt-12 mb-4" onClick={fundContract}>
          I have funded the {updateType.charAt(0).toUpperCase() + updateType.slice(1)} Contract
        </button>
      )}

      {/* Register Upkeep Button */}
      {buttonState === getRegisterUpkeepState(updateType) && (
        <button className="btn btn-gradient-primary rounded btn-md w-48 mt-12 mb-4" onClick={registerUpkeep}>
          Register upkeep for {updateType.charAt(0).toUpperCase() + updateType.slice(1)}
        </button>
      )}

      {/* Schedule Update Button */}
      {buttonState === getScheduleState(updateType) && (
        <button
          className="btn btn-gradient-primary rounded btn-md w-48 mt-12 mb-4"
          onClick={() => {
            onScheduleButtonClick("schedule" + updateType);
          }}
        >
          Schedule Update for {updateType.charAt(0).toUpperCase() + updateType.slice(1)}
        </button>
      )}
    </div>
  );
};

export default ChainlinkContractManager;
