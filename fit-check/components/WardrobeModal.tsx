/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { WardrobeItem } from '../types';
import { UploadCloudIcon, CheckCircleIcon } from './icons';

interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
}

// Helper to convert image URL to a File object
const urlToFile = async (url: string, filename: string): Promise<File> => {
    // For blob URLs (user uploads), fetch directly
    if (url.startsWith('blob:')) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || 'image/png' });
    }

    // For external URLs, try fetch first (better CORS handling)
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || 'image/png' });
    } catch (fetchError) {
        // Fallback to canvas method if fetch fails
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.setAttribute('crossOrigin', 'anonymous');

            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context.'));
                }
                ctx.drawImage(image, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        return reject(new Error('Canvas toBlob failed.'));
                    }
                    const file = new File([blob], filename, { type: 'image/png' });
                    resolve(file);
                }, 'image/png');
            };

            image.onerror = () => {
                reject(new Error(`Could not load image from URL. This may be a CORS issue. Original fetch error: ${fetchError}`));
            };

            image.src = url;
        });
    }
};

const GARMENT_TYPES = [
    'T-Shirt',
    'Hoodie / Sweatshirt',
    'Jacket / Coat',
    'Dress',
    'Pants / Jeans',
    'Shorts',
    'Skirt',
    'Shoes',
    'Hat',
    'Glasses',
    'Other'
];

const WardrobePanel: React.FC<WardrobePanelProps> = ({ onGarmentSelect, activeGarmentIds, isLoading, wardrobe }) => {
    const [error, setError] = useState<string | null>(null);
    // COMMENTED OUT: Garment type selection modal state
    // const [pendingFile, setPendingFile] = useState<File | null>(null);
    // const [showGarmentTypeModal, setShowGarmentTypeModal] = useState(false);
    // const [selectedGarmentType, setSelectedGarmentType] = useState<string>('');

    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        setError(null);
        try {
            // If the item was from an upload, its URL is a blob URL. We need to fetch it to create a file.
            // If it was a default item, it's a regular URL. This handles both.
            const file = await urlToFile(item.url, item.name);
            onGarmentSelect(file, item);
        } catch (err) {
            const detailedError = `Failed to load wardrobe item. This is often a CORS issue. Check the developer console for details.`;
            setError(detailedError);
            console.error(`[CORS Check] Failed to load and convert wardrobe item from URL: ${item.url}. The browser's console should have a specific CORS error message if that's the issue.`, err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file.');
                return;
            }
            // COMMENTED OUT: Show modal to select garment type
            // setPendingFile(file);
            // setShowGarmentTypeModal(true);
            
            // Directly process the file without garment type selection
            const customGarmentInfo: WardrobeItem = {
                id: `custom-${Date.now()}`,
                name: file.name,
                url: URL.createObjectURL(file),
                // garmentType: undefined, // No garment type required
            };
            onGarmentSelect(file, customGarmentInfo);
        }
    };

    // COMMENTED OUT: Garment type selection handlers
    // const handleGarmentTypeConfirm = () => {
    //     if (!pendingFile || !selectedGarmentType) return;
    //     
    //     const customGarmentInfo: WardrobeItem = {
    //         id: `custom-${Date.now()}`,
    //         name: pendingFile.name,
    //         url: URL.createObjectURL(pendingFile),
    //         garmentType: selectedGarmentType,
    //     };
    //     onGarmentSelect(pendingFile, customGarmentInfo);
    //     
    //     // Reset state
    //     setPendingFile(null);
    //     setShowGarmentTypeModal(false);
    //     setSelectedGarmentType('');
    // };

    // const handleGarmentTypeCancel = () => {
    //     setPendingFile(null);
    //     setShowGarmentTypeModal(false);
    //     setSelectedGarmentType('');
    // };

  return (
    <div className="pt-6 border-t border-gray-400/50">
        <h2 className="text-xl font-serif tracking-wider text-gray-800 mb-3">Wardrobe</h2>
        <div className="grid grid-cols-3 gap-3">
            {wardrobe.map((item) => {
            const isActive = activeGarmentIds.includes(item.id);
            return (
                <button
                key={item.id}
                onClick={() => handleGarmentClick(item)}
                disabled={isLoading || isActive}
                className="relative aspect-square border rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 group disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={`Select ${item.name}`}
                >
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold text-center p-1">{item.name}</p>
                </div>
                {isActive && (
                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 text-white" />
                    </div>
                )}
                </button>
            );
            })}
            <label htmlFor="custom-garment-upload" className={`relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 transition-colors ${isLoading ? 'cursor-not-allowed bg-gray-100' : 'hover:border-gray-400 hover:text-gray-600 cursor-pointer'}`}>
                <UploadCloudIcon className="w-6 h-6 mb-1"/>
                <span className="text-xs text-center">Upload</span>
                <input id="custom-garment-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isLoading}/>
            </label>
        </div>
        {wardrobe.length === 0 && (
             <p className="text-center text-sm text-gray-500 mt-4">Your uploaded garments will appear here.</p>
        )}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
        {/* COMMENTED OUT: Garment Type Selection Modal */}
        {/* {showGarmentTypeModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleGarmentTypeCancel}>
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">What type of garment is this?</h3>
                    <p className="text-sm text-gray-600 mb-4">This helps the AI apply the clothing more accurately.</p>
                    <div className="space-y-2 mb-6">
                        {GARMENT_TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedGarmentType(type)}
                                className={`w-full text-left px-4 py-3 rounded-md border-2 transition-all ${
                                    selectedGarmentType === type
                                        ? 'border-gray-900 bg-gray-100'
                                        : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGarmentTypeCancel}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGarmentTypeConfirm}
                            disabled={!selectedGarmentType}
                            className="flex-1 px-4 py-2 text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )} */}
    </div>
  );
};

export default WardrobePanel;