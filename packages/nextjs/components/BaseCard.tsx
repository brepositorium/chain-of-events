import React from 'react';

interface BaseCardProps {
    children: React.ReactNode;
    className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({ children, className }) => {
    return (
        <div className={`shadow-md rounded-lg p-4 ${className}`}>
            {children}
        </div>
    );
};

export default BaseCard;
