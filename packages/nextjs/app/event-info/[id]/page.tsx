"use client"
import { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { fetchExtraDetails, getBalanceOf} from "~~/utils/chain-of-events/deployContract";
import { useAccount } from 'wagmi';
import Link from "next/link";

type PageProps = {
  params: { id: number };
};

interface ExtraDetail {
    balance: string;
    extraType?: bigint;
    name?: string;
    symbol?: string;
    price?: bigint;
    uri?: string;
}

const EditDashboardPage = ({ params }: PageProps) => {
    const id = params.id;

    const { address } = useAccount()
    
    const { data } = useScaffoldReadContract({
        contractName: "EventCreation",
        functionName: "getExtras",
        args: [BigInt(id)]
    });

    const [extraDetails, setExtraDetails] = useState<ExtraDetail[]>([]);
    
    useEffect(() => {
        const fetchExtras = async () => {
            if (!data || data.length === 0) {
                setExtraDetails([]);
                return;
            }

            const balancePromises = data.map(extra => getBalanceOf(extra, address!));
            const balances = await Promise.all(balancePromises);
    
            const nonZeroExtras = data.filter((extra, index) => BigInt(balances[index]) > 0);
    
            const detailPromises = nonZeroExtras.map(extra => fetchExtraDetails(extra));
            const details = await Promise.all(detailPromises);
    
            const combinedDetails = nonZeroExtras.map((extra, index) => ({
                ...details[index],
                balance: balances[data.indexOf(extra)]
            }));
            setExtraDetails(combinedDetails);
        };

        if (address) {
            fetchExtras();
        }

    }, [data, address]);
    
  return (
    <div>
        <Link href={"/shop/" + id + "/0"} className="btn">Buy ticket</Link>
        <Link href={"/shop/" + id + "/1"} className="btn">Buy drink/snack</Link>
        <div>
            {extraDetails.length > 0 ? extraDetails.map((detail, index) => (
                <div key={index} className="detail-item">
                    <p>Name: {detail?.name}</p>
                    <p>Symbol: {detail?.symbol}</p>
                    <p>URI: {detail?.uri}</p>
                    <p>Price: {Number(detail?.price)}</p>
                    <p>Balance: {Number(detail?.balance)}</p>
                </div>
            )) : <p>No extra details available.</p>}
        </div>
    </div>
  );
};

export default EditDashboardPage;
