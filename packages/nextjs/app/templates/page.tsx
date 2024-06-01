"use client"
import React, { useEffect, useState } from 'react';
import { get, ref } from "firebase/database";
import { database } from "~~/utils/chain-of-events/firebaseConfig"
import Link from 'next/link';
import Card from '~~/components/BaseCard';

interface Template {
    id: string;
    name: string;
    description: string;
    linkToRemix: string;
}

const TemplatesPage = () => {
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            const templatesRef = ref(database, 'templates');
            const snapshot = await get(templatesRef);
            if (snapshot.exists()) {
                const templatesWithIds = Object.entries(snapshot.val()).map(([id, template]) => ({
                    ...template as Template,
                    id
                }));
                setTemplates(templatesWithIds);
            } else {
                console.log("No templates available.");
            }
        };

        fetchTemplates();
    }, []);

    return (
    <div className="h-[650px] bg-spirals bg-no-repeat">
        <div className="container mx-auto px-40">
            <div className='flex my-8 justify-between'>
            <h1 className="text-2xl font-bold">Events created by you</h1>
            <Link href="/new-template" className='btn btn-gradient-primary rounded-xl w-36 border'>
                Add Template
            </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {templates.map((template: Template, index) => (
                    <Card className="w-72 bg-red-pattern bg-cover bg-no-repeat rounded-lg flex flex-col">
                    <div className="flex flex-col items-center h-full pt-2 justify-between">
                        <div className="overflow-hidden" style={{ maxHeight: '4rem' }}>
                            <h2 className="text-center text-lg font-extrabold text-ellipsis font-outfit">{template.name}</h2>
                        </div>
                        <h2 className="text-center text-ellipsis font-outfit">Template's ID: <p className='font-bold'>{template.id}</p></h2>
                        <p className='font-outfit'>{template.description}</p>
                        <div className="flex gap-2 flex-wrap justify-evenly mt-4">
                            <div className='shadow hover:shadow-xl'>
                                <Link href={template.linkToRemix} className="btn btn-gradient-primary rounded-xl w-36 border-0">
                                    View on Remix
                                </Link>
                            </div>
                        </div>
                    </div>
                    </Card>
                ))}
            </div>
        </div>
    </div>
    );
};

export default TemplatesPage;
