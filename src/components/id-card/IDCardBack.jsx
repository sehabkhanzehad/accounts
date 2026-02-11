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

    // Modern Design Layout - Clean Minimal Design
    if (design === 'modern') {
        const iconSize = Math.max(22, Math.round(22 * scaleFactor))

        return (
            <div
                className="id-card-back relative overflow-hidden"
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: `${Math.max(10, 10 * scaleFactor)}px`,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                }}
            >
                <div className="h-full flex flex-col" style={{ padding: `${padding * 0.7}px` }}>
                    {/* Header - Company Info */}
                    <div className="text-center" style={{
                        paddingBottom: `${padding * 0.4}px`,
                        marginBottom: `${padding * 0.4}px`,
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <h1 className="font-bold text-gray-800" style={{ fontSize: `${titleSize + 2}px` }}>
                            {companyInfo.name || 'M/S. RAJ TRAVELS'}
                        </h1>
                        <p className="text-gray-500" style={{ fontSize: `${subtitleSize}px`, marginTop: `${padding * 0.15}px` }}>
                            {companyInfo.phone || '+8801799-745020'} | {companyInfo.website || 'www.msrajtravels.com'}
                        </p>
                        <p className="text-gray-500" style={{ fontSize: `${subtitleSize}px` }}>
                            {companyInfo.address || 'N/A'}
                        </p>
                    </div>

                    {/* Hotels Container */}
                    <div className="flex-1 flex flex-col justify-center" style={{ gap: `${padding * 0.5}px` }}>
                        {/* Makkah Hotel Section */}
                        <div style={{
                            border: '1px solid #d1fae5',
                            borderRadius: `${Math.max(6, 6 * scaleFactor)}px`,
                            overflow: 'hidden'
                        }}>
                            <div className="flex items-center" style={{
                                backgroundColor: '#ecfdf5',
                                padding: `${padding * 0.25}px ${padding * 0.4}px`,
                                borderBottom: '1px solid #d1fae5'
                            }}>
                                <img src="/kaaba2.png" alt="Makkah" style={{ height: `${iconSize}px`, width: `${iconSize}px`, marginRight: `${padding * 0.3}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                                <span className="font-medium" style={{ fontSize: `${labelSize}px`, color: '#047857' }}>MAKKAH HOTEL</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: `${padding * 0.3}px ${padding * 0.4}px` }}>
                                <div style={{ fontSize: `${textSize}px`, lineHeight: '1.4', color: '#374151' }}>
                                    <p><span className="font-medium">Hotel:</span> {companyInfo.makkahHotelName || 'N/A'}</p>
                                    <p><span className="font-medium">Address:</span> {companyInfo.makkahHotelAddress || 'N/A'}</p>
                                    <p><span className="font-medium">Contact:</span> {companyInfo.makkahHotelContact || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Madina Hotel Section */}
                        <div style={{
                            border: '1px solid #ede9fe',
                            borderRadius: `${Math.max(6, 6 * scaleFactor)}px`,
                            overflow: 'hidden'
                        }}>
                            <div className="flex items-center" style={{
                                backgroundColor: '#f5f3ff',
                                padding: `${padding * 0.25}px ${padding * 0.4}px`,
                                borderBottom: '1px solid #ede9fe'
                            }}>
                                <img src="/madinah2.png" alt="Madina" style={{ height: `${iconSize}px`, width: `${iconSize}px`, marginRight: `${padding * 0.3}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                                <span className="font-medium" style={{ fontSize: `${labelSize}px`, color: '#6d28d9' }}>MADINA HOTEL</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: `${padding * 0.3}px ${padding * 0.4}px` }}>
                                <div style={{ fontSize: `${textSize}px`, lineHeight: '1.4', color: '#374151' }}>
                                    <p><span className="font-medium">Hotel:</span> {companyInfo.madinaHotelName || 'N/A'}</p>
                                    <p><span className="font-medium">Address:</span> {companyInfo.madinaHotelAddress || 'N/A'}</p>
                                    <p><span className="font-medium">Contact:</span> {companyInfo.madinaHotelContact || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact & Footer */}
                    <div style={{ marginTop: `${padding * 0.4}px` }}>
                        <div className="text-center" style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            padding: `${padding * 0.35}px`,
                            borderRadius: `${Math.max(6, 6 * scaleFactor)}px`,
                        }}>
                            <p style={{ fontSize: `${labelSize - 1}px`, color: '#b91c1c' }}>EMERGENCY CONTACT</p>
                            <p className="font-bold" style={{ fontSize: `${titleSize + 1}px`, color: '#dc2626' }}>{companyInfo.emergencyContact || '+8802587738935'}</p>
                        </div>
                        <div className="flex justify-between items-center" style={{ paddingTop: `${padding * 0.25}px` }}>
                            <p style={{ fontSize: `${footerSize}px`, color: '#9ca3af' }}>Non-Transferable</p>
                            <p style={{ fontSize: `${footerSize}px`, color: '#9ca3af' }}>Issued: {new Date().toLocaleDateString()}</p>
                        </div>
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
                        <p className="text-gray-700" style={{ fontSize: `${textSize}px` }}>{companyInfo.emergencyContact || '+8802587738935'}</p>
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
                            <p className="text-white" style={{ fontSize: `${textSize}px`, color: '#ffffff' }}>{companyInfo.emergencyContact || '+8802587738935'}</p>
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
