// ID Card Size Templates
export const IDCardSizes = {
    standard: {
        name: 'Standard Card',
        namebn: 'স্ট্যান্ডার্ড কার্ড',
        width: '3.375in',
        height: '2.125in',
        widthPx: 324,
        heightPx: 204,
    },
    large: {
        name: 'Large Card',
        namebn: 'বড় কার্ড',
        width: '4in',
        height: '3in',
        widthPx: 384,
        heightPx: 288,
    },
    medium: {
        name: 'Medium Card',
        namebn: 'মাঝারি কার্ড',
        width: '3.5in',
        height: '2.5in',
        widthPx: 336,
        heightPx: 240,
    },
    custom: {
        name: 'Custom Size',
        namebn: 'কাস্টম সাইজ',
        width: '3in',
        height: '2in',
        widthPx: 288,
        heightPx: 192,
    },
};

export const CardOrientations = {
    landscape: {
        name: 'Landscape',
        namebn: 'ল্যান্ডস্কেপ',
    },
    portrait: {
        name: 'Portrait',
        namebn: 'পোর্ট্রেট',
    },
};

/**
 * ID Card Design System
 * 
 * To add a new design:
 * 1. Add a new key to CardDesigns object below
 * 2. Provide name (English) and namebn (Bengali)
 * 3. Define front and back color themes
 * 4. Add corresponding layout in IDCardFront.jsx and IDCardBack.jsx
 * 5. The design will automatically appear in the modal selector
 * 
 * Each design should have:
 * - front: Colors and styles for the front side
 * - back: Colors and styles for the back side
 * - name: Display name in English
 * - namebn: Display name in Bengali
 * - description: (optional) Short description
 */

export const CardDesigns = {
    modern: {
        name: 'Modern',
        namebn: 'আধুনিক',
        description: 'Clean blue design',
        descriptionbn: 'পরিষ্কার নীল ডিজাইন',
        front: {
            gradient: 'from-blue-50 via-white to-blue-50',
            border: 'border-blue-200',
            headerBorder: 'border-blue-200',
            headerText: 'text-blue-900',
            subText: 'text-blue-600',
            avatarBorder: 'border-blue-300',
            avatarBg: 'bg-blue-100',
            avatarText: 'text-blue-700',
            footerBg: 'bg-blue-50',
            footerBorder: 'border-blue-100',
            footerText: 'text-blue-900',
            patternColor: '#3b82f6',
        },
        back: {
            gradient: 'from-green-50 via-white to-green-50',
            border: 'border-green-200',
            headerBorder: 'border-green-200',
            headerText: 'text-green-900',
            sectionBg: 'bg-green-50',
            sectionBorder: 'border-green-100',
            emergencyBg: 'bg-red-50',
            emergencyBorder: 'border-red-100',
            patternColor: '#10b981',
        },
    },
    classic: {
        name: 'Classic',
        namebn: 'ক্লাসিক',
        description: 'Traditional golden style',
        descriptionbn: 'ঐতিহ্যবাহী সোনালি স্টাইল',
        front: {
            gradient: 'from-amber-50 via-white to-amber-50',
            border: 'border-amber-300',
            headerBorder: 'border-amber-200',
            headerText: 'text-amber-900',
            subText: 'text-amber-700',
            avatarBorder: 'border-amber-400',
            avatarBg: 'bg-amber-100',
            avatarText: 'text-amber-800',
            footerBg: 'bg-amber-50',
            footerBorder: 'border-amber-200',
            footerText: 'text-amber-900',
            patternColor: '#f59e0b',
        },
        back: {
            gradient: 'from-orange-50 via-white to-orange-50',
            border: 'border-orange-300',
            headerBorder: 'border-orange-200',
            headerText: 'text-orange-900',
            sectionBg: 'bg-orange-50',
            sectionBorder: 'border-orange-200',
            emergencyBg: 'bg-red-50',
            emergencyBorder: 'border-red-200',
            patternColor: '#ea580c',
        },
    },
    
    elegant: {
        name: 'Elegant',
        namebn: 'মার্জিত',
        description: 'Smooth purple wave',
        descriptionbn: 'মসৃণ বেগুনী ঢেউ',
        front: {
            gradient: 'from-purple-500 via-pink-500 to-purple-600',
            border: 'border-purple-600',
            headerBorder: 'border-purple-400',
            headerText: 'text-white',
            subText: 'text-purple-100',
            avatarBorder: 'border-white',
            avatarBg: 'bg-purple-100',
            avatarText: 'text-purple-800',
            footerBg: 'bg-purple-800',
            footerBorder: 'border-purple-700',
            footerText: 'text-white',
            patternColor: '#a855f7',
        },
        back: {
            gradient: 'from-purple-500 via-pink-500 to-purple-600',
            border: 'border-purple-600',
            headerBorder: 'border-purple-400',
            headerText: 'text-white',
            sectionBg: 'bg-white/10',
            sectionBorder: 'border-white/20',
            emergencyBg: 'bg-pink-100',
            emergencyBorder: 'border-pink-300',
            patternColor: '#ec4899',
        },
    },
    
    corporate: {
        name: 'Corporate',
        namebn: 'করপোরেট',
        description: 'Professional navy design',
        descriptionbn: 'পেশাদার নেভি ডিজাইন',
        front: {
            gradient: 'from-slate-700 via-slate-800 to-slate-900',
            border: 'border-slate-600',
            headerBorder: 'border-yellow-500',
            headerText: 'text-yellow-400',
            subText: 'text-gray-300',
            avatarBorder: 'border-cyan-400',
            avatarBg: 'bg-slate-700',
            avatarText: 'text-cyan-300',
            footerBg: 'bg-white',
            footerBorder: 'border-gray-300',
            footerText: 'text-slate-900',
            patternColor: '#1e293b',
            accentColor: '#0ea5e9',
        },
        back: {
            gradient: 'from-white via-gray-50 to-white',
            border: 'border-slate-600',
            headerBorder: 'border-slate-300',
            headerText: 'text-slate-900',
            sectionBg: 'bg-slate-50',
            sectionBorder: 'border-slate-200',
            emergencyBg: 'bg-slate-700',
            emergencyBorder: 'border-slate-600',
            patternColor: '#cbd5e1',
        },
    },
    
    // ===== ADD MORE DESIGNS BELOW THIS LINE =====
};

export const PrintOrientations = {
    single: {
        name: 'Single Side',
        namebn: 'এক পাশে',
    },
    double: {
        name: 'Both Sides',
        namebn: 'উভয় পাশে',
    },
};
