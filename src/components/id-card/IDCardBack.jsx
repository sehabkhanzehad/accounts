import { CardDesigns } from './IDCardTemplates'

/**
 * IDCardBack Component - Renders the back side of pilgrim ID card
 * 
 * To add a new design layout:
 * 1. Add design configuration to CardDesigns in IDCardTemplates.js
 * 2. Add a new if block here: if (design === 'yourDesignName') { return (...) }
 * 3. Copy and modify one of the existing designs as a template
 * 4. The design will automatically work throughout the system
 * 
 * Available designs: modern, classic, minimal, professional
 */

export function IDCardBack({ pilgrim, packageInfo, size, orientation = 'landscape', design = 'modern', companyInfo = {} }) {
    const user = pilgrim?.relationships?.pilgrim?.relationships?.user?.attributes || pilgrim?.user?.attributes || pilgrim?.attributes
    const presentAddress = pilgrim?.relationships?.pilgrim?.relationships?.user?.relationships?.presentAddress?.attributes || user?.presentAddress?.attributes
    const passport = pilgrim?.relationships?.pilgrim?.relationships?.passport?.attributes || pilgrim?.passport?.attributes

    const isPortrait = orientation === 'portrait'
    const cardWidth = isPortrait ? size.height : size.width
    const cardHeight = isPortrait ? size.width : size.height
    const designStyle = CardDesigns[design]?.back || CardDesigns.modern.back

    // Modern Design Layout
    if (design === 'modern') {
        return (
            <div
                className={`id-card-back relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: '12px',
                }}
            >
                <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id={`grid-back-${design}`} width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="1" fill={designStyle.patternColor} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#grid-back-${design})`} />
                    </svg>
                </div>

                <div className="relative h-full flex flex-col p-3">
                    <div className={`border-b ${designStyle.headerBorder} pb-2 mb-2`}>
                        <h2 className={`text-[10px] font-bold ${designStyle.headerText} text-center mb-1`}>
                            {companyInfo.name || 'M/S Raj Travel'}
                        </h2>
                        <p className="text-[7px] text-gray-600 text-center">
                            {companyInfo.phone || '+880 1234-567890'} | {companyInfo.email || 'info@rajtravel.com'}
                        </p>
                    </div>

                    <div className="flex-1 space-y-2">
                        {presentAddress && (
                            <div>
                                <h3 className="text-[8px] font-semibold text-gray-800 mb-1">Address:</h3>
                                <div className={`${designStyle.sectionBg} rounded p-1.5 border ${designStyle.sectionBorder}`}>
                                    <p className="text-[7px] text-gray-700">
                                        {presentAddress.address1}, {presentAddress.city}, {presentAddress.state}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-[8px] font-semibold text-gray-800 mb-1">Emergency Contact:</h3>
                            <div className={`${designStyle.emergencyBg} rounded p-1.5 border ${designStyle.emergencyBorder}`}>
                                <p className="text-[7px] text-gray-700">
                                    <span className="font-medium">Phone:</span> {user?.emergency_contact || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`border-t ${designStyle.headerBorder} pt-2 mt-2`}>
                        <p className="text-[6px] text-gray-500 text-center">
                            This card is non-transferable | Issue Date: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Classic Design Layout - Centered with ornamental style
    if (design === 'classic') {
        return (
            <div
                className={`id-card-back relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: '16px',
                }}
            >
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-400 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-400 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-400 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-400 rounded-br-2xl"></div>

                <div className="relative h-full flex flex-col items-center justify-center p-4 text-center space-y-3">
                    <div className={`${designStyle.sectionBg} rounded-xl p-3 border-2 ${designStyle.sectionBorder} w-full`}>
                        <h2 className={`text-[10px] font-bold ${designStyle.headerText} mb-2`}>
                            {companyInfo.name || 'M/S Raj Travel'}
                        </h2>
                        <p className="text-[7px] text-gray-700">
                            📞 {companyInfo.phone || '+880 1234-567890'}
                        </p>
                        <p className="text-[7px] text-gray-700">
                            ✉️ {companyInfo.email || 'info@rajtravel.com'}
                        </p>
                        <p className="text-[7px] text-gray-700">
                            📍 {companyInfo.address || 'Dhaka, Bangladesh'}
                        </p>
                    </div>

                    {presentAddress && (
                        <div className={`${designStyle.sectionBg} rounded-xl p-2 border-2 ${designStyle.sectionBorder} w-full`}>
                            <h3 className="text-[8px] font-bold text-gray-800 mb-1">Pilgrim Address</h3>
                            <p className="text-[7px] text-gray-700">
                                {presentAddress.address1}, {presentAddress.city}
                            </p>
                        </div>
                    )}

                    <div className={`${designStyle.emergencyBg} rounded-xl p-2 border-2 ${designStyle.emergencyBorder} w-full`}>
                        <h3 className="text-[8px] font-bold text-red-800 mb-1">Emergency Contact</h3>
                        <p className="text-[7px] text-gray-700">{user?.emergency_contact || 'N/A'}</p>
                    </div>

                    <p className="text-[6px] text-gray-500 mt-auto">
                        Non-Transferable | Issued: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        )
    }

    // Corporate Design Back
    if (design === 'corporate') {
        return (
            <div
                className={`id-card-back relative overflow-hidden bg-linear-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: '12px',
                }}
            >
                <div className="h-full flex flex-col p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-bold text-slate-900">{companyInfo.name || 'M/S Raj Travel'}</h2>
                            <p className="text-[7px] text-slate-600">Official Partner</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                            <h3 className="text-[8px] font-bold text-slate-900 mb-1">Terms and Conditions</h3>
                            <ul className="text-[6px] text-slate-600 space-y-0.5 list-disc list-inside">
                                <li>Card must be worn visibly at all times</li>
                                <li>Report lost cards immediately</li>
                                <li>Non-transferable property</li>
                            </ul>
                        </div>

                        {presentAddress && (
                            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                                <p className="text-[7px] font-semibold text-slate-700">Residential Address:</p>
                                <p className="text-[7px] text-slate-600">{presentAddress.address1}, {presentAddress.city}</p>
                            </div>
                        )}

                        <div className="bg-slate-700 rounded-lg p-2">
                            <p className="text-[7px] font-bold text-yellow-400">Emergency Contact</p>
                            <p className="text-[7px] text-white">{user?.emergency_contact || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[6px] text-slate-500 pt-2 border-t border-slate-300">
                        <span>Issue: {new Date().toLocaleDateString()}</span>
                        <span>ID: {passport?.passport_number?.slice(-6)}</span>
                    </div>
                </div>
            </div>
        )
    }

    // ===== ADD MORE DESIGN LAYOUTS BELOW =====
    // Template for new design:
    // if (design === 'yourDesign') {
    //     return (
    //         <div className="..." style={{ width: cardWidth, height: cardHeight }}>
    //             {/* Your custom layout */}
    //         </div>
    //     )
    // }

    // Default fallback
    return null
}
