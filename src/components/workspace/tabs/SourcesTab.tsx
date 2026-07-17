import React from 'react';
import SourceUploader from '../SourceUploader';

interface SourcesTabProps {
    notebookId: string;
}

export const SourcesTab: React.FC<SourcesTabProps> = ({ notebookId }) => {
    return (
        <div className="p-2 sm:p-6">
            <div className="mx-auto max-w-5xl">
                <SourceUploader notebookId={notebookId} />
            </div>
        </div>
    );
};

export default SourcesTab;
