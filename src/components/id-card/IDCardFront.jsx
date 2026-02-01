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

    // Modern Design Layout - Original horizontal/vertical flex
    if (design === 'modern') {
        return (
            <div
                className={`id-card-front relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: '12px',
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

                <div className="relative h-full flex flex-col p-3">
                    <div className={`text-center border-b ${designStyle.headerBorder} pb-2 mb-2`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <h1 className={`text-sm font-bold ${designStyle.headerText}`}>{companyInfo.name || 'M/S Raj Travel'}</h1>
                        </div>
                        <p className={`text-[8px] ${designStyle.subText} font-medium`}>Hajj & Umrah Management</p>
                    </div>

                    <div className={`flex-1 flex ${isPortrait ? 'flex-col items-center' : 'items-center gap-3'}`}>
                        <div className="flex-shrink-0">
                            <Avatar className={`${isPortrait ? 'h-24 w-24' : 'h-20 w-20'} border-2 ${designStyle.avatarBorder} shadow-md`}>
                                <AvatarImage src={user?.avatar} alt={user?.fullName} />
                                <AvatarFallback className={`${designStyle.avatarBg} ${designStyle.avatarText} font-semibold`}>
                                    {getInitials(user?.firstName, user?.lastName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className={`flex-1 ${isPortrait ? 'text-center mt-2' : ''} min-w-0`}>
                            <h2 className="text-[11px] font-bold text-gray-900 truncate">{user?.fullName}</h2>
                            <p className="text-[9px] text-gray-600 truncate">{user?.fullNameBn}</p>
                            <div className="mt-1.5 space-y-0.5 text-[8px] text-gray-700">
                                <p className="truncate"><span className="font-medium">Passport:</span> {passport?.passport_number}</p>
                                <p className="truncate"><span className="font-medium">Phone:</span> {user?.phone}</p>
                                <p className="truncate"><span className="font-medium">NID:</span> {user?.nid}</p>
                                <p className="truncate"><span className="font-medium">DOB:</span> {user?.date_of_birth}</p>
                            </div>
                        </div>
                    </div>

                    {packageInfo && (
                        <div className={`border-t ${designStyle.headerBorder} pt-2 mt-2`}>
                            <div className={`${designStyle.footerBg} rounded px-2 py-1 border ${designStyle.footerBorder}`}>
                                <p className={`text-[9px] font-bold ${designStyle.footerText} truncate`}>{packageInfo.name}</p>
                                {packageInfo.start_date && packageInfo.end_date && (
                                    <p className={`text-[7px] ${designStyle.subText}`}>
                                        {packageInfo.start_date} - {packageInfo.end_date}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Classic Design Layout - Centered with ornamental corners
    if (design === 'classic') {
        return (
            <div
                className={`id-card-front relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: '16px',
                }}
            >
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-amber-400 rounded-br-2xl"></div>

                <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                    <div className="mb-3">
                        <img src="/logo.png" alt="Logo" className="h-10 w-10 mx-auto mb-1 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        <h1 className={`text-xs font-bold ${designStyle.headerText}`}>{companyInfo.name || 'M/S Raj Travel'}</h1>
                        <p className={`text-[7px] ${designStyle.subText} font-medium`}>Hajj & Umrah Service</p>
                    </div>

                    <Avatar className={`h-24 w-24 border-4 ${designStyle.avatarBorder} shadow-xl mb-2`}>
                        <AvatarImage src={user?.avatar} alt={user?.fullName} />
                        <AvatarFallback className={`${designStyle.avatarBg} ${designStyle.avatarText} text-2xl font-bold`}>
                            {getInitials(user?.firstName, user?.lastName)}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-[12px] font-extrabold text-gray-900">{user?.fullName}</h2>
                    <p className="text-[10px] text-gray-700 mb-2">{user?.fullNameBn}</p>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[7px] text-gray-700">
                        <div className="text-right font-medium">Passport:</div>
                        <div className="text-left">{passport?.passport_number}</div>
                        <div className="text-right font-medium">Phone:</div>
                        <div className="text-left">{user?.phone}</div>
                        <div className="text-right font-medium">NID:</div>
                        <div className="text-left">{user?.nid}</div>
                        <div className="text-right font-medium">DOB:</div>
                        <div className="text-left">{user?.date_of_birth}</div>
                    </div>

                    {packageInfo && (
                        <div className={`mt-3 ${designStyle.footerBg} rounded-lg px-3 py-1.5 border-2 ${designStyle.footerBorder}`}>
                            <p className={`text-[8px] font-bold ${designStyle.footerText}`}>{packageInfo.name}</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Elegant Design Layout - Smooth rounded waves
    if (design === 'elegant') {
        return (
            <div
                className="id-card-front relative overflow-hidden bg-white border-2 border-purple-400 shadow-lg"
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: '16px',
                }}
            >
                {/* Smooth wave shapes */}
                <div className="absolute top-0 left-0 right-0">
                    <svg viewBox="0 0 400 100" className="w-full">
                        <path d="M0,40 Q100,0 200,40 T400,40 L400,0 L0,0 Z" fill="url(#waveGradient1)" />
                        <defs>
                            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 400 100" className="w-full">
                        <path d="M0,60 Q100,100 200,60 T400,60 L400,100 L0,100 Z" fill="url(#waveGradient2)" />
                        <defs>
                            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#c026d3" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                    <div className="mb-2">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8 mx-auto mb-1 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        <h1 className={`text-xs font-bold ${designStyle.headerText}`}>{companyInfo.name || 'M/S Raj Travel'}</h1>
                        <p className="text-[7px] text-purple-600">Pilgrim ID</p>
                    </div>

                    <Avatar className={`h-24 w-24 border-4 ${designStyle.avatarBorder} shadow-xl mb-2 ring-2 ring-purple-200`}>
                        <AvatarImage src={user?.avatar} alt={user?.fullName} />
                        <AvatarFallback className={`${designStyle.avatarBg} ${designStyle.avatarText} text-xl font-bold`}>
                            {getInitials(user?.firstName, user?.lastName)}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-[13px] font-extrabold text-gray-900">{user?.fullName}</h2>
                    <p className="text-[10px] text-gray-600 mb-1">{user?.fullNameBn}</p>

                    <div className="bg-purple-50 rounded-lg px-3 py-1.5 w-full max-w-[200px]">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7px]">
                            <span className="text-gray-600 text-right">ID:</span>
                            <span className="text-gray-900 font-semibold truncate">{passport?.passport_number}</span>
                            <span className="text-gray-600 text-right">Phone:</span>
                            <span className="text-gray-900 font-semibold truncate">{user?.phone}</span>
                        </div>
                    </div>

                    {packageInfo && (
                        <div className="mt-2">
                            <p className="text-[8px] font-bold text-purple-900">{packageInfo.name}</p>
                        </div>
                    )}
                </div>
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
                    borderRadius: '12px',
                }}
            >
                {/* Angular accent shapes */}
                <div className="absolute top-0 left-0 w-1/2 h-1/3 bg-linear-to-br from-blue-500/20 to-transparent" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/3 bg-linear-to-tl from-cyan-500/20 to-transparent" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}></div>

                <div className="relative h-full flex flex-col p-3">
                    <div className={`flex items-center gap-2 pb-2 mb-2 border-b-2 ${designStyle.headerBorder}`}>
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-md flex items-center justify-center border border-yellow-500">
                            <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <div>
                            <h1 className={`text-xs font-bold ${designStyle.headerText} uppercase tracking-wide`}>{companyInfo.name || 'M/S Raj Travel'}</h1>
                            <p className={`text-[7px] ${designStyle.subText}`}>Hajj & Umrah Services</p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                        <Avatar className={`h-20 w-20 border-2 ${designStyle.avatarBorder} shadow-lg flex-shrink-0`}>
                            <AvatarImage src={user?.avatar} alt={user?.fullName} />
                            <AvatarFallback className="bg-slate-600 text-cyan-300 font-bold text-xl">
                                {getInitials(user?.firstName, user?.lastName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-[11px] font-bold text-white">{user?.fullName}</h2>
                            <p className="text-[9px] text-gray-300 mb-1.5">{user?.fullNameBn}</p>
                            <div className="space-y-0.5 text-[7px] text-gray-300">
                                <p className="truncate"><span className="text-cyan-400">ID:</span> {passport?.passport_number}</p>
                                <p className="truncate"><span className="text-cyan-400">Phone:</span> {user?.phone}</p>
                                <p className="truncate"><span className="text-cyan-400">NID:</span> {user?.nid}</p>
                            </div>
                        </div>
                    </div>

                    {packageInfo && (
                        <div className={`${designStyle.footerBg} rounded px-2 py-1.5 mt-2`}>
                            <p className={`text-[8px] font-bold ${designStyle.footerText}`}>{packageInfo.name}</p>
                        </div>
                    )}

                    {/* Barcode simulation */}
                    <div className="mt-2 flex justify-center">
                        <div className="flex gap-[1px] h-8">
                            {[3,2,4,2,3,4,2,3,2,4,3,2,4,2,3,4,2,3].map((h, i) => (
                                <div key={i} className="bg-white w-[2px]" style={{ height: `${h * 2}px` }}></div>
                            ))}
                        </div>
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
