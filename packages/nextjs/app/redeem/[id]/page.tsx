"use client"
import { useEffect, useState } from "react";
import ExtraCard from "~~/components/ExtraCard";
import QrReader from "~~/components/QrReader";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { fetchExtraDetails, getUnredeemedBalanceOf } from "~~/utils/chain-of-events/deployContract";


type PageProps = {
  params: { id: number };
};

interface ExtraDetail {
    balance: string;
    extraType?: bigint;
    extraAddress: string;
    name?: string;
    symbol?: string;
    description?: string;
    imageUrl?: string;
    price?: bigint;
    uri?: string;
}

const RedeemPage = ({ params }: PageProps) => {
    const id = params.id;

    const { data } = useScaffoldReadContract({
        contractName: "EventCreation",
        functionName: "getExtras",
        args: [BigInt(id)]
    });
    
    const [extraDetails, setExtraDetails] = useState<ExtraDetail[]>([]);
    const [qrResult, setQrResult] = useState('');

    function extractAddress(inputString: string): string | null {
      const match = inputString.match(/0x[a-fA-F0-9]{40}/);
      return match ? match[0] : null;
  }
    console.log(data);
    useEffect(() => {
        const fetchExtras = async () => {
            if (!data || data.length === 0) {
                setExtraDetails([]);
                return;
            }
            const balancePromises = data.map(extra => getUnredeemedBalanceOf(extra, extractAddress(qrResult)!));
            const balances = await Promise.all(balancePromises);
    
            const nonZeroExtras = data.filter((extra, index) => balances[index] > 0);
    
            const detailPromises = nonZeroExtras.map(extra => fetchExtraDetails(extra));
            const details = await Promise.all(detailPromises);
            
            const combinedDetails = nonZeroExtras.map((extra, index) => ({
                ...details[index],
                balance: balances[data.indexOf(extra)],
                extraAddress: extra
            }));
            setExtraDetails(combinedDetails);
        };

        if (qrResult) {
            fetchExtras();
        }

    }, [data, qrResult]);

  return (
    <>
    <QrReader onScanComplete={setQrResult} />
    <div className="h-[650px] bg-circles bg-no-repeat">
      <div className="container mx-auto px-40">
        <h2 className="my-4">Wallet address: {extractAddress(qrResult)}</h2>
        <h1 className="text-2xl font-bold my-4">Your assets</h1>
        <div className="grid grid-cols-3 gap-4">
            {extraDetails.length > 0 ? extraDetails.map((detail, index) => (
              <ExtraCard
                extraName={detail.name}
                description={detail.description}
                imageUrl={detail.imageUrl}
                extraAddress={detail.extraAddress}
                price={Number(detail.price)}
                hasQuantity={true}
                noOfItems={Number(detail.balance)}
                action={ACTIONS.TRANSFER}
                extraType={Number(detail.extraType)}
              />
            )): <p>No extra details available.</p>}
        </div>
      </div>
    </div>
    </>
  );
};

export default RedeemPage;
