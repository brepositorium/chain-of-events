import React, { useState } from 'react';
import Card from './BaseCard';
import Link from 'next/link';

interface ActionButton {
    label: string; // Display text like 'Manage', 'Redeem', 'Transfer', 'Buy'
    onClick?: () => void; // Function to call on click
    url?: string;
}

interface ExtraCardProps {
    extraName?: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    noOfItems?: number;
    hasQuantity:boolean;
    extraType: number;
    actions: ActionButton[];
}

const ExtraCard: React.FC<ExtraCardProps> = ({
    extraName,
    description,
    imageUrl,
    price,
    noOfItems,
    hasQuantity,
    extraType,
    actions
}) => {
    const [quantity, setQuantity] = useState(0); // Initialize quantity with 0

    const handleIncrease = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const handleDecrease = () => {
        setQuantity(prevQuantity => Math.max(0, prevQuantity - 1)); // Prevent negative values
    };

    return (
        <Card className={extraType === 0 
                        ? "w-72 bg-blue-pattern bg-cover bg-no-repeat rounded-lg" 
                        : "w-72 bg-green-pattern bg-cover bg-no-repeat rounded-lg"}>
            <img src={imageUrl} alt={extraName} className="w-full h-48 object-cover rounded-t-lg" />
            {noOfItems ? 
            <div className="indicator">
                <span className='indicator-item badge'>{`x${noOfItems}`}</span>
            </div>
            :<div></div>}
            <div className="flex flex-col h-full p-2">
                <h2 className="text-center font-bold">{extraName}</h2>
                <p className="text-sm">{description}</p>
                <p className="text-sm text-center font-bold">{`$${price?.toFixed(2)}`}</p>
                {hasQuantity ? 
                <div className="flex items-center justify-center my-2">
                    <button className="btn text-xl" onClick={handleDecrease}>-</button>
                    <span className="mx-4">{quantity}</span>
                    <button className="btn text-xl" onClick={handleIncrease}>+</button>
                </div>
                : <div></div>}
                <div className="flex flex-wrap justify-evenly mt-4">
                    {actions.map((action, index) => (
                        action.url ? (
                            <Link href={action.url} key={index} className={`btn btn-gradient-primary rounded-xl w-36 border-0`}>
                                    {action.label}
                            </Link>
                        ) : (
                            <button key={index} className={`btn btn-gradient-primary rounded-xl w-36 border-0`} onClick={action.onClick}>
                                {action.label}
                            </button>
                        )
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default ExtraCard;
