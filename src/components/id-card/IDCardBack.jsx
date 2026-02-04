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

    // Calculate scale factor based on card size
    const baseWidth = 324
    const scaleFactor = (isPortrait ? size.heightPx : size.widthPx) / baseWidth
    const clampSize = (value, min, max) => Math.max(min, Math.min(max, value))
    const titleSize = Math.max(10, Math.round(10 * scaleFactor))
    const subtitleSize = Math.max(7, Math.round(7 * scaleFactor))
    const labelSize = Math.max(8, Math.round(8 * scaleFactor))
    const textSize = Math.max(7, Math.round(7 * scaleFactor))
    const footerSize = Math.max(6, Math.round(6 * scaleFactor))
    const padding = Math.max(12, Math.round(12 * scaleFactor))
    // Header icon sizes - reduced and clamped
    const headerIconSize = clampSize(Math.round(titleSize * 2.2), 22, 28)
    const headerIconSizeLg = clampSize(Math.round(titleSize * 2.6), 26, 32)

    // Modern Design Layout
    if (design === 'modern') {
        // Check if it's landscape with standard or custom size
        const isCompactLayout = !isPortrait && (size.name === 'Standard Card' || size.name === 'Custom Size')

        return (
            <div
                className={`id-card-back relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: `${Math.max(12, 12 * scaleFactor)}px`,
                    backgroundImage: 'linear-gradient(to bottom right, #f0fdf4, #ffffff, #f0fdf4)',
                    borderColor: '#bbf7d0',
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

                <div className="relative h-full flex flex-col" style={{ padding: `${padding}px` }}>
                    {isCompactLayout ? (
                        <div className={`border-b ${designStyle.headerBorder}`} style={{ paddingBottom: `${padding * 0.6}px`, marginBottom: `${padding * 0.6}px` }}>
                            <div className="flex items-center" style={{ gap: `${padding * 0.6}px` }}>
                                <img src="/logo.png" alt="Logo" style={{ height: `${Math.max(36, titleSize * 2.8)}px`, width: `${Math.max(36, titleSize * 2.8)}px`, flexShrink: 0 }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                                <div className="flex-1">
                                    <h2 className={`font-bold ${designStyle.headerText}`} style={{ fontSize: `${titleSize}px` }}>
                                        {companyInfo.name || 'M/S Raj Travels'}
                                    </h2>
                                    <p className="text-gray-600" style={{ fontSize: `${subtitleSize}px`, marginTop: `${padding * 0.1}px` }}>
                                        {companyInfo.phone || '+880 1234-567890'} | {companyInfo.email || 'info@msrajtravel.com'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`border-b ${designStyle.headerBorder} text-center`} style={{ paddingBottom: `${padding * 0.6}px`, marginBottom: `${padding * 0.6}px` }}>
                            <div className="flex flex-col items-center" style={{ gap: `${padding * 0.3}px` }}>
                                <img src="/logo.png" alt="Logo" style={{ height: `${Math.max(40, titleSize * 3)}px`, width: `${Math.max(40, titleSize * 3)}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                                <div>
                                    <h2 className={`font-bold ${designStyle.headerText}`} style={{ fontSize: `${titleSize}px` }}>
                                        {companyInfo.name || 'M/S Raj Travels'}
                                    </h2>
                                    <p className="text-gray-600" style={{ fontSize: `${subtitleSize}px`, marginTop: `${padding * 0.2}px` }}>
                                        {companyInfo.phone || '+880 1234-567890'}
                                    </p>
                                    <p className="text-gray-600" style={{ fontSize: `${subtitleSize}px` }}>
                                        {companyInfo.email || 'info@msrajtravel.com'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: `${padding * 0.6}px` }}>
                        <div>
                            <h3 className="font-semibold text-gray-800" style={{ fontSize: `${labelSize}px`, marginBottom: `${padding * 0.3}px` }}>Address:</h3>
                            <div className={`${designStyle.sectionBg} rounded border ${designStyle.sectionBorder}`} style={{ padding: `${padding * 0.4}px` }}>
                                <p className="text-gray-700" style={{ fontSize: `${textSize}px` }}>
                                    {companyInfo.address || 'Dhaka, Bangladesh'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800" style={{ fontSize: `${labelSize}px`, marginBottom: `${padding * 0.3}px` }}>Emergency Contact:</h3>
                            <div className={`${designStyle.emergencyBg} rounded border ${designStyle.emergencyBorder}`} style={{ padding: `${padding * 0.4}px` }}>
                                <p className="text-gray-700" style={{ fontSize: `${textSize}px` }}>
                                    <span className="font-medium">Phone:</span> {companyInfo?.emergencyContact || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`border-t ${designStyle.headerBorder}`} style={{ paddingTop: `${padding * 0.6}px`, marginTop: `${padding * 0.6}px` }}>
                        <p className="text-gray-500 text-center" style={{ fontSize: `${footerSize}px` }}>
                            This card is non-transferable | Issue Date: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Classic Design Layout - Centered with ornamental style
    if (design === 'classic') {
        const cornerSize = Math.max(40, Math.round(48 * scaleFactor))
        const logoSize = clampSize(Math.round(titleSize * 3), 32, 48)

        return (
            <div
                className={`id-card-back relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: `${Math.max(16, 16 * scaleFactor)}px`,
                    backgroundImage: 'linear-gradient(to bottom right, #ffedd5, #ffffff, #ffedd5)',
                    borderColor: '#fb923c',
                }}
            >
                <div className="absolute top-0 left-0 border-t-4 border-l-4 border-orange-400 rounded-tl-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fb923c' }}></div>
                <div className="absolute top-0 right-0 border-t-4 border-r-4 border-orange-400 rounded-tr-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fb923c' }}></div>
                <div className="absolute bottom-0 left-0 border-b-4 border-l-4 border-orange-400 rounded-bl-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fb923c' }}></div>
                <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-orange-400 rounded-br-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fb923c' }}></div>

                <div className="relative h-full flex flex-col items-center justify-center text-center" style={{ padding: `${padding}px`, gap: `${padding * 0.8}px` }}>
                    {size.name !== 'Standard Card' && size.name !== 'Custom Size' && (
                        <img src="/logo.png" alt="Logo" className="object-contain" style={{ height: `${logoSize}px`, width: `${logoSize}px` }} onError={(e) => e.target.style.display = 'none'} />
                    )}

                    <div className={`${designStyle.sectionBg} rounded-xl border-2 ${designStyle.sectionBorder} w-full`} style={{ padding: `${padding}px` }}>
                        <h2 className={`font-bold ${designStyle.headerText}`} style={{ fontSize: `${titleSize}px`, marginBottom: `${padding * 0.6}px` }}>
                            {companyInfo.name || 'M/S Raj Travels'}
                        </h2>
                        <p className="text-gray-700" style={{ fontSize: `${subtitleSize}px` }}>
                            Phone: {companyInfo.phone || '+880 1234-567890'}
                        </p>
                        <p className="text-gray-700" style={{ fontSize: `${subtitleSize}px` }}>
                            {companyInfo.email || 'info@rajtravel.com'}
                        </p>
                        <p className="text-gray-700" style={{ fontSize: `${subtitleSize}px` }}>
                            Address: {companyInfo.address || 'Dhaka, Bangladesh'}
                        </p>
                    </div>

                    <div className={`${designStyle.emergencyBg} rounded-xl border-2 ${designStyle.emergencyBorder} w-full`} style={{ padding: `${padding * 0.6}px` }}>
                        <h3 className="font-bold text-red-800" style={{ fontSize: `${labelSize}px`, marginBottom: `${padding * 0.3}px` }}>Emergency Contact</h3>
                        <p className="text-gray-700" style={{ fontSize: `${textSize}px` }}>{companyInfo.emergencyContact || 'N/A'}</p>
                    </div>

                    <p className="text-gray-500 mt-auto" style={{ fontSize: `${footerSize}px` }}>
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
                    borderRadius: `${Math.max(12, 12 * scaleFactor)}px`,
                    backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0, #cbd5e1)',
                    borderColor: '#94a3b8',
                }}
            >
                <div className="h-full flex flex-col" style={{ padding: `${padding}px` }}>
                    <div className="flex items-center justify-center" style={{ marginBottom: `${padding * 0.6}px`, gap: `${padding * 0.5}px` }}>
                        <div className="bg-slate-700 rounded flex items-center justify-center" style={{ width: `${clampSize(Math.round(28 * scaleFactor), 26, 30)}px`, height: `${clampSize(Math.round(28 * scaleFactor), 26, 30)}px`, flexShrink: 0, backgroundColor: '#334155' }}>
                            <img src="/logo.png" alt="Logo" className="object-contain" style={{ height: `${clampSize(Math.round(18 * scaleFactor), 16, 20)}px`, width: `${clampSize(Math.round(18 * scaleFactor), 16, 20)}px` }} onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900" style={{ fontSize: `${titleSize}px`, color: '#0f172a' }}>{companyInfo.name || 'M/S Raj Travel'}</h2>
                            <p className="text-slate-600" style={{ fontSize: `${subtitleSize}px`, color: '#475569' }}>Hajj License: {companyInfo.hlNumber || '0935'}</p>
                        </div>
                    </div>

                    <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: `${padding * 0.6}px` }}>
                        {size.name !== 'Standard Card' && size.name !== 'Custom Size' && (
                            <div className="bg-slate-50 rounded-lg border border-slate-200" style={{ padding: `${padding * 0.6}px`, backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                <h3 className="font-bold text-slate-900" style={{ fontSize: `${labelSize}px`, marginBottom: `${padding * 0.3}px`, color: '#0f172a' }}>Terms and Conditions</h3>
                                <ul className="text-slate-600 list-disc list-inside" style={{ fontSize: `${footerSize}px`, display: 'flex', flexDirection: 'column', gap: `${padding * 0.15}px`, color: '#475569' }}>
                                    <li>Card must be worn visibly at all times</li>
                                    <li>Report lost cards immediately</li>
                                    <li>Non-transferable property</li>
                                </ul>
                            </div>
                        )}

                        <div className="bg-slate-50 rounded-lg border border-slate-200" style={{ padding: `${padding * 0.6}px`, backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                            <p className="font-semibold text-slate-700" style={{ fontSize: `${textSize}px`, color: '#334155' }}>Address:</p>
                            <p className="text-slate-600" style={{ fontSize: `${textSize}px`, color: '#475569' }}>{companyInfo.address || 'N/A'}</p>
                        </div>

                        <div className="bg-slate-700 rounded-lg" style={{ padding: `${padding * 0.6}px`, backgroundColor: '#334155' }}>
                            <p className="font-bold text-yellow-400" style={{ fontSize: `${textSize}px`, color: '#facc15' }}>Emergency Contact</p>
                            <p className="text-white" style={{ fontSize: `${textSize}px`, color: '#ffffff' }}>{companyInfo.emergencyContact || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="text-center text-slate-500 border-t border-slate-300" style={{ fontSize: `${footerSize}px`, paddingTop: `${padding * 0.6}px`, color: '#64748b', borderColor: '#cbd5e1' }}>
                        <span>Issue Date: {new Date().toLocaleDateString()}</span>
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
