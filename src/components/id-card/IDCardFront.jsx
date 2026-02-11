import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardDesigns } from './IDCardTemplates'

/**
 * IDCardFront Component - Renders the front side of pilgrim ID card
 * 
 * To add a new design layout:
 * 1. Add design configuration to CardDesigns in IDCardTemplates.js
 * 2. Add a new if block here: if (design === 'yourDesignName') { return (...) }
 * 3. Copy and modify one of the existing designs as a template
 * 4. The design will automatically work throughout the system
 * 
 * Available designs: modern, classic, minimal, professional
 */

export function IDCardFront({ pilgrim, packageInfo, size, orientation = 'landscape', design = 'modern', companyInfo = {} }) {
    const user = pilgrim?.relationships?.pilgrim?.relationships?.user?.attributes || pilgrim?.user?.attributes || pilgrim?.attributes
    const passport = pilgrim?.relationships?.passport?.attributes || pilgrim?.passport?.attributes || pilgrim?.passports?.[0]?.attributes

    const getInitials = (firstName, lastName) => {
        const first = firstName?.charAt(0)?.toUpperCase() || ''
        const last = lastName?.charAt(0)?.toUpperCase() || ''
        return first + last || 'P'
    }

    const isPortrait = orientation === 'portrait'
    const cardWidth = isPortrait ? size.height : size.width
    const cardHeight = isPortrait ? size.width : size.height
    const designStyle = CardDesigns[design]?.front || CardDesigns.modern.front

    // Calculate scale factor based on card size (standard is baseline)
    const baseWidth = 324 // standard card width
    const scaleFactor = (isPortrait ? size.heightPx : size.widthPx) / baseWidth
    const clampSize = (value, min, max) => Math.max(min, Math.min(max, value))

    // Responsive font and spacing sizes
    const logoSize = Math.max(24, Math.round(24 * scaleFactor))
    const titleSize = Math.max(14, Math.round(14 * scaleFactor))
    const subtitleSize = Math.max(8, Math.round(8 * scaleFactor))
    const avatarSize = Math.max(80, Math.round(80 * scaleFactor))
    const nameSize = Math.max(11, Math.round(11 * scaleFactor))
    const infoSize = Math.max(8, Math.round(8 * scaleFactor))
    const textSize = Math.max(7, Math.round(7 * scaleFactor))
    const padding = Math.max(12, Math.round(12 * scaleFactor))
    // Header icon and logo sizes - reduced and clamped
    const headerIconSize = clampSize(Math.round(logoSize * 0.9), 22, 28)
    const headerIconSizeLg = clampSize(Math.round(logoSize * 1.1), 26, 32)
    const headerLogoSize = clampSize(Math.round(logoSize * 0.85), 20, 26)
    const headerLogoSizeLg = clampSize(Math.round(logoSize * 1), 24, 30)

    // Modern Design Layout - Original horizontal/vertical flex
    if (design === 'modern') {
        return (
            <div
                className={`id-card-front relative overflow-hidden bg-linear-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: `${Math.max(12, 12 * scaleFactor)}px`,
                    backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #eff6ff)',
                    borderColor: '#bfdbfe',
                }}
            >
                <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id={`grid-${design}`} width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="1" fill={designStyle.patternColor} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#grid-${design})`} />
                    </svg>
                </div>

                <div className="relative h-full flex flex-col" style={{ padding: `${padding}px` }}>
                    {isPortrait ? (
                        // Portrait Layout - Centered vertical design
                        <>
                            <div className="text-center" style={{ marginBottom: `${padding * 0.2}px`, paddingBottom: `${padding * 0.3}px`, borderBottom: '1px solid #bfdbfe' }}>
                                <div className="flex items-center justify-center" style={{ marginBottom: `${padding * 0.1}px` }}>
                                    <img src="/logo.png" alt="Logo" style={{ height: `${Math.max(32, headerLogoSize * 1.2)}px`, width: `${Math.max(32, headerLogoSize * 1.2)}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                                <h1 className="font-bold text-blue-600" style={{ fontSize: `${titleSize + 2}px`, lineHeight: '1.1', fontFamily: "'Hind Siliguri', sans-serif" }}>{companyInfo.nameBn || 'মেসার্স রাজ ট্রাভেলস্'}</h1>
                                <h2 className={`font-bold ${designStyle.headerText}`} style={{ fontSize: `${titleSize}px`, lineHeight: '1.2' }}>{companyInfo.name || 'M/S Raj Travels'}</h2>
                                <p className={`${designStyle.subText} font-medium`} style={{ fontSize: `${subtitleSize}px`, lineHeight: '1.2' }}>Hajj License No: {companyInfo.hlNumber || '0935'}</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-start" style={{ paddingTop: `${padding * 0.5}px` }}>
                                <Avatar className={`border-4 ${designStyle.avatarBorder} shadow-lg`} style={{ height: `${Math.max(80, avatarSize * 1.1)}px`, width: `${Math.max(80, avatarSize * 1.1)}px`, marginBottom: `${padding * 0.2}px`, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AvatarImage src={user?.avatar} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <AvatarFallback className={`${designStyle.avatarBg} ${designStyle.avatarText} font-bold`} style={{ fontSize: `${Math.max(20, nameSize * 1.8)}px`, backgroundColor: '#dbeafe', color: '#1e40af', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                        {getInitials(user?.firstName, user?.lastName)}
                                    </AvatarFallback>
                                </Avatar>

                                <h3 className="font-bold text-gray-900 text-center truncate w-full" style={{ fontSize: `${nameSize}px`, marginBottom: `${padding * 0.3}px` }}>{user?.fullName}</h3>

                                <div className="text-gray-700 w-full" style={{ display: 'flex', flexDirection: 'column', gap: `${padding * 0.15}px`, paddingLeft: `${padding * 0.5}px`, paddingRight: `${padding * 0.5}px` }}>
                                    <div style={{ display: 'flex', fontSize: `${infoSize}px` }}><span className="font-medium" style={{ minWidth: '90px', flexShrink: 0 }}>PASSPORT NO</span><span style={{ flexShrink: 0, marginRight: '4px' }}>:</span><span className="truncate">{passport?.passportNumber}</span></div>
                                    <div style={{ display: 'flex', fontSize: `${infoSize}px` }}><span className="font-medium" style={{ minWidth: '90px', flexShrink: 0 }}>FATHER'S NAME</span><span style={{ flexShrink: 0, marginRight: '4px' }}>:</span><span className="truncate">{user?.fatherName}</span></div>
                                    <div style={{ display: 'flex', fontSize: `${infoSize}px` }}><span className="font-medium" style={{ minWidth: '90px', flexShrink: 0 }}>NID/BIRTH</span><span style={{ flexShrink: 0, marginRight: '4px' }}>:</span><span className="truncate">{user?.nid}</span></div>
                                    <div style={{ display: 'flex', fontSize: `${infoSize}px` }}><span className="font-medium" style={{ minWidth: '90px', flexShrink: 0 }}>DATE OF BIRTH</span><span style={{ flexShrink: 0, marginRight: '4px' }}>:</span><span className="truncate">{user?.dateOfBirth}</span></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Landscape Layout - Horizontal design
                        <>
                            <div className={`border-b ${designStyle.headerBorder}`} style={{ paddingBottom: `${padding * 0.6}px`, marginBottom: `${padding * 0.6}px` }}>
                                <div className="flex items-center" style={{ gap: `${padding * 0.6}px` }}>
                                    <img src="/logo.png" alt="Logo" style={{ height: `${Math.max(40, headerLogoSize * 1.6)}px`, width: `${Math.max(40, headerLogoSize * 1.6)}px`, flexShrink: 0 }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                                    <div className="flex-1">
                                        <h1 className="font-bold text-blue-600" style={{ fontSize: `${titleSize + 2}px`, fontFamily: "'Hind Siliguri', sans-serif" }}>{companyInfo.nameBn || 'মেসার্স রাজ ট্রাভেলস্'}</h1>
                                        <h2 className={`font-bold ${designStyle.headerText}`} style={{ fontSize: `${titleSize}px` }}>{companyInfo.name || 'M/S. RAJ TRAVELS'}</h2>
                                        <p className={`${designStyle.subText} font-medium`} style={{ fontSize: `${subtitleSize}px` }}>Hajj License No: {companyInfo.hlNumber || '0935'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex items-center" style={{ gap: `${padding}px` }}>
                                <div className="shrink-0">
                                    <Avatar className={`border-2 ${designStyle.avatarBorder} shadow-md`} style={{ height: `${avatarSize}px`, width: `${avatarSize}px`, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AvatarImage src={user?.avatar} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <AvatarFallback className={`${designStyle.avatarBg} ${designStyle.avatarText} font-semibold`} style={{ backgroundColor: '#dbeafe', color: '#1e40af', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                            {getInitials(user?.firstName, user?.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-gray-700" style={{ display: 'flex', flexDirection: 'column', gap: `${padding * 0.15}px` }}>
                                        <p className="truncate" style={{ fontSize: `${infoSize}px` }}><span className="font-medium" style={{ display: 'inline-block', width: '85px' }}>NAME</span>: {user?.fullName}</p>
                                        <p className="truncate" style={{ fontSize: `${infoSize}px` }}><span className="font-medium" style={{ display: 'inline-block', width: '85px' }}>PASSPORT NO</span>: {passport?.passportNumber}</p>
                                        <p className="truncate" style={{ fontSize: `${infoSize}px` }}><span className="font-medium" style={{ display: 'inline-block', width: '85px' }}>FATHER'S NAME</span>: {user?.fatherName}</p>
                                        <p className="truncate" style={{ fontSize: `${infoSize}px` }}><span className="font-medium" style={{ display: 'inline-block', width: '85px' }}>NID/BIRTH REG NO</span>: {user?.nid}</p>
                                        <p className="truncate" style={{ fontSize: `${infoSize}px` }}><span className="font-medium" style={{ display: 'inline-block', width: '85px' }}>DATE OF BIRTH</span>: {user?.dateOfBirth}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    // Classic Design Layout - Responsive layout based on orientation
    if (design === 'classic') {
        const cornerSize = Math.max(40, Math.round(48 * scaleFactor))
        return (
            <div
                className={`id-card-front relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: `${Math.max(16, 16 * scaleFactor)}px`,
                    backgroundImage: 'linear-gradient(to bottom right, #fef3c7, #ffffff, #fef3c7)',
                    borderColor: '#fcd34d',
                }}
            >
                <div className="absolute top-0 left-0 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fbbf24' }}></div>
                <div className="absolute top-0 right-0 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fbbf24' }}></div>
                <div className="absolute bottom-0 left-0 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fbbf24' }}></div>
                <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-amber-400 rounded-br-2xl" style={{ width: `${cornerSize}px`, height: `${cornerSize}px`, borderColor: '#fbbf24' }}></div>

                {isPortrait ? (
                    // Portrait Layout - Centered
                    <div className="relative h-full flex flex-col items-center justify-center text-center" style={{ padding: `${padding}px` }}>
                        <div style={{ marginBottom: `${padding}px` }}>
                            <div className="flex flex-col items-center" style={{ gap: `${padding * 0.3}px`, marginBottom: `${padding * 0.4}px` }}>
                                <img src="/logo.png" alt="Logo" className="mx-auto object-contain" style={{ height: `${headerLogoSizeLg}px`, width: `${headerLogoSizeLg}px` }} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                            <h1 className={`font-bold ${designStyle.headerText}`} style={{ fontSize: `${titleSize}px` }}>{companyInfo.name || 'M/S Raj Travel'}</h1>
                            <p className={`${designStyle.subText} font-medium`} style={{ fontSize: `${subtitleSize}px` }}>Hajj License: {companyInfo.hajjLicense || '1234567890'}</p>
                        </div>

                        <Avatar className={`border-4 ${designStyle.avatarBorder} shadow-xl`} style={{ height: `${Math.max(96, avatarSize * 1.2)}px`, width: `${Math.max(96, avatarSize * 1.2)}px`, marginBottom: `${padding * 0.6}px`, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AvatarImage src={user?.avatar} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <AvatarFallback className={`${designStyle.avatarBg} ${designStyle.avatarText} font-bold`} style={{ fontSize: `${Math.max(24, nameSize * 2)}px`, backgroundColor: '#fef3c7', color: '#92400e', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                {getInitials(user?.firstName, user?.lastName)}
                            </AvatarFallback>
                        </Avatar>

                        <h2 className="font-extrabold text-gray-900" style={{ fontSize: `${Math.max(12, nameSize + 1)}px` }}>{user?.fullName}</h2>
                        <p className="text-gray-700" style={{ fontSize: `${Math.max(10, nameSize - 1)}px`, marginBottom: `${padding * 0.6}px`, fontFamily: "'Hind Siliguri', sans-serif" }}>{user?.fullNameBn}</p>

                        <div className="grid grid-cols-2 text-gray-700" style={{ gap: `${padding * 0.3}px ${padding * 0.6}px`, fontSize: `${subtitleSize}px`, paddingLeft: `${padding * 0.8}px`, paddingRight: `${padding * 0.8}px` }}>
                            <div className="text-right font-medium">Passport:</div>
                            <div className="text-left">{passport?.passportNumber}</div>
                            <div className="text-right font-medium">NID:</div>
                            <div className="text-left">{user?.nid}</div>
                            <div className="text-right font-medium">DOB:</div>
                            <div className="text-left">{user?.dateOfBirth}</div>
                        </div>

                        <div className="flex items-center justify-between" style={{ marginTop: `${padding}px`, paddingTop: `${padding * 0.6}px`, borderTop: '1px solid rgb(251, 191, 36, 0.3)' }}>
                            <img src="/kaaba2.png" alt="Makkah" style={{ height: `${headerIconSize}px`, width: `${headerIconSize}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <img src="/madinah2.png" alt="Madinah" style={{ height: `${headerIconSize}px`, width: `${headerIconSize}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    </div>
                ) : (
                    // Landscape Layout - Horizontal
                    <div className="relative h-full flex flex-col" style={{ padding: `${padding}px` }}>
                        <div className="text-center border-b border-amber-300" style={{ paddingBottom: `${padding * 0.6}px`, marginBottom: `${padding * 0.6}px` }}>
                            <div className="flex items-center justify-center mb-1" style={{ gap: `${padding * 0.4}px` }}>
                                <img src="/logo.png" alt="Logo" className="object-contain" style={{ height: `${headerLogoSize}px`, width: `${headerLogoSize}px`, flexShrink: 0 }} onError={(e) => e.target.style.display = 'none'} />
                                <h1 className={`font-bold ${designStyle.headerText}`} style={{ fontSize: `${titleSize}px` }}>{companyInfo.name || 'M/S Raj Travel'}</h1>
                            </div>
                            <p className={`${designStyle.subText} font-medium`} style={{ fontSize: `${subtitleSize}px` }}>Hajj & Umrah Management</p>
                        </div>

                        <div className="flex-1 flex items-center" style={{ gap: `${padding}px` }}>
                            <div className="shrink-0">
                                <Avatar className={`border-4 ${designStyle.avatarBorder} shadow-xl`} style={{ height: `${avatarSize}px`, width: `${avatarSize}px`, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AvatarImage src={user?.avatar} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <AvatarFallback className={`${designStyle.avatarBg} ${designStyle.avatarText} font-bold`} style={{ fontSize: `${Math.max(20, nameSize * 1.8)}px`, backgroundColor: '#fef3c7', color: '#92400e', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                        {getInitials(user?.firstName, user?.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h2 className="font-extrabold text-gray-900 truncate" style={{ fontSize: `${nameSize}px` }}>{user?.fullName}</h2>
                                <p className="text-gray-700 truncate" style={{ fontSize: `${Math.max(9, nameSize - 2)}px`, marginBottom: `${padding * 0.4}px`, fontFamily: "'Hind Siliguri', sans-serif" }}>{user?.fullNameBn}</p>
                                <div className="text-gray-700" style={{ display: 'flex', flexDirection: 'column', gap: `${padding * 0.2}px`, fontSize: `${infoSize}px` }}>
                                    <p className="truncate"><span className="font-semibold">Passport:</span> {passport?.passportNumber}</p>
                                    <p className="truncate"><span className="font-semibold">NID:</span> {user?.nid}</p>
                                    <p className="truncate"><span className="font-semibold">DOB:</span> {user?.dateOfBirth}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-amber-300 flex items-center justify-between" style={{ paddingTop: `${padding * 0.6}px`, marginTop: `${padding * 0.6}px` }}>
                            <img src="/kaaba2.png" alt="Makkah" style={{ height: `${headerIconSize}px`, width: `${headerIconSize}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <img src="/madinah2.png" alt="Madinah" style={{ height: `${headerIconSize}px`, width: `${headerIconSize}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Corporate Design Layout - Professional dark theme
    if (design === 'corporate') {
        return (
            <div
                className={`id-card-front relative overflow-hidden bg-linear-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: `${Math.max(12, 12 * scaleFactor)}px`,
                    backgroundImage: 'linear-gradient(to bottom right, #334155, #1e293b, #0f172a)',
                    borderColor: '#475569',
                }}
            >
                {/* Angular accent shapes */}
                <div className="absolute top-0 left-0 w-1/2 h-1/3 bg-linear-to-br from-blue-500/20 to-transparent" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', backgroundImage: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), transparent)' }}></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/3 bg-linear-to-tl from-cyan-500/20 to-transparent" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)', backgroundImage: 'linear-gradient(to top left, rgba(6, 182, 212, 0.2), transparent)' }}></div>

                <div className="relative h-full flex flex-col" style={{ padding: `${padding}px` }}>
                    <div className={`flex items-center justify-center border-b-2 ${designStyle.headerBorder}`} style={{ paddingBottom: `${padding * 0.6}px`, marginBottom: `${padding * 0.6}px`, gap: `${padding * 0.5}px`, borderColor: '#eab308' }}>
                        <div className="bg-yellow-500/20 rounded-md flex items-center justify-center border border-yellow-500" style={{ width: `${clampSize(Math.round(28 * scaleFactor), 26, 30)}px`, height: `${clampSize(Math.round(28 * scaleFactor), 26, 30)}px`, flexShrink: 0, backgroundColor: 'rgba(234, 179, 8, 0.2)', borderColor: '#eab308' }}>
                            <img src="/logo.png" alt="Logo" className="object-contain" style={{ height: `${clampSize(Math.round(18 * scaleFactor), 16, 20)}px`, width: `${clampSize(Math.round(18 * scaleFactor), 16, 20)}px` }} onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <div>
                            <h1 className={`font-bold ${designStyle.headerText} uppercase tracking-wide`} style={{ fontSize: `${titleSize}px`, color: '#facc15' }}>{companyInfo.name || 'M/S Raj Travel'}</h1>
                            <p className={designStyle.subText} style={{ fontSize: `${subtitleSize}px`, color: '#d1d5db' }}>Hajj License: {companyInfo.hajjLicense}</p>
                        </div>
                    </div>

                    {isPortrait ? (
                        // Portrait Layout - Avatar on top, info below
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <Avatar className={`border-4 ${designStyle.avatarBorder} shadow-lg`} style={{ height: `${Math.max(96, avatarSize * 1.2)}px`, width: `${Math.max(96, avatarSize * 1.2)}px`, marginBottom: `${padding * 0.6}px`, borderColor: '#22d3ee', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AvatarImage src={user?.avatar} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <AvatarFallback className="bg-slate-600 text-cyan-300 font-bold" style={{ fontSize: `${Math.max(24, nameSize * 2)}px`, backgroundColor: '#475569', color: '#67e8f9', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                    {getInitials(user?.firstName, user?.lastName)}
                                </AvatarFallback>
                            </Avatar>

                            <h2 className="font-bold text-white" style={{ fontSize: `${Math.max(12, nameSize + 1)}px`, color: '#ffffff' }}>{user?.fullName}</h2>
                            <p className="text-gray-300" style={{ fontSize: `${Math.max(10, nameSize - 1)}px`, marginBottom: `${padding * 0.6}px`, color: '#d1d5db', fontFamily: "'Hind Siliguri', sans-serif" }}>{user?.fullNameBn}</p>

                            <div className="grid grid-cols-2 text-gray-300" style={{ gap: `${padding * 0.3}px ${padding * 0.6}px`, fontSize: `${subtitleSize}px`, paddingLeft: `${padding * 0.8}px`, paddingRight: `${padding * 0.8}px`, color: '#d1d5db' }}>
                                <div className="text-right font-medium text-cyan-400" style={{ color: '#22d3ee' }}>Passport:</div>
                                <div className="text-left">{passport?.passportNumber}</div>
                                <div className="text-right font-medium text-cyan-400" style={{ color: '#22d3ee' }}>NID:</div>
                                <div className="text-left">{user?.nid}</div>
                                <div className="text-right font-medium text-cyan-400" style={{ color: '#22d3ee' }}>DOB:</div>
                                <div className="text-left">{user?.dateOfBirth}</div>
                            </div>
                        </div>
                    ) : (
                        // Landscape Layout - Side by side
                        <div className="flex-1 flex items-center" style={{ gap: `${padding}px` }}>
                            <Avatar className={`border-2 ${designStyle.avatarBorder} shadow-lg shrink-0`} style={{ height: `${avatarSize}px`, width: `${avatarSize}px`, borderColor: '#22d3ee', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AvatarImage src={user?.avatar} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <AvatarFallback className="bg-slate-600 text-cyan-300 font-bold" style={{ fontSize: `${Math.max(20, nameSize * 1.8)}px`, backgroundColor: '#475569', color: '#67e8f9', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                    {getInitials(user?.firstName, user?.lastName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-white" style={{ fontSize: `${nameSize}px`, color: '#ffffff' }}>{user?.fullName}</h2>
                                <p className="text-gray-300 truncate" style={{ fontSize: `${Math.max(9, nameSize - 2)}px`, marginBottom: `${padding * 0.4}px`, color: '#d1d5db', fontFamily: "'Hind Siliguri', sans-serif" }}>{user?.fullNameBn}</p>
                                <div className="text-gray-300" style={{ display: 'flex', flexDirection: 'column', gap: `${padding * 0.2}px`, fontSize: `${textSize}px`, color: '#d1d5db' }}>
                                    <p className="truncate"><span className="text-cyan-400" style={{ color: '#22d3ee' }}>Passport:</span> {passport?.passportNumber}</p>
                                    <p className="truncate"><span className="text-cyan-400" style={{ color: '#22d3ee' }}>NID:</span> {user?.nid}</p>
                                    <p className="truncate"><span className="text-cyan-400" style={{ color: '#22d3ee' }}>DOB:</span> {user?.dateOfBirth}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between" style={{ marginTop: `${padding}px`, paddingTop: `${padding * 0.6}px`, borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
                        <img src="/kaaba3.png" alt="Makkah" style={{ height: `${headerIconSize}px`, width: `${headerIconSize}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                        <img src="/madinah4.png" alt="Madinah" style={{ height: `${headerIconSize}px`, width: `${headerIconSize}px` }} className="object-contain" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                </div>
            </div>
        )
    }

    // ===== ADD MORE DESIGN LAYOUTS BELOW ======
    // Template for new design:
    // if (design === 'yourDesign') {
    //     return (
    //         <div className="..." style={{ width: cardWidth, height: cardHeight }}>
    //             {/* Your custom layout */}
    //         </div>
    //     )
    // }

    // Default fallback to modern if design not found
    return null
}
